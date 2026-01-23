-- Performance Optimizations - ÉTAPE 7 (Fonctions RPC)
-- Exécuter après l'étape 6
-- Temps estimé: < 1 minute

-- ============================================================================
-- RPC FUNCTIONS pour remplacer les requêtes JavaScript
-- ============================================================================

-- Function to get unique cities (replaces getCities() in plan-du-site)
CREATE OR REPLACE FUNCTION get_unique_cities(limit_count INTEGER DEFAULT 100)
RETURNS TABLE(city TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.city
  FROM businesses b
  WHERE b.city IS NOT NULL
  ORDER BY b.city
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get unique regions (replaces getRegions() in plan-du-site)
CREATE OR REPLACE FUNCTION get_unique_regions()
RETURNS TABLE(region TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT b.region
  FROM businesses b
  WHERE b.region IS NOT NULL
  ORDER BY b.region;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get city count (useful for statistics)
CREATE OR REPLACE FUNCTION get_city_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT city) FROM businesses WHERE city IS NOT NULL);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get region count (useful for statistics)
CREATE OR REPLACE FUNCTION get_region_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(DISTINCT region) FROM businesses WHERE region IS NOT NULL);
END;
$$ LANGUAGE plpgsql STABLE;

-- Vérification: tester les fonctions
SELECT get_city_count() as total_cities;
SELECT get_region_count() as total_regions;
SELECT * FROM get_unique_cities(5) LIMIT 5;
SELECT * FROM get_unique_regions() LIMIT 5;

SELECT 'Fonctions RPC créées avec succès!' as status;
