# 🚀 Solution Simple - Migration en 1 Étape

## ⚠️ Utilise cette solution si l'extension unaccent ne fonctionne pas

Cette solution **fonctionne sur tous les environnements Supabase** sans nécessiter d'extension spéciale.

---

## 📋 Une seule étape!

1. Va sur https://supabase.com/dashboard
2. Clique sur **"SQL Editor"**
3. Clique sur **"New Query"**
4. Copie-colle **TOUT** le contenu ci-dessous:

```sql
-- Créer l'index de priorisation
CREATE INDEX IF NOT EXISTS idx_businesses_priority
ON businesses (
  is_claimed DESC NULLS LAST,
  (CASE WHEN source = 'manual' THEN 1 ELSE 0 END) DESC,
  created_at DESC
);

-- Supprimer l'ancienne vue
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- Recréer la vue avec le score de priorité
CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.id as main_category_id,
  mc.slug as main_category_slug,
  mc.label_fr as main_category_label_fr,
  mc.label_en as main_category_label_en,
  sc.id as sub_category_id,
  sc.slug as sub_category_slug,
  sc.label_fr as sub_category_label_fr,
  sc.label_en as sub_category_label_en,
  bs.id as business_size_id,
  bs.label_fr as business_size_label_fr,
  bs.label_en as business_size_label_en,
  CASE
    WHEN b.is_claimed = true THEN 3
    WHEN b.source = 'manual' THEN 2
    ELSE 1
  END as search_priority_score,
  lower(b.name) as name_lower,
  lower(b.address) as address_lower
FROM businesses b
LEFT JOIN main_categories mc ON b.main_category_id = mc.id
LEFT JOIN sub_categories sc ON b.sub_category_id = sc.id
LEFT JOIN business_sizes bs ON b.business_size_id = bs.id;

-- Créer un index sur le nom en minuscules
CREATE INDEX IF NOT EXISTS idx_businesses_name_lower
ON businesses (lower(name));
```

5. Clique sur **"Run"**
6. Attends 1-2 minutes (création des index)
7. ✅ C'est terminé!

---

## ✅ Ce qui fonctionne

### 1. Priorisation des fiches ✅
Les fiches sont maintenant triées dans cet ordre:
1. **Fiches réclamées** (is_claimed = true) → Score 3
2. **Fiches manuelles** (source = 'manual') → Score 2
3. **Fiches GMB** (source = 'gmb') → Score 1

### 2. Recherche insensible à la casse ✅
- "MONTREAL" trouve "Montréal"
- "restaurant" trouve "Restaurant"
- "RENNAI" trouve "Rennai"

---

## ⚠️ Limitation

**Recherche avec accents**: Cette solution ne gère pas parfaitement les accents.
- ❌ "rennai" ne trouvera **pas** "Rennaï" automatiquement
- ✅ "rennai" trouvera "Rennai", "RENNAI", "rennAi"

**Pourquoi?** L'extension `unaccent` nécessite des droits superuser que tu n'as peut-être pas sur Supabase.

**Solution alternative**: Tu pourrais contacter le support Supabase pour qu'ils activent l'extension `unaccent` sur ton projet.

---

## 🧪 Test

Pour vérifier que ça fonctionne:

```sql
-- Voir les scores de priorité
SELECT
  search_priority_score,
  COUNT(*) as nombre,
  CASE
    WHEN search_priority_score = 3 THEN '✅ Fiches réclamées'
    WHEN search_priority_score = 2 THEN '📝 Fiches manuelles'
    ELSE '📍 Fiches GMB'
  END as type
FROM businesses_enriched
GROUP BY search_priority_score
ORDER BY search_priority_score DESC;

-- Test de recherche insensible à la casse
SELECT name, search_priority_score, is_claimed, source
FROM businesses_enriched
WHERE name_lower LIKE '%restaurant%'
ORDER BY search_priority_score DESC, created_at DESC
LIMIT 10;
```

---

## 🎉 Résultat

L'application utilise maintenant:
- ✅ **Tri par priorité**: Claimed > Manual > GMB
- ✅ **Tri par date**: Plus récentes en premier
- ✅ **Recherche insensible à la casse**

C'est déjà un **gros progrès**! Les fiches réclamées et manuelles seront **toujours en tête** des résultats de recherche.

---

## 📞 Besoin d'aide?

Si tu as une erreur, envoie-moi:
1. Le message d'erreur complet
2. Capture d'écran du SQL Editor
