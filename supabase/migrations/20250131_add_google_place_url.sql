-- Add google_place_url column to businesses table
-- This stores the Google Maps URL for the business
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS google_place_url TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_google_place_url
ON businesses(google_place_url)
WHERE google_place_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN businesses.google_place_url IS 'Google Maps URL for the business (e.g., https://maps.google.com/?cid=...)';
