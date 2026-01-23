-- Performance Optimizations - ÉTAPE 4 (Index Catégorie & Owner)
-- Exécuter après l'étape 3
-- Temps estimé: 3-4 minutes

-- ============================================================================
-- INDEX 4/5: Main Category Slug (utilisé dans search et filtres)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_main_category_slug
ON businesses(main_category_slug)
WHERE main_category_slug IS NOT NULL;

-- ============================================================================
-- INDEX 5/5: Owner ID (utilisé dans dashboard)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_owner_id
ON businesses(owner_id)
WHERE owner_id IS NOT NULL;

-- Vérification
SELECT 'Index category et owner créés' as status;
