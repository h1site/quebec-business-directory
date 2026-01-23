-- Performance Optimizations - ÉTAPE 3 (Index Région)
-- Exécuter après l'étape 2
-- Temps estimé: 2-3 minutes

-- ============================================================================
-- INDEX 3/5: Region
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_region
ON businesses(region)
WHERE region IS NOT NULL;

-- Vérification
SELECT 'Index region créé' as status;
