/**
 * Simple Contact Verification Script using OpenAI
 *
 * Asks OpenAI directly for verified contact info based on business name and website
 *
 * Usage:
 *   npx tsx scripts/verify-contact-simple.ts --limit=100
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const BATCH_LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '10')
const DRY_RUN = process.argv.includes('--dry-run')

interface Business {
  id: string
  name: string
  slug: string
  website: string
  city: string | null
}

interface VerifiedContact {
  address: string | null
  phone: string | null
  email: string | null
  city: string | null
  postal_code: string | null
  confidence: 'high' | 'medium' | 'low' | 'none'
}

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  }

  return createClient(url, key)
}

async function getContactInfo(business: Business): Promise<VerifiedContact | null> {
  const prompt = `Voici les coordonnées de la compagnie "${business.name}", située dans la province de Québec.
Site web: ${business.website}
${business.city ? `Ville connue: ${business.city}` : ''}

IMPORTANT: Retourne UNIQUEMENT les informations que tu connais avec certitude. Si tu n'es pas sûr, retourne null pour ce champ.

Réponds en JSON uniquement (pas de markdown, pas de texte):
{
  "address": "adresse complète ou null",
  "phone": "numéro de téléphone ou null",
  "email": "email ou null",
  "city": "ville ou null",
  "postal_code": "code postal ou null",
  "confidence": "high si tu es certain, medium si probable, low si incertain, none si tu ne trouves rien"
}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      console.error(`   API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return null
    }

    // Parse JSON response
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const verified = JSON.parse(cleanContent) as VerifiedContact

    return verified
  } catch (error) {
    console.error(`   Error:`, error)
    return null
  }
}

async function main() {
  console.log('🔍 Simple Contact Verification Script')
  console.log('=====================================\n')

  if (!OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY environment variable')
    process.exit(1)
  }

  const supabase = getSupabaseClient()

  // Fetch businesses with websites
  console.log(`📊 Fetching ${BATCH_LIMIT} businesses to verify...`)
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, slug, website, city')
    .not('website', 'is', null)
    .not('website', 'eq', '')
    .limit(BATCH_LIMIT)

  if (error) {
    console.error('❌ Failed to fetch businesses:', error)
    process.exit(1)
  }

  if (!businesses || businesses.length === 0) {
    console.log('✅ No businesses to verify!')
    return
  }

  console.log(`   Found ${businesses.length} businesses\n`)

  // Estimate cost
  const estimatedCost = (businesses.length * 0.0003).toFixed(4)
  console.log(`💰 Estimated cost: ~$${estimatedCost} USD\n`)

  if (DRY_RUN) {
    console.log('🏃 DRY RUN - not making actual API calls')
    return
  }

  let updatedCount = 0
  let skippedCount = 0

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i]
    process.stdout.write(`\r[${i + 1}/${businesses.length}] ${business.name.slice(0, 50).padEnd(50)}`)

    const verified = await getContactInfo(business)

    if (!verified || verified.confidence === 'none') {
      skippedCount++
      continue
    }

    // Only update if we have high or medium confidence
    if (verified.confidence === 'low') {
      skippedCount++
      continue
    }

    // Update database
    const updateData: Record<string, unknown> = {
      verified_at: new Date().toISOString(),
      verification_confidence: verified.confidence,
    }

    if (verified.address) updateData.verified_address = verified.address
    if (verified.phone) updateData.verified_phone = verified.phone
    if (verified.email) updateData.verified_email = verified.email
    if (verified.city) updateData.verified_city = verified.city
    if (verified.postal_code) updateData.verified_postal_code = verified.postal_code

    const { error: updateError } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', business.id)

    if (updateError) {
      console.log(`\n   ❌ Failed to update ${business.name}: ${updateError.message}`)
      continue
    }

    updatedCount++

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('\n\n📈 Summary:')
  console.log(`   ✅ Updated: ${updatedCount}`)
  console.log(`   ⏭️  Skipped: ${skippedCount}`)
}

main().catch(console.error)
