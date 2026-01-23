-- ÉTAPE 9: Créer les index (RAPIDE après archivage!)
-- Avec ~50k lignes, chaque index prend < 30 secondes

-- Index sur slug (le plus critique)
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug) WHERE slug IS NOT NULL;

-- Index sur city
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city) WHERE city IS NOT NULL;

-- Index sur owner_id
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id) WHERE owner_id IS NOT NULL;

-- Index sur website
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL;

-- Index sur main_category_slug
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug) WHERE main_category_slug IS NOT NULL;

-- Mettre à jour les statistiques
ANALYZE businesses;

-- Vérifier les index créés
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
AND schemaname = 'public';
