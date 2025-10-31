-- Compter les entreprises par code ACT_ECON
-- À exécuter dans Supabase SQL Editor

-- 1. Total général
SELECT 'Total entreprises' as category, COUNT(*) as count
FROM businesses;

-- 2. Entreprises avec act_econ_code
SELECT 'Avec act_econ_code' as category, COUNT(*) as count
FROM businesses
WHERE act_econ_code IS NOT NULL;

-- 3. Entreprises sans act_econ_code
SELECT 'Sans act_econ_code' as category, COUNT(*) as count
FROM businesses
WHERE act_econ_code IS NULL;

-- 4. Entreprises avec code 0001 (placeholder)
SELECT 'Code 0001' as category, COUNT(*) as count
FROM businesses
WHERE act_econ_code = '0001';

-- 5. Entreprises avec code 0000
SELECT 'Code 0000' as category, COUNT(*) as count
FROM businesses
WHERE act_econ_code = '0000';

-- 6. Entreprises avec codes valides (≠ 0000, 0001, NULL)
SELECT 'Codes valides (≠ 0000, 0001)' as category, COUNT(*) as count
FROM businesses
WHERE act_econ_code IS NOT NULL
  AND act_econ_code != '0000'
  AND act_econ_code != '0001';

-- 7. Entreprises avec main_category_slug (déjà catégorisées)
SELECT 'Avec main_category_slug' as category, COUNT(*) as count
FROM businesses
WHERE main_category_slug IS NOT NULL;

-- 8. Entreprises sans main_category_slug
SELECT 'Sans main_category_slug' as category, COUNT(*) as count
FROM businesses
WHERE main_category_slug IS NULL;

-- 9. Distribution des codes ACT_ECON (top 20)
SELECT
  act_econ_code,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM businesses WHERE act_econ_code IS NOT NULL), 2) as percentage
FROM businesses
WHERE act_econ_code IS NOT NULL
GROUP BY act_econ_code
ORDER BY count DESC
LIMIT 20;

-- 10. Résumé complet en une seule requête
SELECT
  COUNT(*) as total_entreprises,
  COUNT(CASE WHEN act_econ_code IS NOT NULL THEN 1 END) as avec_act_econ,
  COUNT(CASE WHEN act_econ_code IS NULL THEN 1 END) as sans_act_econ,
  COUNT(CASE WHEN act_econ_code = '0001' THEN 1 END) as code_0001,
  COUNT(CASE WHEN act_econ_code = '0000' THEN 1 END) as code_0000,
  COUNT(CASE WHEN act_econ_code IS NOT NULL AND act_econ_code != '0000' AND act_econ_code != '0001' THEN 1 END) as codes_valides,
  COUNT(CASE WHEN main_category_slug IS NOT NULL THEN 1 END) as avec_category_slug,
  COUNT(CASE WHEN main_category_slug IS NULL THEN 1 END) as sans_category_slug
FROM businesses;
