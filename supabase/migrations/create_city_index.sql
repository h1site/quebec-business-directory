-- Create index on city column for faster city-based queries
-- Run this in Supabase SQL Editor

-- Create a case-insensitive index using lower()
CREATE INDEX IF NOT EXISTS idx_businesses_city_lower
ON businesses (lower(city));

-- Create the RPC function for fast city lookups
CREATE OR REPLACE FUNCTION get_businesses_by_city(
  city_name TEXT,
  page_limit INT DEFAULT 24,
  page_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  main_category_slug TEXT,
  categories JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.slug,
    b.city,
    b.address,
    b.phone,
    b.email,
    b.description,
    b.main_category_slug,
    b.categories
  FROM businesses b
  WHERE lower(b.city) = lower(city_name)
  ORDER BY b.name
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION get_businesses_by_city TO authenticated;
GRANT EXECUTE ON FUNCTION get_businesses_by_city TO anon;

-- Create a function to get count by city (faster than count with ilike)
CREATE OR REPLACE FUNCTION get_businesses_count_by_city(city_name TEXT)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM businesses
    WHERE lower(city) = lower(city_name)
  );
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION get_businesses_count_by_city TO authenticated;
GRANT EXECUTE ON FUNCTION get_businesses_count_by_city TO anon;
