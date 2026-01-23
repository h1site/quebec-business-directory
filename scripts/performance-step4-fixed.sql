-- Performance Optimizations - ÉTAPE 4 (Index Category & Owner)
-- Temps estimé: 2-3 minutes

CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug) WHERE main_category_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;

SELECT 'Étape 4 complétée: Index category + owner' as status;
