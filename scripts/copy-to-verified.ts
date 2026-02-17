/**
 * Copy regular fields to verified_ fields for all enriched businesses
 *
 * For businesses with ai_description (enriched), copies:
 *   phone → verified_phone
 *   email → verified_email
 *   address → verified_address
 *   city → verified_city
 *   postal_code → verified_postal_code
 *
 * Only updates where verified_ field is currently NULL.
 *
 * Usage:
 *   npx tsx scripts/copy-to-verified.ts
 *   npx tsx scripts/copy-to-verified.ts --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_SIZE = 500

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  }

  return createClient(url, key)
}

async function main() {
  console.log('📋 Copy regular fields → verified_ fields for enriched businesses')
  console.log('=================================================================\n')

  if (DRY_RUN) {
    console.log('🏃 DRY RUN - no changes will be made\n')
  }

  const supabase = getSupabaseClient()

  // Count enriched businesses
  const { count: totalEnriched } = await supabase
    .from('businesses')
    .select('id', { count: 'exact', head: true })
    .not('ai_description', 'is', null)

  console.log(`📊 Total enriched businesses: ${totalEnriched}\n`)

  // Process in batches
  let offset = 0
  let totalUpdated = 0
  let totalSkipped = 0
  const fieldStats = {
    phone: 0,
    email: 0,
    address: 0,
    city: 0,
    postal_code: 0,
  }

  while (true) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, phone, email, address, city, postal_code, verified_phone, verified_email, verified_address, verified_city, verified_postal_code')
      .not('ai_description', 'is', null)
      .order('id')
      .range(offset, offset + BATCH_SIZE - 1)

    if (error) {
      console.error('❌ Error fetching businesses:', error.message)
      break
    }

    if (!businesses || businesses.length === 0) break

    for (const biz of businesses) {
      const updates: Record<string, string> = {}

      if (!biz.verified_phone && biz.phone) {
        updates.verified_phone = biz.phone
        fieldStats.phone++
      }
      if (!biz.verified_email && biz.email) {
        updates.verified_email = biz.email
        fieldStats.email++
      }
      if (!biz.verified_address && biz.address) {
        updates.verified_address = biz.address
        fieldStats.address++
      }
      if (!biz.verified_city && biz.city) {
        updates.verified_city = biz.city
        fieldStats.city++
      }
      if (!biz.verified_postal_code && biz.postal_code) {
        updates.verified_postal_code = biz.postal_code
        fieldStats.postal_code++
      }

      if (Object.keys(updates).length === 0) {
        totalSkipped++
        continue
      }

      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update(updates)
          .eq('id', biz.id)

        if (updateError) {
          console.error(`   ❌ Failed to update ${biz.name}: ${updateError.message}`)
          continue
        }
      }

      totalUpdated++
    }

    process.stdout.write(`\r   Processed ${offset + businesses.length} / ${totalEnriched}...`)
    offset += BATCH_SIZE

    if (businesses.length < BATCH_SIZE) break
  }

  console.log('\n\n📈 Summary:')
  console.log(`   ✅ Updated: ${totalUpdated}`)
  console.log(`   ⏭️  Skipped (already verified or no data): ${totalSkipped}`)
  console.log('\n📊 Fields copied:')
  console.log(`   📞 Phone: ${fieldStats.phone}`)
  console.log(`   📧 Email: ${fieldStats.email}`)
  console.log(`   🏠 Address: ${fieldStats.address}`)
  console.log(`   🏙️  City: ${fieldStats.city}`)
  console.log(`   📮 Postal code: ${fieldStats.postal_code}`)
}

main().catch(console.error)
