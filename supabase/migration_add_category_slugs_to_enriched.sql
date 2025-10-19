-- Migration: Add category slugs to businesses_enriched view
-- This allows us to get category slugs without additional queries

-- Drop the existing view
DROP VIEW IF EXISTS public.businesses_enriched;

-- Recreate the view with category slugs
CREATE OR REPLACE VIEW public.businesses_enriched AS
SELECT
  b.*,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  mc.slug as primary_main_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en,
  sc.slug as primary_sub_category_slug,
  COALESCE(lang.languages, '{}') as languages,
  COALESCE(modes.modes, '{}') as service_modes,
  COALESCE(certs.certifications, '{}') as certifications,
  COALESCE(acc.accessibility, '{}') as accessibility_features,
  COALESCE(pay.payments, '{}') as payment_methods
FROM public.businesses b
LEFT JOIN public.business_categories bc ON bc.business_id = b.id AND bc.is_primary = true
LEFT JOIN public.sub_categories sc ON sc.id = bc.sub_category_id
LEFT JOIN public.main_categories mc ON mc.id = sc.main_category_id
LEFT JOIN LATERAL (
  SELECT array_agg(lsl.code ORDER BY lsl.position) as languages
  FROM public.business_languages bl
  JOIN public.lookup_service_languages lsl ON lsl.id = bl.language_id
  WHERE bl.business_id = b.id
) lang ON true
LEFT JOIN LATERAL (
  SELECT array_agg(lsm.key ORDER BY lsm.position) as modes
  FROM public.business_service_modes bsm
  JOIN public.lookup_service_modes lsm ON lsm.id = bsm.service_mode_id
  WHERE bsm.business_id = b.id
) modes ON true
LEFT JOIN LATERAL (
  SELECT array_agg(lc.key ORDER BY lc.label_fr) as certifications
  FROM public.business_certifications bc2
  JOIN public.lookup_certifications lc ON lc.id = bc2.certification_id
  WHERE bc2.business_id = b.id
) certs ON true
LEFT JOIN LATERAL (
  SELECT array_agg(laf.key ORDER BY laf.label_fr) as accessibility
  FROM public.business_accessibility_features baf
  JOIN public.lookup_accessibility_features laf ON laf.id = baf.accessibility_feature_id
  WHERE baf.business_id = b.id
) acc ON true
LEFT JOIN LATERAL (
  SELECT array_agg(lpm.key ORDER BY lpm.label_fr) as payments
  FROM public.business_payment_methods bpm
  JOIN public.lookup_payment_methods lpm ON lpm.id = bpm.payment_method_id
  WHERE bpm.business_id = b.id
) pay ON true;

-- Note: This view now includes category slugs for easy URL generation
