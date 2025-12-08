-- Add AI enrichment fields to businesses table
-- Run this in Supabase SQL Editor

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS ai_description TEXT,
ADD COLUMN IF NOT EXISTS ai_description_en TEXT,
ADD COLUMN IF NOT EXISTS ai_services TEXT[],
ADD COLUMN IF NOT EXISTS ai_services_en TEXT[],
ADD COLUMN IF NOT EXISTS ai_faq JSONB,
ADD COLUMN IF NOT EXISTS ai_enriched_at TIMESTAMPTZ;

-- Create index for finding non-enriched businesses
CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched
ON businesses (ai_enriched_at)
WHERE ai_enriched_at IS NULL;

-- Comment on columns
COMMENT ON COLUMN businesses.ai_description IS 'AI-generated detailed description in French';
COMMENT ON COLUMN businesses.ai_description_en IS 'AI-generated detailed description in English';
COMMENT ON COLUMN businesses.ai_services IS 'AI-generated list of services in French';
COMMENT ON COLUMN businesses.ai_services_en IS 'AI-generated list of services in English';
COMMENT ON COLUMN businesses.ai_faq IS 'AI-generated FAQ as JSON array [{q, a, q_en, a_en}]';
COMMENT ON COLUMN businesses.ai_enriched_at IS 'Timestamp when AI enrichment was performed';
