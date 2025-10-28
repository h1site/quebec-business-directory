-- Add primary_main_category_slug column to businesses table
-- This column will be used by the frontend to filter by category

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS primary_main_category_slug TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_businesses_category_slug
ON businesses(primary_main_category_slug);

-- Update existing records based on main_category_id
UPDATE businesses b
SET primary_main_category_slug = mc.slug
FROM main_categories mc
WHERE b.main_category_id = mc.id
AND b.primary_main_category_slug IS NULL;

-- Add comment
COMMENT ON COLUMN businesses.primary_main_category_slug IS 'Slug de la catégorie principale (synchronisé avec main_category_id)';
