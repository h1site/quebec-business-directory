-- Performance Optimizations for Registre du Québec
-- Run this file in Supabase SQL Editor to improve database performance

-- ============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ============================================================================

-- Index for city searches and filtering (used in search.ts, sitemap, plan-du-site)
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city)
WHERE city IS NOT NULL;

-- Index for business name searches (used in search.ts with ilike)
CREATE INDEX IF NOT EXISTS idx_businesses_name_trgm ON businesses
USING gin(name gin_trgm_ops);

-- Index for region filtering (used in plan-du-site and getRelatedBusinesses)
CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region)
WHERE region IS NOT NULL;

-- Index for slug lookups (primary business page queries)
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug)
WHERE slug IS NOT NULL;

-- Index for website filtering (used in sitemap generation)
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website)
WHERE website IS NOT NULL AND website != '';

-- Index for ai_enriched_at (used for prioritizing enriched businesses)
CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched_at ON businesses(ai_enriched_at)
WHERE ai_enriched_at IS NOT NULL;

-- Index for owner_id (used in dashboard queries)
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id)
WHERE owner_id IS NOT NULL;

-- Index for reviews user_id (used in dashboard and avis pages)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Index for main_category_slug (used in category filtering and search)
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug)
WHERE main_category_slug IS NOT NULL;

-- Composite index for search queries (city + category filtering)
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses(city, main_category_slug)
WHERE city IS NOT NULL AND main_category_slug IS NOT NULL;

-- Index for google_rating sorting (used in getPopularBusinesses)
CREATE INDEX IF NOT EXISTS idx_businesses_google_rating ON businesses(google_rating DESC, google_reviews_count DESC)
WHERE google_rating IS NOT NULL;

-- ============================================================================
-- RPC FUNCTIONS FOR OPTIMIZED QUERIES
-- ============================================================================

-- Function to get unique cities (replaces getCities() in plan-du-site)
CREATE OR REPLACE FUNCTION get_unique_cities(limit_count INTEGER DEFAULT 100)
RETURNS TABLE(city TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.city
  FROM businesses b
  WHERE b.city IS NOT NULL
  ORDER BY b.city
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get unique regions (replaces getRegions() in plan-du-site)
CREATE OR REPLACE FUNCTION get_unique_regions()
RETURNS TABLE(region TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.region
  FROM businesses b
  WHERE b.region IS NOT NULL
  ORDER BY b.region;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get city count (useful for statistics)
CREATE OR REPLACE FUNCTION get_city_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT city) FROM businesses WHERE city IS NOT NULL);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get region count (useful for statistics)
CREATE OR REPLACE FUNCTION get_region_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT region) FROM businesses WHERE region IS NOT NULL);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- MATERIALIZED VIEWS FOR EXPENSIVE AGGREGATIONS (Optional)
-- ============================================================================

-- Materialized view for business statistics (refresh periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_business_stats AS
SELECT
  COUNT(*) as total_businesses,
  COUNT(DISTINCT city) as total_cities,
  COUNT(DISTINCT region) as total_regions,
  COUNT(CASE WHEN website IS NOT NULL AND website != '' THEN 1 END) as businesses_with_website,
  COUNT(CASE WHEN ai_enriched_at IS NOT NULL THEN 1 END) as enriched_businesses,
  COUNT(CASE WHEN google_rating >= 4.5 THEN 1 END) as highly_rated_businesses
FROM businesses;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_business_stats ON mv_business_stats((1));

-- Function to refresh materialized view (call this periodically via cron)
CREATE OR REPLACE FUNCTION refresh_business_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_business_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE CONFIGURATION
-- ============================================================================

-- Enable the pg_trgm extension for trigram text search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify indexes were created successfully:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'businesses';
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'reviews';

-- Test the RPC functions:
-- SELECT * FROM get_unique_cities(10);
-- SELECT * FROM get_unique_regions();
-- SELECT * FROM mv_business_stats;

-- ============================================================================
-- NOTES
-- ============================================================================

-- After running this file:
-- 1. Update plan-du-site/page.tsx to use RPC functions instead of JavaScript deduplication
-- 2. Monitor query performance in Supabase dashboard
-- 3. Consider setting up a cron job to refresh mv_business_stats daily
-- 4. If search is still slow, consider implementing full-text search with ts_vector
