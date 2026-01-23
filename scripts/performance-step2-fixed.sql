-- Performance Optimizations - ÉTAPE 2 (Index City)
-- Temps estimé: 2-4 minutes

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;

SELECT 'Étape 2 complétée: Index city' as status;
