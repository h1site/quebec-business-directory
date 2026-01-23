-- Performance Optimizations - ÉTAPE 2 (Indexes Géographiques)
-- Exécuter après l'étape 1
-- Temps estimé: 3-5 minutes

-- ============================================================================
-- INDEX 2/5: City (très utilisé dans recherche et filtres)
-- ============================================================================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_businesses_city
ON businesses(city)
WHERE city IS NOT NULL;

-- Vérification
SELECT 'Index city créé' as status;
