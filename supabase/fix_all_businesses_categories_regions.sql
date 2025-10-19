-- Script to ensure ALL businesses have region and primary category assigned
-- This will help ensure tags display correctly on all business detail pages

-- ============================================
-- PART 1: UPDATE REGIONS FOR ALL BUSINESSES
-- ============================================

-- Update businesses that have a city but no region
-- Map cities to their regions based on Quebec administrative regions

UPDATE public.businesses
SET region = CASE
  -- Montérégie
  WHEN city ILIKE '%Vaudreuil%' OR city ILIKE '%Dorion%' THEN 'Montérégie'
  WHEN city ILIKE '%Salaberry%' OR city ILIKE '%Valleyfield%' THEN 'Montérégie'
  WHEN city ILIKE '%Saint-Jean%' OR city ILIKE '%Richelieu%' THEN 'Montérégie'
  WHEN city ILIKE '%Longueuil%' OR city ILIKE '%Brossard%' THEN 'Montérégie'
  WHEN city ILIKE '%Saint-Hyacinthe%' OR city ILIKE '%Granby%' THEN 'Montérégie'

  -- Montréal
  WHEN city ILIKE '%Montréal%' OR city ILIKE '%Montreal%' THEN 'Montréal'
  WHEN city ILIKE '%Westmount%' OR city ILIKE '%Outremont%' THEN 'Montréal'

  -- Laval
  WHEN city ILIKE '%Laval%' THEN 'Laval'

  -- Laurentides
  WHEN city ILIKE '%Saint-Jérôme%' OR city ILIKE '%Sainte-Agathe%' THEN 'Laurentides'
  WHEN city ILIKE '%Mont-Tremblant%' OR city ILIKE '%Sainte-Adèle%' THEN 'Laurentides'

  -- Lanaudière
  WHEN city ILIKE '%Joliette%' OR city ILIKE '%Repentigny%' THEN 'Lanaudière'
  WHEN city ILIKE '%Terrebonne%' OR city ILIKE '%Mascouche%' THEN 'Lanaudière'

  -- Capitale-Nationale
  WHEN city ILIKE '%Québec%' OR city ILIKE '%Quebec%' THEN 'Capitale-Nationale'
  WHEN city ILIKE '%Lévis%' OR city ILIKE '%Sainte-Foy%' THEN 'Capitale-Nationale'

  -- Estrie
  WHEN city ILIKE '%Sherbrooke%' OR city ILIKE '%Magog%' THEN 'Estrie'

  -- Mauricie
  WHEN city ILIKE '%Trois-Rivières%' OR city ILIKE '%Shawinigan%' THEN 'Mauricie'

  -- Saguenay-Lac-Saint-Jean
  WHEN city ILIKE '%Saguenay%' OR city ILIKE '%Chicoutimi%' THEN 'Saguenay-Lac-Saint-Jean'

  -- Outaouais
  WHEN city ILIKE '%Gatineau%' OR city ILIKE '%Hull%' THEN 'Outaouais'

  -- Abitibi-Témiscamingue
  WHEN city ILIKE '%Rouyn-Noranda%' OR city ILIKE '%Val-d''Or%' THEN 'Abitibi-Témiscamingue'

  -- Côte-Nord
  WHEN city ILIKE '%Baie-Comeau%' OR city ILIKE '%Sept-Îles%' THEN 'Côte-Nord'

  -- Bas-Saint-Laurent
  WHEN city ILIKE '%Rimouski%' OR city ILIKE '%Rivière-du-Loup%' THEN 'Bas-Saint-Laurent'

  -- Gaspésie-Îles-de-la-Madeleine
  WHEN city ILIKE '%Gaspé%' OR city ILIKE '%Îles-de-la-Madeleine%' THEN 'Gaspésie-Îles-de-la-Madeleine'

  -- Chaudière-Appalaches
  WHEN city ILIKE '%Thetford%' OR city ILIKE '%Saint-Georges%' THEN 'Chaudière-Appalaches'

  -- Centre-du-Québec
  WHEN city ILIKE '%Drummondville%' OR city ILIKE '%Victoriaville%' THEN 'Centre-du-Québec'

  ELSE region -- Keep existing region if no match
END
WHERE region IS NULL OR region = '';

-- ============================================
-- PART 2: ASSIGN PRIMARY CATEGORIES
-- ============================================

-- This will assign a primary category to businesses that don't have one
-- Strategy: Use the first category from their existing categories array

DO $$
DECLARE
  v_business record;
  v_category_name text;
  v_sub_category_id uuid;
  v_assigned_count integer := 0;
BEGIN
  -- Loop through all businesses that don't have a primary category
  FOR v_business IN
    SELECT DISTINCT b.id, b.slug, b.name, b.categories
    FROM public.businesses b
    LEFT JOIN public.business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
    WHERE bc.business_id IS NULL -- No primary category assigned
      AND b.categories IS NOT NULL
      AND array_length(b.categories, 1) > 0 -- Has at least one category in the array
  LOOP
    -- Get the first category from the categories array
    v_category_name := v_business.categories[1];

    -- Try to find a matching sub-category
    SELECT id INTO v_sub_category_id
    FROM public.sub_categories
    WHERE label_fr ILIKE '%' || v_category_name || '%'
    LIMIT 1;

    -- If found, assign it as primary
    IF v_sub_category_id IS NOT NULL THEN
      INSERT INTO public.business_categories (business_id, sub_category_id, is_primary)
      VALUES (v_business.id, v_sub_category_id, true)
      ON CONFLICT (business_id, sub_category_id) DO UPDATE
      SET is_primary = true;

      v_assigned_count := v_assigned_count + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Assigned primary categories to % businesses', v_assigned_count;
END $$;

-- ============================================
-- PART 3: VERIFY RESULTS
-- ============================================

-- Show statistics
SELECT
  'Total businesses' as metric,
  COUNT(*) as count
FROM public.businesses
UNION ALL
SELECT
  'Businesses with region' as metric,
  COUNT(*) as count
FROM public.businesses
WHERE region IS NOT NULL AND region != ''
UNION ALL
SELECT
  'Businesses with primary category' as metric,
  COUNT(DISTINCT bc.business_id) as count
FROM public.business_categories bc
WHERE bc.is_primary = true
UNION ALL
SELECT
  'Businesses missing region' as metric,
  COUNT(*) as count
FROM public.businesses
WHERE region IS NULL OR region = ''
UNION ALL
SELECT
  'Businesses missing primary category' as metric,
  COUNT(*) as count
FROM public.businesses b
LEFT JOIN public.business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
WHERE bc.business_id IS NULL;

-- Show sample of businesses with complete data
SELECT
  b.name,
  b.city,
  b.region,
  mc.label_fr as main_category,
  sc.label_fr as sub_category
FROM public.businesses b
LEFT JOIN public.business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
LEFT JOIN public.sub_categories sc ON sc.id = bc.sub_category_id
LEFT JOIN public.main_categories mc ON mc.id = sc.main_category_id
WHERE b.region IS NOT NULL
  AND bc.business_id IS NOT NULL
LIMIT 10;
