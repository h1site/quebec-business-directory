-- Performance Optimizations - ÉTAPE 5 (Index Reviews & Website)
-- Exécuter après l'étape 4
-- Temps estimé: 2-3 minutes

-- ============================================================================
-- INDEX: Reviews User ID (pour dashboard)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_user_id
ON reviews(user_id);

-- ============================================================================
-- INDEX: Website (pour sitemap generation)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_website
ON businesses(website)
WHERE website IS NOT NULL AND website != '';

-- ============================================================================
-- INDEX: AI Enriched At (pour prioritization)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_ai_enriched_at
ON businesses(ai_enriched_at)
WHERE ai_enriched_at IS NOT NULL;

-- Vérification
SELECT 'Index reviews, website et ai_enriched_at créés' as status;
