-- Migration: Add indexes for efficient duplicate business detection
-- This optimizes queries for finding duplicate businesses by phone, name, address, etc.

-- Index on phone number for fast lookups
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON businesses(phone);

-- Index on name (case-insensitive) for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_businesses_name_lower ON businesses(LOWER(name));

-- Index on city (case-insensitive) for location-based matching
CREATE INDEX IF NOT EXISTS idx_businesses_city_lower ON businesses(LOWER(city));

-- Composite index on city + name for combined searches
CREATE INDEX IF NOT EXISTS idx_businesses_city_name ON businesses(LOWER(city), LOWER(name));

-- Index on google_place_id for exact Google Business matches
CREATE INDEX IF NOT EXISTS idx_businesses_google_place_id ON businesses(google_place_id) WHERE google_place_id IS NOT NULL;

-- Index on address for address-based matching
CREATE INDEX IF NOT EXISTS idx_businesses_address_lower ON businesses(LOWER(address));

-- Composite index on city + address for location verification
CREATE INDEX IF NOT EXISTS idx_businesses_city_address ON businesses(LOWER(city), LOWER(address));

-- Add google_place_id column if it doesn't exist (for Google My Business imports)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses'
                 AND column_name = 'google_place_id') THEN
    ALTER TABLE businesses ADD COLUMN google_place_id VARCHAR(255);
    COMMENT ON COLUMN businesses.google_place_id IS 'Google Place ID for duplicate detection and verification';
  END IF;
END $$;

-- Index for data_source to quickly filter REQ imports vs manual entries
CREATE INDEX IF NOT EXISTS idx_businesses_data_source ON businesses(data_source);

-- Composite index for unclaimed businesses (for auto-claim feature)
CREATE INDEX IF NOT EXISTS idx_businesses_claimed ON businesses(is_claimed, data_source) WHERE is_claimed = false;

-- Verify indexes created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
  AND indexname LIKE 'idx_businesses_%'
ORDER BY indexname;
