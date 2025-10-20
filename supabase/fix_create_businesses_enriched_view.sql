-- ============================================
-- FIX URGENT: Recréer la vue businesses_enriched
-- ============================================
-- Cette vue est nécessaire pour le moteur de recherche

-- Drop existing view if any
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- Recreate the view with category slugs
CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.slug as primary_main_category_slug,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  sc.slug as primary_sub_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en
FROM businesses b
LEFT JOIN business_categories bc ON b.id = bc.business_id AND bc.is_primary = true
LEFT JOIN sub_categories sc ON bc.sub_category_id = sc.id
LEFT JOIN main_categories mc ON sc.main_category_id = mc.id;

-- Verify the view was created
SELECT COUNT(*) as total_businesses FROM businesses_enriched;

-- Show sample records
SELECT
  id,
  name,
  city,
  primary_main_category_fr,
  primary_sub_category_fr
FROM businesses_enriched
LIMIT 5;
