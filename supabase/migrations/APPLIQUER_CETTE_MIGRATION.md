# 🚀 Migration Finale - Priorisation des Recherches

## ⚡ Instructions Simples

### Étape 1: Ouvre Supabase
1. Va sur https://supabase.com/dashboard
2. Clique sur ton projet
3. Clique sur **"SQL Editor"** dans le menu de gauche
4. Clique sur **"New Query"**

### Étape 2: Copie-Colle ce SQL

```sql
-- ================================================
-- MIGRATION: Amélioration de la recherche
-- ================================================

-- 1. Créer l'index de priorisation
CREATE INDEX IF NOT EXISTS idx_businesses_priority
ON businesses (
  is_claimed DESC NULLS LAST,
  (CASE WHEN data_source = 'manual' THEN 1 ELSE 0 END) DESC,
  created_at DESC
);

-- 2. Supprimer l'ancienne vue
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- 3. Recréer la vue avec le score de priorité
CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.slug as primary_main_category_slug,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  sc.slug as primary_sub_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en,
  CASE
    WHEN b.is_claimed = true THEN 3
    WHEN b.data_source = 'manual' THEN 2
    ELSE 1
  END as search_priority_score,
  lower(b.name) as name_lower,
  lower(b.address) as address_lower
FROM businesses b
LEFT JOIN business_categories bc ON b.id = bc.business_id AND bc.is_primary = true
LEFT JOIN sub_categories sc ON bc.sub_category_id = sc.id
LEFT JOIN main_categories mc ON sc.main_category_id = mc.id;

-- 4. Créer un index sur le nom en minuscules
CREATE INDEX IF NOT EXISTS idx_businesses_name_lower
ON businesses (lower(name));

-- 5. Afficher les résultats
DO $$
DECLARE
  claimed_count int;
  manual_count int;
  gmb_count int;
  total_count int;
BEGIN
  SELECT COUNT(*) INTO claimed_count FROM businesses WHERE is_claimed = true;
  SELECT COUNT(*) INTO manual_count FROM businesses WHERE data_source = 'manual';
  SELECT COUNT(*) INTO gmb_count FROM businesses WHERE data_source = 'gmb';
  SELECT COUNT(*) INTO total_count FROM businesses;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée!';
  RAISE NOTICE '';
  RAISE NOTICE 'Total: % entreprises', total_count;
  RAISE NOTICE 'Fiches réclamées: % (priorité 3)', claimed_count;
  RAISE NOTICE 'Fiches manuelles: % (priorité 2)', manual_count;
  RAISE NOTICE 'Fiches GMB: % (priorité 1)', gmb_count;
  RAISE NOTICE '';
END $$;
```

### Étape 3: Exécute
- Clique sur **"Run"** (ou Ctrl+Enter)
- Attends 10-30 secondes

### Étape 4: Vérifie
Tu devrais voir:
```
✅ Migration terminée!

Total: XXX entreprises
Fiches réclamées: XXX (priorité 3)
Fiches manuelles: XXX (priorité 2)
Fiches GMB: XXX (priorité 1)
```

---

## ✅ Qu'est-ce qui fonctionne maintenant?

### 1. Priorisation Intelligente ⭐
Les résultats de recherche sont triés dans cet ordre:
1. **Fiches réclamées** (`is_claimed = true`) → Score 3
2. **Fiches manuelles** (`data_source = 'manual'`) → Score 2
3. **Fiches GMB** (`data_source = 'gmb'`) → Score 1

### 2. Recherche Insensible à la Casse ✓
- "MONTREAL" trouve "Montréal"
- "restaurant" trouve "Restaurant", "RESTAURANT"
- "rennai" trouve "Rennai", "RENNAI"

---

## ⚠️ Note sur les Accents

**Limitation**: "rennai" ne trouvera PAS automatiquement "Rennaï"

**Pourquoi?** L'extension PostgreSQL `unaccent` nécessite des droits superuser que tu n'as peut-être pas sur Supabase.

**Solution alternative**:
- Contacte le support Supabase pour activer l'extension `unaccent`
- OU utilise la recherche avec le vrai accent: "rennaï"

---

## 🧪 Pour Tester

Après la migration, teste dans Supabase SQL Editor:

```sql
-- Voir les scores de priorité
SELECT
  name,
  city,
  search_priority_score,
  is_claimed,
  data_source,
  CASE search_priority_score
    WHEN 3 THEN '🏆 Réclamée'
    WHEN 2 THEN '📝 Manuelle'
    ELSE '📍 GMB'
  END as type
FROM businesses_enriched
ORDER BY search_priority_score DESC, created_at DESC
LIMIT 20;
```

---

## ❌ Si Tu As une Erreur

1. **Copie le message d'erreur complet**
2. **Envoie-le moi avec le numéro de ligne**
3. Je vais corriger immédiatement

---

## 🎉 Résultat Final

Une fois appliquée, cette migration garantit que:
- ✅ Les fiches réclamées apparaissent TOUJOURS en premier
- ✅ Les fiches créées manuellement sont prioritaires sur les imports GMB
- ✅ La recherche fonctionne en majuscules/minuscules
- ✅ Les performances sont optimisées avec des index

**C'est tout!** 🚀
