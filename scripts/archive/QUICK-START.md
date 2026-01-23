# 🚀 Quick Start - Archivage des Businesses

## TL;DR

Tu as **480k lignes** dans businesses, mais seulement **~50k** sont actives.

**Ce script va:**
- Archiver ~430k businesses inactives (sans website ET sans trafic)
- Garder ~50k actives (avec website OU avec trafic Google)
- Libérer 90% des ressources
- Permettre la création des index

**Temps:** 15-20 minutes

---

## Exécution Pas-à-Pas

### 1. Ouvre Supabase SQL Editor

Dashboard → SQL Editor → New Query

### 2. Copie ÉTAPE 1 de `archive-businesses.sql`

Copie depuis:
```sql
-- ÉTAPE 1: Vérifier combien...
SELECT
  COUNT(*) as total_to_archive,
  ...
```

Jusqu'à la fin de l'ÉTAPE 1.

**Clique Run**

**Résultat attendu:** ~430,000 à archiver

---

### 3. Copie ÉTAPE 2

```sql
CREATE TABLE IF NOT EXISTS businesses_archive (
  LIKE businesses INCLUDING ALL
);
```

**Clique Run**

**Résultat:** Table créée

---

### 4. Copie ÉTAPE 3 (ATTENDS 2-5 min)

```sql
INSERT INTO businesses_archive
SELECT * FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (...tous les slugs...);
```

**Clique Run** et **ATTENDS** (peut prendre 2-5 minutes)

**Résultat:** ~430k lignes copiées

---

### 5. Copie ÉTAPE 4 (Vérification)

```sql
SELECT COUNT(*) as archived_count FROM businesses_archive;
```

**Clique Run**

**IMPORTANT:** Le nombre DOIT matcher l'étape 1!

---

### 6. Copie ÉTAPE 5 (DELETE - ATTENTION!)

⚠️ Seulement si l'étape 4 est OK!

```sql
DELETE FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (...);
```

**Clique Run** (peut prendre 1-2 min)

**Résultat:** ~430k lignes supprimées

---

### 7. Copie ÉTAPE 6 (Vérification finale)

```sql
SELECT
  COUNT(*) as remaining_businesses,
  COUNT(*) FILTER (WHERE website IS NOT NULL) as with_website,
  COUNT(*) FILTER (WHERE ai_enriched_at IS NOT NULL) as enriched
FROM businesses;
```

**Résultat attendu:**
- remaining_businesses: ~50-60k
- with_website: ~48k+
- enriched: ~48k

---

### 8. Copie ÉTAPE 7 (VACUUM - ATTENDS 5-10 min)

```sql
VACUUM FULL ANALYZE businesses;
```

**Clique Run** et **ATTENDS** (5-10 min)

**Résultat:** Espace libéré

---

### 9. Crée les Index (RAPIDE maintenant!)

```sql
CREATE INDEX idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX idx_businesses_website ON businesses(website) WHERE website IS NOT NULL;
ANALYZE businesses;
```

**Chaque index prend < 30 secondes!**

---

## Vérification Post-Archivage

### Dans Supabase Dashboard → Database

Attends 10 minutes puis vérifie:

**Avant:**
- CPU: 90-100%
- Memory: 90-100%
- Disk I/O: 90-100%

**Après:**
- CPU: 20-30% ✅
- Memory: 30-40% ✅
- Disk I/O: 10-20% ✅

### Cache Hit Ratio

```sql
SELECT
    ROUND(sum(heap_blks_hit) / NULLIF((sum(heap_blks_hit) + sum(heap_blks_read)), 0) * 100, 2) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

**Avant:** 73%
**Après:** >95% ✅

---

## Si Problème

### "Query timeout" sur ÉTAPE 3 ou 5

Essaie par batch:

```sql
-- Supprime 100k à la fois
DELETE FROM businesses
WHERE (website IS NULL OR website = '')
AND slug NOT IN (...)
AND id IN (
  SELECT id FROM businesses
  WHERE (website IS NULL OR website = '')
  LIMIT 100000
);
```

Répète 4-5 fois.

### "Not enough disk space"

Normal! VACUUM FULL va libérer l'espace.

---

## Rollback (si besoin)

Si tu veux tout annuler:

```sql
-- Restaurer depuis l'archive
INSERT INTO businesses SELECT * FROM businesses_archive;

-- Supprimer l'archive
DROP TABLE businesses_archive;
```

---

**Prêt? Lance ÉTAPE 1 maintenant!** 🚀

Questions? Vérifie [README.md](./README.md) pour les détails complets.
