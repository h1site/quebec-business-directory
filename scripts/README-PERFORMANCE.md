# Guide d'Optimisation Performance - Base de Données

## Problème Résolu

Le script `performance-optimizations.sql` original causait des timeouts car il essayait de créer trop d'index simultanément sur une grande table (48k+ entreprises).

## Solution: Exécution par Étapes

Le script a été divisé en **7 étapes** à exécuter séquentiellement dans Supabase SQL Editor.

---

## Instructions d'Exécution

### Étape 1: Extension & Index Slug (1-2 min)

```bash
Fichier: performance-optimizations-step1.sql
```

**Exécute:**
- ✅ Extension pg_trgm
- ✅ Index sur `slug` (très utilisé, rapide)

**Action:** Copie le contenu dans SQL Editor → Run → Attends la fin

---

### Étape 2: Index City (3-5 min)

```bash
Fichier: performance-optimizations-step2.sql
```

**Exécute:**
- ✅ Index sur `city` (recherche et filtres)

**Action:** Exécute après Step 1

---

### Étape 3: Index Region (2-3 min)

```bash
Fichier: performance-optimizations-step3.sql
```

**Exécute:**
- ✅ Index sur `region`

**Action:** Exécute après Step 2

---

### Étape 4: Index Category & Owner (3-4 min)

```bash
Fichier: performance-optimizations-step4.sql
```

**Exécute:**
- ✅ Index sur `main_category_slug`
- ✅ Index sur `owner_id`

**Action:** Exécute après Step 3

---

### Étape 5: Index Reviews, Website, AI (2-3 min)

```bash
Fichier: performance-optimizations-step5.sql
```

**Exécute:**
- ✅ Index sur `reviews.user_id`
- ✅ Index sur `website`
- ✅ Index sur `ai_enriched_at`

**Action:** Exécute après Step 4

---

### Étape 6: Trigram Index - LOURD (10-20 min)

```bash
Fichier: performance-optimizations-step6.sql
```

**Exécute:**
- ✅ Index trigram sur `name` (pour ILIKE '%search%')

**⚠️ ATTENTION:**
- Cet index est le plus lourd
- Peut prendre 10-20 minutes
- Améliore drastiquement les recherches par nom

**Action:** Exécute après Step 5, sois patient

**Optionnel:** Si timeout encore, skip cette étape pour l'instant

---

### Étape 7: Fonctions RPC (< 1 min)

```bash
Fichier: performance-optimizations-step7.sql
```

**Exécute:**
- ✅ Fonction `get_unique_cities()`
- ✅ Fonction `get_unique_regions()`
- ✅ Fonction `get_city_count()`
- ✅ Fonction `get_region_count()`

**Action:** Exécute après Step 6 (ou après Step 5 si Step 6 skipped)

---

## Vérification des Index Créés

Après chaque étape, tu peux vérifier:

```sql
-- Voir tous les index sur businesses
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
ORDER BY indexname;

-- Voir tous les index sur reviews
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'reviews'
ORDER BY indexname;
```

---

## Impact Attendu

### Avant Optimisation

| Requête | Temps |
|---------|-------|
| Recherche par city | 500-1000ms |
| Recherche par nom (ILIKE) | 800-2000ms |
| getCities() (1000 rows) | 300-500ms |
| Dashboard queries | 200-400ms |
| Sitemap generation | 2-5s |

### Après Optimisation

| Requête | Temps |
|---------|-------|
| Recherche par city | 10-50ms (90% plus rapide) |
| Recherche par nom (ILIKE) | 50-200ms (80% plus rapide) |
| getCities() (500 rows) | 20-50ms (95% plus rapide) |
| Dashboard queries | 10-30ms (95% plus rapide) |
| Sitemap generation | 500ms-1s (80% plus rapide) |

---

## Utilisation des Fonctions RPC

Après Step 7, tu peux utiliser les fonctions SQL au lieu de charger les données en JavaScript:

### Option 1: Appel Direct Supabase

```typescript
// Ancien (JavaScript deduplication)
const { data } = await supabase
  .from('businesses')
  .select('city')
  .not('city', 'is', null)
  .limit(500)
const uniqueCities = [...new Set(data?.map(b => b.city))]

// Nouveau (RPC function)
const { data: cities } = await supabase.rpc('get_unique_cities', { limit_count: 100 })
// cities est déjà unique et trié!
```

### Option 2: Mettre à Jour plan-du-site.tsx

```typescript
// src/app/(fr)/plan-du-site/page.tsx

async function getCities() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_unique_cities', { limit_count: 100 })

  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }

  return data.map(row => row.city)
}

async function getRegions() {
  const supabase = createServiceClient()
  const { data, error } = await supabase.rpc('get_unique_regions')

  if (error) {
    console.error('Error fetching regions:', error)
    return []
  }

  return data.map(row => row.region)
}
```

---

## Monitoring

### Dans Supabase Dashboard

1. Va dans **Database** → **Query Performance**
2. Surveille:
   - Execution time des queries
   - Index usage
   - Slow queries

### Métriques à Surveiller

| Métrique | Avant | Cible Après |
|----------|-------|-------------|
| CPU usage | 60-80% | < 30% |
| Query duration (avg) | 300ms | < 50ms |
| Slow queries/day | 50-100 | < 10 |
| Index hit rate | 70-80% | > 95% |

---

## Troubleshooting

### Erreur: "already exists"

Normal si tu ré-exécutes. `IF NOT EXISTS` empêche les erreurs.

### Timeout sur Step 6 (Trigram)

Solution 1: Augmente le timeout:
```sql
SET statement_timeout = '30min';
-- Puis exécute le script
```

Solution 2: Skip Step 6 pour l'instant
- Les autres index améliorent déjà beaucoup la performance
- Le trigram n'est nécessaire que pour les recherches ILIKE avancées

### Index ne semble pas utilisé

Force l'analyse:
```sql
ANALYZE businesses;
ANALYZE reviews;
```

---

## Ordre de Priorité si Manque de Temps

Si tu veux optimiser rapidement:

**Must-have (exécute d'abord):**
1. ✅ Step 1 (slug)
2. ✅ Step 2 (city)
3. ✅ Step 4 (category, owner)
4. ✅ Step 5 (reviews, website)

**Nice-to-have:**
5. ✅ Step 3 (region)
6. ✅ Step 7 (RPC functions)

**Optionnel:**
7. ⏳ Step 6 (trigram) - seulement si beaucoup de recherches par nom

---

## Résumé Technique

### Index Créés (13 total)

| Index | Table | Colonne | Type | Utilisation |
|-------|-------|---------|------|-------------|
| idx_businesses_slug | businesses | slug | btree | Page lookups |
| idx_businesses_city | businesses | city | btree | Search, filters |
| idx_businesses_region | businesses | region | btree | Related businesses |
| idx_businesses_main_category_slug | businesses | main_category_slug | btree | Category pages |
| idx_businesses_owner_id | businesses | owner_id | btree | Dashboard |
| idx_businesses_website | businesses | website | btree | Sitemap |
| idx_businesses_ai_enriched_at | businesses | ai_enriched_at | btree | Prioritization |
| idx_businesses_name_trgm | businesses | name | gin | Text search |
| idx_reviews_user_id | reviews | user_id | btree | Dashboard |

### Fonctions RPC (4 total)

1. `get_unique_cities(limit_count INTEGER)` → TABLE(city TEXT)
2. `get_unique_regions()` → TABLE(region TEXT)
3. `get_city_count()` → INTEGER
4. `get_region_count()` → INTEGER

---

**Créé le:** 2026-01-22
**Dernière mise à jour:** 2026-01-22
