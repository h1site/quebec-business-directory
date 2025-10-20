-- ============================================================================
-- MIGRATIONS À EXÉCUTER DANS SUPABASE SQL EDITOR
-- Copiez-collez ce fichier dans le SQL Editor de Supabase
-- Exécutez tout d'un coup ou section par section
-- ============================================================================

-- ============================================================================
-- 1. SUPPORT IMPORT REQ + COORDONNÉES
-- ============================================================================

-- Drop businesses_enriched view temporarily to modify coordinates
DROP VIEW IF EXISTS businesses_enriched CASCADE;

-- Fix coordinates precision (latitude/longitude)
ALTER TABLE businesses
  ALTER COLUMN latitude TYPE DECIMAL(10, 8),
  ALTER COLUMN longitude TYPE DECIMAL(11, 8);

-- Add columns for REQ import
DO $$
BEGIN
  -- Add data_source column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses' AND column_name = 'data_source') THEN
    ALTER TABLE businesses ADD COLUMN data_source VARCHAR(50) DEFAULT 'manual';
    CREATE INDEX idx_businesses_data_source ON businesses(data_source);
  END IF;

  -- Add NEQ column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses' AND column_name = 'neq') THEN
    ALTER TABLE businesses ADD COLUMN neq VARCHAR(20);
  END IF;

  -- Add etablissement_number column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses' AND column_name = 'etablissement_number') THEN
    ALTER TABLE businesses ADD COLUMN etablissement_number INTEGER;
  END IF;

  -- Add SCIAN columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses' AND column_name = 'scian_code') THEN
    ALTER TABLE businesses ADD COLUMN scian_code VARCHAR(10);
    ALTER TABLE businesses ADD COLUMN scian_description TEXT;
  END IF;

  -- Add MRC column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses' AND column_name = 'mrc') THEN
    ALTER TABLE businesses ADD COLUMN mrc TEXT;
    CREATE INDEX idx_businesses_mrc ON businesses(mrc);
  END IF;
END $$;

-- Fix NEQ constraint (allow duplicate NEQ with different etablissement_number)
DO $$
BEGIN
  -- Drop old constraint if exists
  ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_neq_key;

  -- Add new composite unique constraint
  ALTER TABLE businesses ADD CONSTRAINT businesses_neq_etablissement_unique
    UNIQUE (neq, etablissement_number);
END $$;

COMMENT ON COLUMN businesses.data_source IS 'Source of data: manual, req, google, etc.';
COMMENT ON COLUMN businesses.neq IS 'Numéro d''entreprise du Québec (REQ)';
COMMENT ON COLUMN businesses.etablissement_number IS 'Establishment number for multi-location businesses';
COMMENT ON COLUMN businesses.scian_code IS 'SCIAN classification code';
COMMENT ON COLUMN businesses.mrc IS 'MRC (Municipalité régionale de comté)';


-- ============================================================================
-- 2. BUSINESS CLAIMS SYSTEM
-- ============================================================================

-- Create business_claims table
CREATE TABLE IF NOT EXISTS business_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  verification_method VARCHAR(50) NOT NULL, -- 'email_domain', 'google_business', 'manual'
  google_business_url TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Add claimed fields to businesses table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses' AND column_name = 'claimed_by') THEN
    ALTER TABLE businesses ADD COLUMN claimed_by UUID REFERENCES auth.users(id);
    ALTER TABLE businesses ADD COLUMN claimed_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE businesses ADD COLUMN is_claimed BOOLEAN DEFAULT FALSE;
    CREATE INDEX idx_businesses_claimed ON businesses(is_claimed, data_source) WHERE is_claimed = false;
  END IF;
END $$;

-- RLS policies for business_claims
ALTER TABLE business_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view own claims" ON business_claims
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create claims
CREATE POLICY "Users can create claims" ON business_claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all claims
CREATE POLICY "Admins can view all claims" ON business_claims
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN ('karpe_25@hotmail.com', 'info@h1site.com')
  );

-- Admins can update claims
CREATE POLICY "Admins can update claims" ON business_claims
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN ('karpe_25@hotmail.com', 'info@h1site.com')
  );

-- Function to check email domain match
CREATE OR REPLACE FUNCTION check_email_domain_match(user_email TEXT, business_website TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  email_domain TEXT;
  website_domain TEXT;
BEGIN
  IF user_email IS NULL OR business_website IS NULL THEN
    RETURN FALSE;
  END IF;

  email_domain := split_part(user_email, '@', 2);
  website_domain := regexp_replace(
    regexp_replace(
      regexp_replace(business_website, '^https?://', ''),
      '^www\.', ''
    ),
    '/.*$', ''
  );

  RETURN LOWER(email_domain) = LOWER(website_domain);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-approve claims with matching email domain
CREATE OR REPLACE FUNCTION auto_approve_claim_if_domain_match()
RETURNS TRIGGER AS $$
DECLARE
  business_website TEXT;
BEGIN
  IF NEW.verification_method = 'email_domain' THEN
    SELECT website INTO business_website
    FROM businesses
    WHERE id = NEW.business_id;

    IF check_email_domain_match(NEW.user_email, business_website) THEN
      NEW.status := 'approved';
      NEW.verified_at := NOW();

      -- Also update the business
      UPDATE businesses
      SET claimed_by = NEW.user_id,
          claimed_at = NOW(),
          is_claimed = TRUE
      WHERE id = NEW.business_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_approve_business_claim
  BEFORE INSERT ON business_claims
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_claim_if_domain_match();


-- ============================================================================
-- 3. DUPLICATE DETECTION INDEXES
-- ============================================================================

-- Index on phone number for fast lookups
CREATE INDEX IF NOT EXISTS idx_businesses_phone ON businesses(phone);

-- Index on name (case-insensitive) for fuzzy matching
CREATE INDEX IF NOT EXISTS idx_businesses_name_lower ON businesses(LOWER(name));

-- Index on city (case-insensitive) for location-based matching
CREATE INDEX IF NOT EXISTS idx_businesses_city_lower ON businesses(LOWER(city));

-- Composite index on city + name for combined searches
CREATE INDEX IF NOT EXISTS idx_businesses_city_name ON businesses(LOWER(city), LOWER(name));

-- Index on address for address-based matching
CREATE INDEX IF NOT EXISTS idx_businesses_address_lower ON businesses(LOWER(address));

-- Composite index on city + address for location verification
CREATE INDEX IF NOT EXISTS idx_businesses_city_address ON businesses(LOWER(city), LOWER(address));

-- Add google_place_id column (for Google My Business imports)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses'
                 AND column_name = 'google_place_id') THEN
    ALTER TABLE businesses ADD COLUMN google_place_id VARCHAR(255);
    COMMENT ON COLUMN businesses.google_place_id IS 'Google Place ID for duplicate detection and verification';
  END IF;
END $$;

-- Index on google_place_id for exact Google Business matches
CREATE INDEX IF NOT EXISTS idx_businesses_google_place_id ON businesses(google_place_id)
WHERE google_place_id IS NOT NULL;


-- ============================================================================
-- 4. CATEGORY SLUGS IN ENRICHED VIEW
-- ============================================================================

-- Recreate businesses_enriched view with category slugs
-- (Already dropped at the beginning to fix coordinates precision)
CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.slug as primary_main_category_slug,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  sc.slug as primary_sub_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en
FROM businesses b
LEFT JOIN business_categories bc ON b.id = bc.business_id AND bc.is_primary = true
LEFT JOIN sub_categories sc ON bc.sub_category_id = sc.id
LEFT JOIN main_categories mc ON sc.main_category_id = mc.id;


-- ============================================================================
-- 5. GOOGLE TYPES SUPPORT
-- ============================================================================

-- Add google_types column for more accurate categorization
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'businesses'
                 AND column_name = 'google_types') THEN
    ALTER TABLE businesses ADD COLUMN google_types TEXT[];
    COMMENT ON COLUMN businesses.google_types IS 'Google Place types for better categorization';
  END IF;
END $$;


-- ============================================================================
-- VERIFICATION - Afficher les indexes créés
-- ============================================================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'businesses'
  AND indexname LIKE 'idx_businesses_%'
ORDER BY indexname;

-- ============================================================================
-- FIN DES MIGRATIONS
-- ============================================================================

-- Vérifier que tout fonctionne:
SELECT
  'Migration completed successfully!' as status,
  COUNT(*) as total_businesses,
  COUNT(CASE WHEN data_source = 'req' THEN 1 END) as req_businesses,
  COUNT(CASE WHEN is_claimed THEN 1 END) as claimed_businesses
FROM businesses;
