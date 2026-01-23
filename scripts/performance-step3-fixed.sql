-- Performance Optimizations - ÉTAPE 3 (Index Region)
-- Temps estimé: 1-2 minutes

CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region) WHERE region IS NOT NULL;

SELECT 'Étape 3 complétée: Index region' as status;
