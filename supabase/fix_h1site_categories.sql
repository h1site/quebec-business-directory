-- Script to add categories and region to H1Site business

-- First, let's find the H1Site business ID
-- The slug is 'h1site'

-- Step 1: Update the region for H1Site
UPDATE public.businesses
SET region = 'Montérégie'
WHERE slug = 'h1site';

-- Step 2: Find the appropriate category IDs
-- We need to find or create categories for "Marketing et publicité" > "Agence de marketing digital"

-- Let's first check if these categories exist and get their IDs
-- Main category: Marketing et publicité
-- Sub-category: Agence de marketing digital or Web Design

-- Find main category ID for "Marketing et publicité" or similar
DO $$
DECLARE
  v_business_id uuid;
  v_main_category_id uuid;
  v_sub_category_id uuid;
BEGIN
  -- Get the business ID
  SELECT id INTO v_business_id
  FROM public.businesses
  WHERE slug = 'h1site';

  -- Try to find "Services professionnels" main category
  SELECT id INTO v_main_category_id
  FROM public.main_categories
  WHERE label_fr ILIKE '%marketing%' OR label_fr ILIKE '%publicité%' OR label_fr ILIKE '%services professionnels%'
  LIMIT 1;

  -- If not found, try to get any marketing-related category
  IF v_main_category_id IS NULL THEN
    SELECT id INTO v_main_category_id
    FROM public.main_categories
    WHERE label_fr ILIKE '%service%'
    LIMIT 1;
  END IF;

  -- Get sub-category for web design or marketing
  IF v_main_category_id IS NOT NULL THEN
    SELECT id INTO v_sub_category_id
    FROM public.sub_categories
    WHERE main_category_id = v_main_category_id
      AND (label_fr ILIKE '%web%' OR label_fr ILIKE '%marketing%' OR label_fr ILIKE '%design%')
    LIMIT 1;

    -- If no specific sub-category found, get any sub-category from this main category
    IF v_sub_category_id IS NULL THEN
      SELECT id INTO v_sub_category_id
      FROM public.sub_categories
      WHERE main_category_id = v_main_category_id
      LIMIT 1;
    END IF;
  END IF;

  -- Remove any existing primary category
  DELETE FROM public.business_categories
  WHERE business_id = v_business_id AND is_primary = true;

  -- Add the new primary category
  IF v_sub_category_id IS NOT NULL THEN
    INSERT INTO public.business_categories (business_id, sub_category_id, is_primary)
    VALUES (v_business_id, v_sub_category_id, true)
    ON CONFLICT (business_id, sub_category_id) DO UPDATE
    SET is_primary = true;

    RAISE NOTICE 'Successfully added category to H1Site';
    RAISE NOTICE 'Business ID: %', v_business_id;
    RAISE NOTICE 'Main Category ID: %', v_main_category_id;
    RAISE NOTICE 'Sub-Category ID: %', v_sub_category_id;
  ELSE
    RAISE NOTICE 'Could not find appropriate categories';
  END IF;
END $$;

-- Verify the update
SELECT
  b.name,
  b.region,
  mc.label_fr as main_category,
  sc.label_fr as sub_category
FROM public.businesses b
LEFT JOIN public.business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
LEFT JOIN public.sub_categories sc ON sc.id = bc.sub_category_id
LEFT JOIN public.main_categories mc ON mc.id = sc.main_category_id
WHERE b.slug = 'h1site';
