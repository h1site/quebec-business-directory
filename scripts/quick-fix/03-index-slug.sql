-- Augmenter timeout puis créer index slug
SET statement_timeout = '10min';

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;

SELECT 'Index slug créé' as status;
