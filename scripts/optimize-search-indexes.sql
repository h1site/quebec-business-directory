-- Optimize search performance with proper indexes
-- Run this in Supabase SQL Editor

-- Enable pg_trgm extension for fast ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Composite index for the main filter condition
-- This covers: is_claimed, owner_id, ai_description, website
CREATE INDEX IF NOT EXISTS idx_businesses_valid_filter
ON businesses (is_claimed, owner_id, ai_description, website)
WHERE slug IS NOT NULL;

-- Index for ordering by google_rating (most common sort)
CREATE INDEX IF NOT EXISTS idx_businesses_google_rating
ON businesses (google_rating DESC NULLS LAST, name)
WHERE slug IS NOT NULL;

-- Trigram index for fast ILIKE name search
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm
ON businesses USING gin (name gin_trgm_ops);

-- Index for category filter
CREATE INDEX IF NOT EXISTS idx_businesses_category
ON businesses (main_category_slug)
WHERE slug IS NOT NULL AND (is_claimed = true OR owner_id IS NOT NULL OR (ai_description IS NOT NULL AND website IS NOT NULL));

-- Index for city filter (trigram for ILIKE)
CREATE INDEX IF NOT EXISTS idx_businesses_city_trgm
ON businesses USING gin (city gin_trgm_ops);

-- Analyze table to update statistics
ANALYZE businesses;

-- Verify indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
ORDER BY indexname;
