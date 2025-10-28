-- Indexes pour accélérer les requêtes de recherche
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Index pour main_category_id (filtre le plus fréquent)
CREATE INDEX IF NOT EXISTS idx_businesses_main_category_id ON businesses(main_category_id);

-- 2. Index pour sub_category_id
CREATE INDEX IF NOT EXISTS idx_businesses_sub_category_id ON businesses(sub_category_id);

-- 3. Index pour city (filtre fréquent)
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);

-- 4. Index pour region
CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region);

-- 5. Index pour mrc
CREATE INDEX IF NOT EXISTS idx_businesses_mrc ON businesses(mrc);

-- 6. Index composite pour filtres combinés fréquents
CREATE INDEX IF NOT EXISTS idx_businesses_category_city ON businesses(main_category_id, city);
CREATE INDEX IF NOT EXISTS idx_businesses_category_region ON businesses(main_category_id, region);

-- 7. Index GIN pour search_vector (full-text search) - TRÈS IMPORTANT
CREATE INDEX IF NOT EXISTS idx_businesses_search_vector ON businesses USING GIN(search_vector);

-- 8. Index pour created_at (tri par date)
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);

-- 9. Index pour NEQ (utilisé pour les mises à jour)
CREATE INDEX IF NOT EXISTS idx_businesses_neq ON businesses(neq);

-- 10. Index pour act_econ_code (nouvellement utilisé)
CREATE INDEX IF NOT EXISTS idx_businesses_act_econ_code ON businesses(act_econ_code);

-- Vérifier les index créés
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
ORDER BY indexname;
