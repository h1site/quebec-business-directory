-- Augmenter timeout puis créer index city
SET statement_timeout = '10min';

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;

SELECT 'Index city créé' as status;
