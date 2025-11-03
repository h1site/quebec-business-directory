-- Fix businesses_enriched view to include description_en column
-- Run this in Supabase SQL Editor to permanently fix the view

-- Drop and recreate the view with all current columns from businesses table
CREATE OR REPLACE VIEW public.businesses_enriched AS
SELECT
  b.*
FROM public.businesses b;

-- Verify the fix worked by checking if description_en exists
SELECT
  COUNT(*) as total_businesses,
  COUNT(description) as has_fr_description,
  COUNT(description_en) as has_en_description,
  ROUND(COUNT(description_en)::numeric / COUNT(*)::numeric * 100, 2) as pct_with_en
FROM public.businesses_enriched;

-- Test sample query
SELECT
  id,
  name,
  slug,
  LEFT(description, 80) as desc_fr_preview,
  LEFT(description_en, 80) as desc_en_preview
FROM public.businesses_enriched
WHERE description_en IS NOT NULL
LIMIT 5;
