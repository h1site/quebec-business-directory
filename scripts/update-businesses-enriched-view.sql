-- Update businesses_enriched view to include show_address column
-- This view is used by getBusinessBySlug() function

-- Drop the existing view
DROP VIEW IF EXISTS public.businesses_enriched CASCADE;

-- Recreate the view with show_address included
CREATE OR REPLACE VIEW public.businesses_enriched AS
SELECT
  b.*,
  b.show_address,  -- Add the new column
  b.show_email,
  -- Include any other computed columns that were in the original view
  -- (Add other columns from the original view definition here if needed)
  NULL as primary_main_category_fr,
  NULL as primary_main_category_en,
  NULL as primary_main_category_slug
FROM public.businesses b;

-- Grant permissions
GRANT SELECT ON public.businesses_enriched TO anon, authenticated;

-- Verify the view includes show_address
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'businesses_enriched'
  AND column_name IN ('show_address', 'show_email')
ORDER BY column_name;
