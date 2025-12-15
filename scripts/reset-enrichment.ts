/**
 * Reset AI enrichment for specific businesses or by criteria
 *
 * Usage:
 *   npx tsx scripts/reset-enrichment.ts --slug=plastiques-lr-inc-2
 *   npx tsx scripts/reset-enrichment.ts --category=technologie --limit=100
 *   npx tsx scripts/reset-enrichment.ts --all --limit=50
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const DRY_RUN = process.argv.includes('--dry-run')
const SLUG = process.argv.find(arg => arg.startsWith('--slug='))?.split('=')[1]
const CATEGORY = process.argv.find(arg => arg.startsWith('--category='))?.split('=')[1]
const RESET_ALL = process.argv.includes('--all')
const LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10')

// Initialize Supabase client
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  }

  return createClient(url, key)
}

async function resetEnrichment() {
  console.log('🔄 Reset AI Enrichment')
  console.log(`   Dry run: ${DRY_RUN}`)

  if (!SLUG && !CATEGORY && !RESET_ALL) {
    console.log('\n❌ Please specify what to reset:')
    console.log('   --slug=business-slug     Reset specific business')
    console.log('   --category=category-slug Reset all in category')
    console.log('   --all                    Reset all enriched businesses')
    console.log('   --limit=N                Limit number of resets (default 10)')
    console.log('   --dry-run                Preview without making changes')
    process.exit(1)
  }

  const supabase = getSupabaseClient()

  // Build query
  let query = supabase
    .from('businesses')
    .select('id, name, slug, city, main_category_slug, ai_enriched_at')
    .not('ai_enriched_at', 'is', null)

  if (SLUG) {
    query = query.eq('slug', SLUG)
    console.log(`   Filter: slug = ${SLUG}`)
  } else if (CATEGORY) {
    query = query.eq('main_category_slug', CATEGORY)
    console.log(`   Filter: category = ${CATEGORY}`)
  } else if (RESET_ALL) {
    console.log(`   Filter: all enriched businesses`)
  }

  query = query.limit(LIMIT)
  console.log(`   Limit: ${LIMIT}`)

  const { data: businesses, error } = await query

  if (error) {
    console.error('❌ Failed to fetch businesses:', error)
    process.exit(1)
  }

  if (!businesses || businesses.length === 0) {
    console.log('\n✅ No businesses found matching criteria')
    return
  }

  console.log(`\n📊 Found ${businesses.length} businesses to reset:\n`)

  for (const business of businesses) {
    console.log(`  - ${business.name} (${business.city}) [${business.main_category_slug}]`)
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would reset AI fields for these businesses')
    return
  }

  // Reset AI fields
  const ids = businesses.map(b => b.id)

  const { error: updateError } = await supabase
    .from('businesses')
    .update({
      ai_description: null,
      ai_description_en: null,
      ai_services: null,
      ai_services_en: null,
      ai_faq: null,
      ai_enriched_at: null,
    })
    .in('id', ids)

  if (updateError) {
    console.error('❌ Failed to reset:', updateError)
    process.exit(1)
  }

  console.log(`\n✅ Reset ${businesses.length} businesses`)
  console.log('\nRun the enrichment script to re-enrich them:')
  console.log('   npx tsx scripts/enrich-businesses.ts --limit=50')
}

resetEnrichment().catch(console.error)
