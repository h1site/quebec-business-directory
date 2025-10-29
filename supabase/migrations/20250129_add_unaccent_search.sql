-- Enable unaccent extension for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create custom unaccent function that handles NULL values
CREATE OR REPLACE FUNCTION f_unaccent(text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$func$
SELECT unaccent('unaccent', $1)
$func$;

-- Create immutable lower function for functional indexes
CREATE OR REPLACE FUNCTION f_unaccent_lower(text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$func$
SELECT lower(f_unaccent($1))
$func$;

-- Add functional indexes on businesses table for accent-insensitive search
-- These indexes will speed up searches on city and name without accents
CREATE INDEX IF NOT EXISTS businesses_city_unaccent_idx
  ON businesses (f_unaccent_lower(city));

CREATE INDEX IF NOT EXISTS businesses_name_unaccent_idx
  ON businesses (f_unaccent_lower(name));

-- Add comment
COMMENT ON FUNCTION f_unaccent(text) IS 'Remove accents from text for search (Montréal → Montreal)';
COMMENT ON FUNCTION f_unaccent_lower(text) IS 'Remove accents and lowercase text for case-insensitive accent-insensitive search';
