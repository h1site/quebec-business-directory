-- Performance Optimizations - ÉTAPE 5 (Index Reviews, Website, AI)
-- Temps estimé: 2-3 minutes

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL AND website != '';

CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched_at ON businesses(ai_enriched_at) WHERE ai_enriched_at IS NOT NULL;

SELECT 'Étape 5 complétée: Index reviews, website, ai_enriched_at' as status;
