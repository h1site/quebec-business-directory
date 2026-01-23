# Fix Rapide pour Timeout - Exécution Manuelle

## Problème

Les index prennent trop de temps à créer et causent des timeouts même avec les scripts simplifiés.

## Solution Ultra-Simple

Exécute ces commandes **UNE PAR UNE** dans Supabase SQL Editor.

---

## Étape 1: Extension (5 secondes)

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Clique **Run** → Attends succès

---

## Étape 2: Augmente le Timeout (1 seconde)

```sql
SET statement_timeout = '10min';
```

⚠️ **IMPORTANT:** Cette commande s'applique UNIQUEMENT à la session courante. Tu devras la ré-exécuter avant CHAQUE index.

---

## Étape 3: Index Slug (2-5 min)

**Exécute d'abord:**
```sql
SET statement_timeout = '10min';
```

**Puis exécute:**
```sql
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;
```

**Résultat attendu:**
```
CREATE INDEX
Query returned successfully
```

---

## Étape 4: Index City (3-5 min)

**Exécute d'abord:**
```sql
SET statement_timeout = '10min';
```

**Puis exécute:**
```sql
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;
```

---

## Étape 5: Index Owner (2-3 min)

**Exécute d'abord:**
```sql
SET statement_timeout = '10min';
```

**Puis exécute:**
```sql
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;
```

---

## Étape 6: Index Category (2-3 min)

**Exécute d'abord:**
```sql
SET statement_timeout = '10min';
```

**Puis exécute:**
```sql
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug) WHERE main_category_slug IS NOT NULL;
```

---

## Étape 7: Index Reviews (1-2 min)

**Exécute d'abord:**
```sql
SET statement_timeout = '10min';
```

**Puis exécute:**
```sql
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
```

---

## Étape 8: Index Website (2-3 min)

**Exécute d'abord:**
```sql
SET statement_timeout = '10min';
```

**Puis exécute:**
```sql
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL AND website != '';
```

---

## Étape 9: Fonctions RPC (< 1 min)

Pas besoin d'augmenter timeout pour les fonctions:

```sql
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
```

---

## Vérification Finale

Vérifie que tous les index sont créés:

```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN ('businesses', 'reviews')
AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

Tu devrais voir:
- ✅ idx_businesses_city
- ✅ idx_businesses_main_category_slug
- ✅ idx_businesses_owner_id
- ✅ idx_businesses_slug
- ✅ idx_businesses_website
- ✅ idx_reviews_user_id

---

## Index Optionnels (Skip si Timeouts)

Ces index sont utiles mais pas critiques:

### Index Region
```sql
SET statement_timeout = '10min';
CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region) WHERE region IS NOT NULL;
```

### Index AI Enriched
```sql
SET statement_timeout = '10min';
CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched_at ON businesses(ai_enriched_at) WHERE ai_enriched_at IS NOT NULL;
```

### Index Trigram (TRÈS LOURD - 10-20 min)
⚠️ Ne fais ceci que si les recherches par nom sont très lentes:

```sql
SET statement_timeout = '30min';
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON businesses USING gin(name gin_trgm_ops);
```

---

## Ordre de Priorité

Si tu manques de temps, fais AU MINIMUM:

1. ✅ Extension pg_trgm
2. ✅ Index slug
3. ✅ Index city
4. ✅ Index owner_id
5. ✅ Fonctions RPC

Le reste peut attendre.

---

## Pourquoi les Timeouts?

Supabase SQL Editor a un timeout par défaut court (~2 minutes). Créer des index sur 48k+ lignes peut prendre 5-10 minutes par index.

**Solution:** Augmenter explicitement le timeout avec `SET statement_timeout` avant chaque opération lourde.

---

## Alternative: psql Direct

Si les timeouts persistent, connecte-toi directement via psql:

```bash
# Récupère la connection string depuis Supabase Dashboard
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Puis exécute les commandes SQL directement
```

psql n'a pas de timeout par défaut.

---

**Commence maintenant avec l'Étape 1!** 🚀
