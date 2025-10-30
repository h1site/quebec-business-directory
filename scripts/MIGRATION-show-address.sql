-- Migration: Add show_address column to businesses table
-- Date: 2025-10-30
-- Purpose: Allow businesses to hide their address, map, and Waze button on public listings

-- Add the column with default TRUE (all existing businesses show address by default)
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT TRUE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_show_address
ON public.businesses(show_address);

-- Verify the migration
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'businesses'
  AND column_name = 'show_address';

-- Count businesses with show_address
SELECT
    COUNT(*) as total_businesses,
    COUNT(show_address) as with_show_address_column,
    SUM(CASE WHEN show_address = TRUE THEN 1 ELSE 0 END) as showing_address,
    SUM(CASE WHEN show_address = FALSE THEN 1 ELSE 0 END) as hiding_address
FROM public.businesses;
