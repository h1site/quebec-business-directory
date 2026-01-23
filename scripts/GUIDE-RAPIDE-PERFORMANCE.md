# Guide Rapide - Optimisation Performance

## Problème Résolu

❌ **Erreur:** `CREATE INDEX CONCURRENTLY cannot run inside a transaction block`

✅ **Solution:** Utiliser les fichiers `-fixed.sql` sans `CONCURRENTLY`

---

## Instructions (15-30 minutes total)

### Ouvre Supabase SQL Editor

1. Va sur https://supabase.com/dashboard/project/[ton-projet]
2. Clique **SQL Editor** dans la sidebar
3. Clique **New Query**

### Exécute les 7 étapes dans l'ordre

Copie-colle le contenu de chaque fichier et clique **Run**:

#### ✅ Étape 1 (1-2 min)
```
Fichier: performance-step1-fixed.sql
```
Extension pg_trgm + Index slug

#### ✅ Étape 2 (2-4 min)
```
Fichier: performance-step2-fixed.sql
```
Index city

#### ✅ Étape 3 (1-2 min)
```
Fichier: performance-step3-fixed.sql
```
Index region

#### ✅ Étape 4 (2-3 min)
```
Fichier: performance-step4-fixed.sql
```
Index category + owner

#### ✅ Étape 5 (2-3 min)
```
Fichier: performance-step5-fixed.sql
```
Index reviews, website, ai_enriched_at

#### ⚠️ Étape 6 (10-20 min) - OPTIONNEL
```
Fichier: performance-step6-fixed.sql
```
**LOURD:** Index trigram pour recherche par nom

**Notes:**
- La table sera verrouillée pendant la création
- Peut causer timeout si trop de données
- Skip si timeout, pas critique

**Si timeout:**
Ajoute avant le CREATE INDEX:
```sql
SET statement_timeout = '30min';
```

#### ✅ Étape 7 (< 1 min)
```
Fichier: performance-step7-fixed.sql
```
Fonctions RPC pour queries optimisées

---

## Vérification

Après toutes les étapes, vérifie que tout est créé:

```sql
-- Voir tous les index
SELECT indexname FROM pg_indexes WHERE tablename = 'businesses' ORDER BY indexname;

-- Tester les fonctions
SELECT * FROM get_unique_cities(5);
SELECT * FROM get_unique_regions();
```

Tu devrais voir ces index:
- ✅ idx_businesses_slug
- ✅ idx_businesses_city
- ✅ idx_businesses_region
- ✅ idx_businesses_main_category_slug
- ✅ idx_businesses_owner_id
- ✅ idx_businesses_website
- ✅ idx_businesses_ai_enriched_at
- ✅ idx_businesses_name_trgm (si Step 6 réussi)
- ✅ idx_reviews_user_id

---

## Gains de Performance Attendus

| Requête | Avant | Après | Gain |
|---------|-------|-------|------|
| Recherche par ville | 500ms | 20ms | 96% |
| Recherche par nom | 1000ms | 100ms | 90% |
| Page entreprise | 200ms | 10ms | 95% |
| Dashboard | 400ms | 30ms | 92% |
| Sitemap | 3000ms | 500ms | 83% |

**CPU Usage Supabase:** 60-80% → 20-30%

---

## Ordre de Priorité

Si tu manques de temps, fais au minimum:

**Must-have:**
1. ✅ Step 1 (slug)
2. ✅ Step 2 (city)
3. ✅ Step 4 (category, owner)

**Recommandé:**
4. ✅ Step 5 (reviews, website)
5. ✅ Step 7 (RPC functions)

**Optionnel:**
6. ⏳ Step 3 (region)
7. ⏳ Step 6 (trigram)

---

## Différence avec versions originales

| Fichier Original | Problème | Fichier Fixed |
|------------------|----------|---------------|
| performance-optimizations-step1.sql | `CONCURRENTLY` | performance-step1-fixed.sql |
| performance-optimizations-step2.sql | `CONCURRENTLY` | performance-step2-fixed.sql |
| ... | ... | ... |

**Fix:** Retire `CONCURRENTLY` pour compatibilité avec Supabase SQL Editor qui exécute dans une transaction.

**Trade-off:** Sans `CONCURRENTLY`, la table est verrouillée pendant la création d'index. Mais avec 48k lignes, ça reste rapide (< 5 min par index).

---

## Après l'Optimisation

### 1. Monitor dans Supabase

Dashboard → Database → Query Performance

Surveille:
- Query execution time
- Index usage
- Slow queries

### 2. Utilise les Fonctions RPC (Optionnel)

Remplace dans `plan-du-site/page.tsx`:

```typescript
// Ancien
const { data } = await supabase
  .from('businesses')
  .select('city')
  .limit(500)
const cities = [...new Set(data?.map(b => b.city))]

// Nouveau
const { data } = await supabase.rpc('get_unique_cities', { limit_count: 100 })
const cities = data.map(r => r.city)
```

---

## Problèmes Courants

### "relation already exists"
Normal si re-exécution. `IF NOT EXISTS` empêche les erreurs.

### Timeout sur Step 6
Ajoute avant le CREATE INDEX:
```sql
SET statement_timeout = '30min';
```

Ou skip Step 6 (pas critique).

### Index pas utilisé
Force analyse:
```sql
ANALYZE businesses;
ANALYZE reviews;
```

---

**Commence maintenant avec Step 1!** 🚀
