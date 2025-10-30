-- Migration: Add opening_hours column to businesses table
-- Date: 2025-10-30
-- Purpose: Allow businesses to specify their opening hours (optional)

-- Structure: JSONB format for flexibility
-- Format: {
--   "monday": {"open": "09:00", "close": "17:00", "closed": false},
--   "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
--   "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
--   "thursday": {"open": "09:00", "close": "17:00", "closed": false},
--   "friday": {"open": "09:00", "close": "17:00", "closed": false},
--   "saturday": {"open": "10:00", "close": "16:00", "closed": false},
--   "sunday": {"open": "", "close": "", "closed": true}
-- }

-- Add opening_hours column (JSONB, nullable for optional feature)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT NULL;

-- Add index for querying open/closed businesses
CREATE INDEX IF NOT EXISTS idx_businesses_opening_hours
ON public.businesses USING GIN (opening_hours);

-- Recreate the view to include opening_hours
DROP VIEW IF EXISTS public.businesses_enriched;
CREATE VIEW public.businesses_enriched AS
SELECT b.*
FROM public.businesses b;

-- Grant permissions
GRANT SELECT ON public.businesses_enriched TO anon, authenticated;

-- Verify the migration
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'businesses'
  AND column_name = 'opening_hours';

-- Count businesses
SELECT
    COUNT(*) as total_businesses,
    COUNT(opening_hours) as with_hours,
    COUNT(*) - COUNT(opening_hours) as without_hours
FROM public.businesses;
