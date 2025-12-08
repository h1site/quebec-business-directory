/**
 * Setup AI fields in Supabase
 * This script adds the AI enrichment columns to the businesses table
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndAddColumns() {
  console.log('🔍 Checking AI columns in businesses table...\n')

  // Check if columns exist by trying to select them
  const { data, error } = await supabase
    .from('businesses')
    .select('ai_description, ai_enriched_at')
    .limit(1)

  if (error && error.message.includes('column')) {
    console.log('❌ AI columns do not exist yet.')
    console.log('\n📋 Please run this SQL in Supabase SQL Editor:\n')
    console.log(`
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS ai_description TEXT,
ADD COLUMN IF NOT EXISTS ai_description_en TEXT,
ADD COLUMN IF NOT EXISTS ai_services TEXT[],
ADD COLUMN IF NOT EXISTS ai_services_en TEXT[],
ADD COLUMN IF NOT EXISTS ai_faq JSONB,
ADD COLUMN IF NOT EXISTS ai_enriched_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_businesses_ai_enriched
ON businesses (ai_enriched_at)
WHERE ai_enriched_at IS NULL;
    `)
    return false
  }

  console.log('✅ AI columns already exist!')

  // Count businesses without AI enrichment
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('ai_enriched_at', null)

  console.log(`📊 Businesses without AI enrichment: ${count?.toLocaleString() || 'unknown'}`)

  return true
}

checkAndAddColumns()
