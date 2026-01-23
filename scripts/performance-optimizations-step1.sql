-- Performance Optimizations - ÉTAPE 1 (Indexes Critiques)
-- Exécuter d'abord cette étape, puis attendre la fin avant l'étape 2
-- Temps estimé: 5-10 minutes

-- ============================================================================
-- EXTENSION REQUISE (rapide)
-- ============================================================================

-- Enable pg_trgm extension for trigram search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- INDEX 1/5: Slug (très utilisé, petit, rapide)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_slug
ON businesses(slug)
WHERE slug IS NOT NULL;

-- Vérification
SELECT 'Index slug créé' as status;
