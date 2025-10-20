# Guide d'Import des Entreprises du REQ

Ce guide explique comment importer en masse des milliers d'entreprises québécoises depuis le **Registre des Entreprises du Québec (REQ)** et implémenter un système de réclamation pour que les propriétaires puissent réclamer leur fiche.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Étape 1 : Télécharger le dataset REQ](#étape-1--télécharger-le-dataset-req)
4. [Étape 2 : Exécuter les migrations](#étape-2--exécuter-les-migrations)
5. [Étape 3 : Importer les données](#étape-3--importer-les-données)
6. [Étape 4 : Assigner les catégories](#étape-4--assigner-les-catégories)
7. [Système de réclamation](#système-de-réclamation)
8. [Statistiques et monitoring](#statistiques-et-monitoring)

---

## Vue d'ensemble

### Qu'est-ce que le REQ ?

Le **Registre des Entreprises du Québec** est la base de données officielle du gouvernement du Québec contenant toutes les entreprises incorporées/enregistrées au Québec.

### Données disponibles (GRATUITES)

- ✅ **NEQ** (Numéro d'Entreprise du Québec) - Identifiant unique
- ✅ **Nom de l'entreprise**
- ✅ **Adresse du domicile**
- ✅ **Ville**
- ✅ **Code postal**
- ✅ **Code SCIAN** (2 activités principales)
- ✅ **Statut** (actif/inactif)
- ✅ **Forme juridique**
- ❌ **Téléphone** (non inclus)
- ❌ **Email** (non inclus)
- ❌ **Site web** (non inclus)

### Enrichissement automatique

Après import du REQ, notre système :

1. **Assigne automatiquement** la région et MRC basé sur la ville
2. **Catégorise automatiquement** via mapping SCIAN → Catégories (85%+ précision)
3. **Génère slug SEO** unique pour chaque entreprise
4. **Permet réclamation** par les propriétaires pour enrichir les données

---

## Prérequis

### 1. Logiciels requis

```bash
- Node.js v18+
- Supabase (compte + projet configuré)
- Git
```

### 2. Variables d'environnement

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_KEY=votre-service-key  # Pour le script d'import
```

### 3. Dépendances Node.js

```bash
npm install csv-parser @supabase/supabase-js
```

---

## Étape 1 : Télécharger le dataset REQ

### 📥 Source officielle

1. Visitez : https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises
2. Cliquez sur "Télécharger" pour le fichier CSV
3. Sauvegardez le fichier dans : `data/req-entreprises.csv`

```bash
# Créer le dossier data s'il n'existe pas
mkdir -p data

# Placer le fichier téléchargé
mv ~/Downloads/registre-entreprises.csv data/req-entreprises.csv
```

### 📊 Taille du dataset

- **~150,000 entreprises actives** au Québec
- Fichier CSV : ~50-100 MB
- Temps de téléchargement : 2-5 minutes

---

## Étape 2 : Exécuter les migrations

### Migration principale

Cette migration ajoute :
- Colonnes pour tracking REQ (neq, scian_code, is_claimed, etc.)
- Table `scian_category_mapping` avec ~80 mappings SCIAN → Catégories
- Table `business_claims` pour gérer les réclamations

```bash
# Dans Supabase SQL Editor, exécuter :
supabase/migration_add_req_import_support.sql
```

### Vérification

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('scian_category_mapping', 'business_claims');

-- Vérifier les mappings SCIAN
SELECT COUNT(*) as total_mappings FROM scian_category_mapping;
-- Devrait retourner ~80 mappings
```

---

## Étape 3 : Importer les données

### Import complet (toutes les entreprises)

```bash
node scripts/import-req-businesses.js
```

### Import limité (test avec 1000 entreprises)

```bash
node scripts/import-req-businesses.js --limit=1000
```

### Mode dry-run (aperçu sans insertion)

```bash
node scripts/import-req-businesses.js --limit=10 --dry-run
```

### Sortie attendue

```
🚀 Import des entreprises depuis le REQ
📂 Lecture du fichier CSV: data/req-entreprises.csv
✅ Importé 100/100 entreprises (100%)
✅ Importé 500/500 entreprises (100%)
...
✅ Import terminé!
═══════════════════════════════════════════════════
📊 Statistiques:
   Total lu:        10000
   Total inséré:    9850
   Erreurs:         150
   Avec location:   9200 (92%)
   Avec SCIAN:      8500 (85%)
═══════════════════════════════════════════════════
```

### Temps d'exécution estimé

- **1,000 entreprises** : ~2-3 minutes
- **10,000 entreprises** : ~15-20 minutes
- **150,000 entreprises** : ~3-4 heures

---

## Étape 4 : Assigner les catégories

Une fois les entreprises importées, assignez automatiquement les catégories basées sur les codes SCIAN.

### Assignment automatique

```bash
node scripts/assign-categories-from-scian.js
```

### Options

```bash
# Limiter à 1000 entreprises
node scripts/assign-categories-from-scian.js --limit=1000

# Mode dry-run pour voir les assignations
node scripts/assign-categories-from-scian.js --limit=100 --dry-run
```

### Sortie attendue

```
🏷️  Assignment automatique des catégories basées sur SCIAN
✅ Trouvé 8500 entreprises avec code SCIAN

🔍 [DRY-RUN] Restaurant Chez Mario (Montréal)
   SCIAN: 722511 → 7225 (Restaurants à service complet)
   Confidence: 95%

✅ Assignment terminé!
═══════════════════════════════════════════════════
📊 Statistiques:
   Total traité:           8500
   Catégories assignées:   7200 (85%)
   Déjà assignées:         0
   SCIAN non mappé:        1300 (15%)
═══════════════════════════════════════════════════
```

### Améliorer le taux de catégorisation

Si le taux est inférieur à 80%, ajoutez plus de mappings SCIAN dans :
```
supabase/migration_add_req_import_support.sql
```

Consultez la liste complète des codes SCIAN :
https://www23.statcan.gc.ca/imdb/p3VD_f.pl?Function=getVD&TVD=1181553

---

## Système de réclamation

### Concept

Les entreprises importées du REQ ont :
- `owner_id` = NULL (non réclamées)
- `is_claimed` = false
- `data_source` = 'req'

Les propriétaires peuvent **réclamer leur fiche** pour :
- Prendre ownership
- Ajouter photos, horaires, description
- Enrichir les informations
- Obtenir badge "Vérifié ✓"

### Workflow de réclamation

```mermaid
graph LR
    A[User voit fiche non réclamée] --> B[Clique "Réclamer cette fiche"]
    B --> C[Remplit formulaire vérification]
    C --> D[Upload documents NEQ/facture]
    D --> E[Soumission claim]
    E --> F[Admin review]
    F --> G{Approuvé?}
    G -->|Oui| H[Transfer ownership]
    G -->|Non| I[Rejet avec raison]
    H --> J[Email confirmation]
    J --> K[User peut éditer fiche]
```

### Table business_claims

```sql
SELECT
  bc.id,
  b.name as business_name,
  b.neq,
  bc.claimant_name,
  bc.claimant_email,
  bc.status,
  bc.created_at
FROM business_claims bc
JOIN businesses b ON b.id = bc.business_id
WHERE bc.status = 'pending'
ORDER BY bc.created_at DESC;
```

---

## Statistiques et monitoring

### Entreprises par source

```sql
SELECT
  data_source,
  COUNT(*) as total,
  COUNT(CASE WHEN is_claimed THEN 1 END) as claimed,
  ROUND(COUNT(CASE WHEN is_claimed THEN 1 END)::numeric / COUNT(*) * 100, 2) as claim_rate
FROM businesses
GROUP BY data_source;
```

### Couverture géographique

```sql
SELECT
  region,
  COUNT(*) as total_businesses,
  COUNT(DISTINCT city) as cities,
  COUNT(CASE WHEN is_claimed THEN 1 END) as claimed
FROM businesses
WHERE data_source = 'req'
GROUP BY region
ORDER BY total_businesses DESC;
```

### Catégorisation automatique

```sql
SELECT
  COUNT(*) as total_req,
  COUNT(CASE WHEN auto_categorized THEN 1 END) as auto_categorized,
  ROUND(COUNT(CASE WHEN auto_categorized THEN 1 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM businesses
WHERE data_source = 'req';
```

### Top catégories assignées

```sql
SELECT
  mc.label_fr as categorie,
  COUNT(DISTINCT b.id) as total_businesses
FROM businesses b
JOIN business_categories bc ON bc.business_id = b.id
JOIN sub_categories sc ON sc.id = bc.sub_category_id
JOIN main_categories mc ON mc.id = sc.main_category_id
WHERE b.data_source = 'req'
GROUP BY mc.label_fr
ORDER BY total_businesses DESC
LIMIT 10;
```

---

## FAQ

### Q: Le dataset REQ est-il vraiment gratuit ?

**R:** Oui, 100% gratuit. C'est une initiative de données ouvertes du gouvernement du Québec.

### Q: À quelle fréquence le dataset est-il mis à jour ?

**R:** Le dataset est mis à jour mensuellement sur Données Québec.

### Q: Peut-on géocoder les adresses gratuitement ?

**R:** Oui, utilisez Nominatim (OpenStreetMap) :
```bash
npm install node-geocoder
```

Mais c'est plus lent que Google Geocoding API.

### Q: Comment gérer les doublons avec Google Import ?

**R:** Vérifiez d'abord si NEQ existe :

```javascript
const { data: existing } = await supabase
  .from('businesses')
  .select('id')
  .eq('neq', neq)
  .single();

if (existing) {
  // Fusionner ou ignorer
}
```

### Q: Les entreprises importées ont-elles des photos ?

**R:** Non. Les photos peuvent être ajoutées :
1. Manuellement après réclamation
2. Via Google Places API (si fiche réclamée)
3. Upload par propriétaire

---

## Prochaines étapes

1. ✅ Import REQ
2. ✅ Assignment catégories automatique
3. 🔜 Implémenter UI de réclamation (`ClaimBusinessModal.jsx`)
4. 🔜 Dashboard admin réclamations (`AdminClaims.jsx`)
5. 🔜 Système d'emails notifications
6. 🔜 Badge "Vérifié" sur fiches réclamées

---

## Support

Pour questions ou problèmes :
- Email: Groupe.EOS@req.gouv.qc.ca (support dataset REQ)
- GitHub Issues: [Créer une issue](https://github.com/votre-repo/issues)

---

## Licence

Le dataset REQ est sous licence ouverte du gouvernement du Québec.
Ce script d'import est sous licence MIT.
