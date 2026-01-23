# Solution Définitive: Connexion Directe via psql

## Problème

Supabase SQL Editor a des timeouts stricts qui ne peuvent pas être contournés, même avec `SET statement_timeout`. Les index prennent trop de temps à créer.

## Solution: Connecter via psql

psql n'a pas de timeout par défaut et peut créer les index sans problème.

---

## Étape 1: Obtenir la Connection String

### Dans Supabase Dashboard:

1. Va dans **Project Settings** → **Database**
2. Scroll vers **Connection string**
3. Sélectionne **Connection pooling** (Recommended) ou **Direct connection**
4. Copie la connection string (format: `postgresql://postgres.[ref]:[password]@[host]:5432/postgres`)

**Note:** Clique sur "Show password" pour révéler ton mot de passe

---

## Étape 2: Installer psql (si pas déjà installé)

### macOS (avec Homebrew):
```bash
brew install postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt-get install postgresql-client
```

### Windows:
Télécharge depuis https://www.postgresql.org/download/windows/

---

## Étape 3: Se Connecter

```bash
psql "postgresql://postgres.[ref]:[YOUR_PASSWORD]@[host]:5432/postgres"
```

Remplace `[ref]`, `[YOUR_PASSWORD]`, et `[host]` par tes vraies valeurs.

**Exemple:**
```bash
psql "postgresql://postgres.abcdefghijk:MyPassword123@db.abcdefghijk.supabase.co:5432/postgres"
```

---

## Étape 4: Créer TOUS les Index d'un Coup

Une fois connecté en psql, copie-colle tout ce bloc:

```sql
-- Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Index slug
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;

-- Index city
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;

-- Index region
CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region) WHERE region IS NOT NULL;

-- Index category
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug) WHERE main_category_slug IS NOT NULL;

-- Index owner
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;

-- Index website
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL AND website != '';

-- Index AI enriched
CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched_at ON businesses(ai_enriched_at) WHERE ai_enriched_at IS NOT NULL;

-- Index reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Fonctions RPC
CREATE OR REPLACE FUNCTION get_unique_cities(limit_count INTEGER DEFAULT 100)
RETURNS TABLE(city TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.city FROM businesses b
  WHERE b.city IS NOT NULL
  ORDER BY b.city LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_unique_regions()
RETURNS TABLE(region TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.region FROM businesses b
  WHERE b.region IS NOT NULL
  ORDER BY b.region;
END;
$$ LANGUAGE plpgsql STABLE;

-- Vérification
SELECT indexname FROM pg_indexes WHERE tablename IN ('businesses', 'reviews') AND indexname LIKE 'idx_%' ORDER BY indexname;
```

Appuie sur **Enter** et attends. Ça peut prendre 10-20 minutes au total mais ça va marcher sans timeout.

Tu verras le progrès:
```
CREATE EXTENSION
CREATE INDEX
CREATE INDEX
CREATE INDEX
...
```

---

## Étape 5: Vérification

Une fois terminé, vérifie que tout est créé:

```sql
\di idx_businesses*
```

Ou:

```sql
SELECT indexname FROM pg_indexes
WHERE tablename = 'businesses'
AND indexname LIKE 'idx_%';
```

---

## Alternative: Script Batch

Crée un fichier `create_indexes.sql` avec tout le contenu ci-dessus, puis:

```bash
psql "postgresql://postgres.[ref]:[password]@[host]:5432/postgres" -f create_indexes.sql
```

---

## Troubleshooting

### "connection refused"
- Vérifie que ton IP est autorisée dans Supabase (Project Settings → Database → Connection pooling)
- Par défaut, Supabase autorise toutes les IPs

### "authentication failed"
- Double-check ton mot de passe
- Utilise des guillemets si le password contient des caractères spéciaux:
  ```bash
  psql "postgresql://postgres.ref:My\$Pass@host:5432/postgres"
  ```

### "SSL connection required"
Ajoute `?sslmode=require`:
```bash
psql "postgresql://postgres.ref:pass@host:5432/postgres?sslmode=require"
```

---

## Après la Création des Index

### 1. Vérifier l'Utilisation

Dans psql:
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans
FROM pg_stat_user_indexes
WHERE tablename IN ('businesses', 'reviews')
ORDER BY idx_scan DESC;
```

Après quelques heures, `idx_scan` devrait augmenter pour les index utilisés.

### 2. Analyser les Tables

```sql
ANALYZE businesses;
ANALYZE reviews;
```

Cela met à jour les statistiques pour que PostgreSQL utilise efficacement les index.

---

## Avantages de psql vs SQL Editor

| Critère | psql | SQL Editor |
|---------|------|------------|
| Timeout | ❌ Aucun | ✅ 2-10 min |
| Performance | ✅ Direct | ⚠️ Via proxy |
| Batch queries | ✅ Oui | ❌ Non |
| Monitoring | ✅ Progress visible | ❌ Loading spinner |

---

## Index Trigram (Optionnel)

Si tu as besoin de recherches rapides sur les noms (ILIKE '%text%'), ajoute aussi:

```sql
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm
ON businesses USING gin(name gin_trgm_ops);
```

⚠️ **Attention:** Cet index est TRÈS lourd (peut prendre 20-30 min). Ne le fais que si nécessaire.

---

## Résumé

1. ✅ Récupère connection string dans Supabase
2. ✅ Installe psql si nécessaire
3. ✅ Connecte: `psql "postgresql://..."`
4. ✅ Copie-colle tous les CREATE INDEX
5. ✅ Attends 10-20 min
6. ✅ Vérifie avec `\di`

**Cette méthode va marcher à 100%!** 🚀
