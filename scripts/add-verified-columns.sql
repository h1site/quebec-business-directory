-- Add verified contact columns to businesses table
-- Run this in Supabase SQL Editor

-- Verified contact info (only displayed if verified)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verified_address TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verified_phone TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verified_email TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verified_city TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verified_postal_code TEXT;

-- Verification metadata
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_confidence TEXT; -- 'high', 'medium', 'low', 'none'

-- Index for finding unverified businesses
CREATE INDEX IF NOT EXISTS idx_businesses_verified_at ON businesses(verified_at) WHERE verified_at IS NULL;

-- Comment
COMMENT ON COLUMN businesses.verified_address IS 'Address verified from website - displayed to users';
COMMENT ON COLUMN businesses.verified_phone IS 'Phone verified from website - displayed to users';
COMMENT ON COLUMN businesses.verified_email IS 'Email verified from website - stored but not displayed';
COMMENT ON COLUMN businesses.verification_confidence IS 'Confidence level: high, medium, low, none';
