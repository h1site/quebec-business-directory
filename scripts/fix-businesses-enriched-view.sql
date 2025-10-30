-- Fix businesses_enriched view to include show_address column
-- This will replace the existing view without dropping it

CREATE OR REPLACE VIEW public.businesses_enriched AS
SELECT
  b.*
FROM public.businesses b;

-- Verify the view now includes show_address
SELECT
  COUNT(*) as total_count,
  COUNT(show_address) as show_address_count,
  COUNT(show_email) as show_email_count
FROM public.businesses_enriched;

-- Show sample data
SELECT
  id,
  name,
  show_address,
  show_email,
  city
FROM public.businesses_enriched
LIMIT 3;
