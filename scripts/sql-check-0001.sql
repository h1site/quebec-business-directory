-- ================================================================
-- VÉRIFICATION ENTREPRISES avec act_econ_code = '0001'
-- ================================================================
-- Copie-colle ce SQL dans Supabase SQL Editor
-- ================================================================

-- 1. STATISTIQUES GLOBALES
SELECT
  'TOTAL avec code 0001' as description,
  COUNT(*) as count
FROM businesses
WHERE act_econ_code = '0001'

UNION ALL

SELECT
  'Avec main_category_id assigné' as description,
  COUNT(*) as count
FROM businesses
WHERE act_econ_code = '0001'
  AND main_category_id IS NOT NULL

UNION ALL

SELECT
  'Sans main_category_id (NULL)' as description,
  COUNT(*) as count
FROM businesses
WHERE act_econ_code = '0001'
  AND main_category_id IS NULL;


-- ================================================================
-- 2. ÉCHANTILLON 20 ENTREPRISES avec code 0001 ET main_category_id
-- ================================================================

SELECT
  b.neq,
  b.name,
  b.act_econ_code,
  b.main_category_id,
  b.main_category_slug,
  b.categories,
  mc.name_fr as category_name,
  mc.slug as category_slug
FROM businesses b
LEFT JOIN main_categories mc ON b.main_category_id = mc.id
WHERE b.act_econ_code = '0001'
  AND b.main_category_id IS NOT NULL
ORDER BY b.created_at DESC
LIMIT 20;


-- ================================================================
-- 3. RÉPARTITION PAR CATÉGORIE pour les entreprises avec code 0001
-- ================================================================

SELECT
  mc.name_fr as category_name,
  mc.slug as category_slug,
  COUNT(*) as count
FROM businesses b
JOIN main_categories mc ON b.main_category_id = mc.id
WHERE b.act_econ_code = '0001'
  AND b.main_category_id IS NOT NULL
GROUP BY mc.id, mc.name_fr, mc.slug
ORDER BY count DESC;


-- ================================================================
-- 4. ENTREPRISES PROBLÉMATIQUES (code 0001 MAIS dans une catégorie)
-- ================================================================

SELECT
  b.neq,
  b.name,
  b.city,
  b.act_econ_code,
  mc.name_fr as assigned_category,
  b.categories as manual_categories,
  b.created_at,
  b.updated_at
FROM businesses b
JOIN main_categories mc ON b.main_category_id = mc.id
WHERE b.act_econ_code = '0001'
  AND b.main_category_id IS NOT NULL
  AND (b.categories IS NULL OR b.categories = '[]')
ORDER BY b.updated_at DESC
LIMIT 50;
