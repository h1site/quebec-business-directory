-- Add description_en column to businesses table
-- This allows storing English descriptions alongside French ones

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_businesses_description_en
ON businesses(description_en)
WHERE description_en IS NOT NULL;

-- Update businesses_enriched view to include description_en
-- (The view will automatically include the new column on next query)
