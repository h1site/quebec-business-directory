-- ============================================================================
-- SCRIPT COMPLET POUR psql - Tous les index + fonctions RPC
-- ============================================================================
--
-- Usage:
-- psql "postgresql://postgres.[ref]:[password]@[host]:5432/postgres" -f all-indexes.sql
--
-- Ou copie-colle directement dans psql après connexion
--
-- Temps estimé: 10-20 minutes au total
-- ============================================================================

\echo '========================================='
\echo 'Starting index creation...'
\echo '========================================='
\echo ''

-- Extension
\echo 'Creating pg_trgm extension...'
CREATE EXTENSION IF NOT EXISTS pg_trgm;
\echo '✓ Extension created'
\echo ''

-- Index 1: Slug
\echo 'Creating index on slug (1/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;
\echo '✓ idx_businesses_slug created'
\echo ''

-- Index 2: City
\echo 'Creating index on city (2/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;
\echo '✓ idx_businesses_city created'
\echo ''

-- Index 3: Region
\echo 'Creating index on region (3/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region) WHERE region IS NOT NULL;
\echo '✓ idx_businesses_region created'
\echo ''

-- Index 4: Category
\echo 'Creating index on main_category_slug (4/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug) WHERE main_category_slug IS NOT NULL;
\echo '✓ idx_businesses_main_category_slug created'
\echo ''

-- Index 5: Owner
\echo 'Creating index on owner_id (5/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;
\echo '✓ idx_businesses_owner_id created'
\echo ''

-- Index 6: Website
\echo 'Creating index on website (6/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL AND website != '';
\echo '✓ idx_businesses_website created'
\echo ''

-- Index 7: AI Enriched
\echo 'Creating index on ai_enriched_at (7/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched_at ON businesses(ai_enriched_at) WHERE ai_enriched_at IS NOT NULL;
\echo '✓ idx_businesses_ai_enriched_at created'
\echo ''

-- Index 8: Reviews
\echo 'Creating index on reviews.user_id (8/9)...'
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
\echo '✓ idx_reviews_user_id created'
\echo ''

-- Index 9: Composite Search (optional but useful)
\echo 'Creating composite index for search (9/9)...'
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses(city, main_category_slug) WHERE city IS NOT NULL AND main_category_slug IS NOT NULL;
\echo '✓ idx_businesses_search created'
\echo ''

-- RPC Functions
\echo 'Creating RPC functions...'

CREATE OR REPLACE FUNCTION get_unique_cities(limit_count INTEGER DEFAULT 100)
RETURNS TABLE(city TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.city FROM businesses b
  WHERE b.city IS NOT NULL
  ORDER BY b.city LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_unique_regions()
RETURNS TABLE(region TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.region FROM businesses b
  WHERE b.region IS NOT NULL
  ORDER BY b.region;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_city_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT city) FROM businesses WHERE city IS NOT NULL);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_region_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT region) FROM businesses WHERE region IS NOT NULL);
END;
$$ LANGUAGE plpgsql STABLE;

\echo '✓ RPC functions created'
\echo ''

-- Analyze tables for optimizer
\echo 'Analyzing tables for query optimizer...'
ANALYZE businesses;
ANALYZE reviews;
\echo '✓ Tables analyzed'
\echo ''

-- Verification
\echo '========================================='
\echo 'VERIFICATION'
\echo '========================================='
\echo ''

\echo 'Indexes created:'
SELECT indexname FROM pg_indexes
WHERE tablename IN ('businesses', 'reviews')
AND indexname LIKE 'idx_%'
ORDER BY indexname;

\echo ''
\echo 'Functions created:'
SELECT proname FROM pg_proc
WHERE proname LIKE 'get_%'
ORDER BY proname;

\echo ''
\echo '========================================='
\echo '✓ ALL DONE! Indexes and functions ready.'
\echo '========================================='
\echo ''
\echo 'Expected performance improvement:'
\echo '  - Query time: 80-95% faster'
\echo '  - CPU usage: 60-80% → 20-30%'
\echo ''
\echo 'Test the RPC functions:'
\echo '  SELECT * FROM get_unique_cities(5);'
\echo '  SELECT get_city_count();'
\echo ''
