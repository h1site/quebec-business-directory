# Fix: Duplicate NEQ Constraint Issue

## Problème identifié

Lors de l'import réel de 10 entreprises REQ, nous avons rencontré 2 erreurs successives:

### Erreur 1: Duplicate Slug Constraint
```
duplicate key value violates unique constraint "businesses_slug_key"
```

**Cause**: Le fichier CSV REQ (`Etablissements.csv`) contient plusieurs lignes pour un même NEQ quand une entreprise a plusieurs établissements (colonne `NO_SUF_ETAB`).

**Exemple**:
```csv
NEQ,NO_SUF_ETAB,NOM_ETAB,LIGN1_ADR
1140000994,1,9000-0951 QUÉBEC INC.,1691 ch. Principal
1140000994,2,9000-0951 QUÉBEC INC.,1679 ch. Principal
```

Sans le numéro d'établissement dans le slug, les deux lignes généraient le même slug: `9000-0951-quebec-inc-neq-1140000994`

### Erreur 2: Duplicate NEQ Constraint
```
duplicate key value violates unique constraint "businesses_neq_unique"
```

**Cause**: La table `businesses` avait une contrainte `UNIQUE` sur la colonne `neq` seule, mais un même NEQ peut légitimement avoir plusieurs établissements.

## Solution implémentée

### 1. Slug generation avec numéro d'établissement

**Fichier**: `scripts/import-req-businesses.js`

Modification de la fonction `generateSlug()`:
```javascript
function generateSlug(name, neq, etablissement) {
  const base = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);

  const suffix = neq || `tmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const etabSuffix = etablissement ? `-${etablissement}` : '';

  return `${base}-neq-${suffix}${etabSuffix}`;
}
```

**Résultat**:
- Établissement 1: `9000-0951-quebec-inc-neq-1140000994-1`
- Établissement 2: `9000-0951-quebec-inc-neq-1140000994-2`

### 2. Ajout de la colonne `etablissement_number`

**Fichier**: `supabase/migration_add_req_import_support.sql` (mis à jour)

```sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS etablissement_number VARCHAR(5) DEFAULT '1';
```

### 3. Contrainte composite NEQ + Établissement

**Fichier**: `supabase/migration_fix_neq_constraint.sql` (nouveau)

```sql
-- Supprimer ancienne contrainte
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_neq_unique;

-- Créer contrainte composite
ALTER TABLE businesses
ADD CONSTRAINT businesses_neq_etablissement_unique
UNIQUE (neq, etablissement_number);
```

Cela permet qu'un même NEQ existe plusieurs fois dans la table, tant que le numéro d'établissement est différent.

### 4. Mise à jour du script d'import

**Fichier**: `scripts/import-req-businesses.js`

- Extraction du `NO_SUF_ETAB` depuis le CSV
- Ajout du champ `etablissement_number` dans l'objet business
- Vérification de doublons basée sur `(neq, etablissement_number)` au lieu de juste `neq`

```javascript
// Parser
const etablissement = row.NO_SUF_ETAB || '1';

// Ajouter au business object
const business = {
  neq: neq,
  etablissement_number: etablissement,
  // ...
  slug: generateSlug(name, neq, etablissement)
};

// Duplicate check avec clé composite
const existingKeys = new Set(
  (existing || []).map(b => `${b.neq}-${b.etablissement_number}`)
);
const newBusinesses = businesses.filter(
  b => !existingKeys.has(`${b.neq}-${b.etablissement_number}`)
);
```

## Prochaines étapes

### 1. Appliquer la migration dans Supabase

Aller dans **Supabase Dashboard → SQL Editor** et exécuter:

```sql
-- Contenu de supabase/migration_fix_neq_constraint.sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS etablissement_number VARCHAR(5) DEFAULT '1';

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_neq_unique;

ALTER TABLE businesses
ADD CONSTRAINT businesses_neq_etablissement_unique
UNIQUE (neq, etablissement_number);
```

### 2. Tester l'import de 10 entreprises

```bash
node scripts/import-req-businesses.js --limit=10
```

Devrait maintenant réussir sans erreur de contrainte unique.

### 3. Vérifier les résultats

```bash
node scripts/check-slugs.js
```

### 4. Si succès, importer plus d'entreprises

```bash
# Importer 100 entreprises
node scripts/import-req-businesses.js --limit=100

# Ou 1000 entreprises
node scripts/import-req-businesses.js --limit=1000
```

### 5. Assigner les catégories automatiquement

```bash
node scripts/assign-categories-from-scian.js --limit=1000
```

## Fichiers modifiés

1. ✅ `scripts/import-req-businesses.js` - Ajout support établissement
2. ✅ `supabase/migration_add_req_import_support.sql` - Documentation mise à jour
3. ✅ `supabase/migration_fix_neq_constraint.sql` - Migration de correction (NOUVEAU)
4. ✅ `scripts/check-slugs.js` - Script de vérification (déjà créé)

## Concept important: Multi-établissements

Dans le REQ, un même NEQ (Numéro d'Entreprise du Québec) peut avoir:
- **Plusieurs établissements** (ex: Tim Hortons avec 50 succursales)
- Chaque établissement a un `NO_SUF_ETAB` unique (1, 2, 3, ...)
- L'établissement principal a `IND_ETAB_PRINC = 'O'`

Notre système doit supporter cela pour importer correctement toutes les données REQ.
