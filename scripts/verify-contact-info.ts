/**
 * Contact Info Verification Script using GPT-4o-mini Batch API
 *
 * This script:
 * 1. Fetches businesses with websites
 * 2. Scrapes their contact pages
 * 3. Uses GPT-4o-mini to extract verified contact info
 * 4. Updates the database with verified data only
 *
 * Usage:
 *   npx tsx scripts/verify-contact-info.ts --limit=100
 *   npx tsx scripts/verify-contact-info.ts --process-batch=batch_xxxxx
 *
 * Cost: ~$0.0002 per business with Batch API (50% off)
 * Total for 46k businesses: ~$10-12 USD
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const BATCH_LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '100')
const PROCESS_BATCH = process.argv.find(arg => arg.startsWith('--process-batch='))?.split('=')[1]
const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_DIR = path.join(process.cwd(), 'scripts', 'contact-verification-batches')

interface Business {
  id: string
  name: string
  slug: string
  website: string
  address: string | null
  phone: string | null
  email: string | null
  city: string | null
  postal_code: string | null
}

interface VerifiedContact {
  address: string | null
  phone: string | null
  email: string | null
  city: string | null
  postal_code: string | null
  confidence: 'high' | 'medium' | 'low' | 'none'
}

// Initialize Supabase client
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  }

  return createClient(url, key)
}

// Fetch page content with timeout
async function fetchPageContent(url: string, timeout = 10000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Try to find contact page
    const contactUrls = [
      url.replace(/\/$/, '') + '/contact',
      url.replace(/\/$/, '') + '/contactez-nous',
      url.replace(/\/$/, '') + '/nous-joindre',
      url.replace(/\/$/, '') + '/contact-us',
      url, // Fallback to homepage
    ]

    for (const contactUrl of contactUrls) {
      try {
        const response = await fetch(contactUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; QuebecBusinessBot/1.0)',
            'Accept': 'text/html',
          },
        })

        if (response.ok) {
          clearTimeout(timeoutId)
          const html = await response.text()

          // Extract text content (remove scripts, styles, etc.)
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 8000) // Limit to ~8k chars to stay within token limits

          return textContent
        }
      } catch {
        // Try next URL
        continue
      }
    }

    clearTimeout(timeoutId)
    return null
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error)
    return null
  }
}

// Create prompt for GPT
function createVerificationPrompt(business: Business, pageContent: string): string {
  return `Tu es un expert en extraction de données. Analyse le contenu de cette page web et extrait les informations de contact EXACTES pour cette entreprise.

ENTREPRISE: ${business.name}
SITE WEB: ${business.website}
VILLE ATTENDUE: ${business.city || 'Québec'}

CONTENU DE LA PAGE:
${pageContent}

DONNÉES ACTUELLES DANS NOTRE BASE (potentiellement incorrectes):
- Adresse: ${business.address || 'Non disponible'}
- Téléphone: ${business.phone || 'Non disponible'}
- Code postal: ${business.postal_code || 'Non disponible'}

INSTRUCTIONS:
1. Extrait UNIQUEMENT les informations que tu trouves EXPLICITEMENT sur la page
2. Si tu ne trouves pas une information avec certitude, mets null
3. Le téléphone doit être au format québécois: (XXX) XXX-XXXX ou XXX-XXX-XXXX
4. L'adresse doit être complète avec numéro civique et rue
5. Le code postal doit être au format canadien: X0X 0X0

Réponds UNIQUEMENT en JSON valide:
{
  "address": "adresse complète ou null",
  "phone": "téléphone formaté ou null",
  "email": "email ou null",
  "city": "ville ou null",
  "postal_code": "code postal ou null",
  "confidence": "high/medium/low/none"
}

RÈGLES DE CONFIANCE:
- high: Information trouvée clairement sur la page, correspond au nom de l'entreprise
- medium: Information trouvée mais légère incertitude
- low: Information possiblement pour une autre entreprise/succursale
- none: Aucune information trouvée`
}

// Create batch file for OpenAI Batch API
async function createBatchFile(businesses: Business[]): Promise<string> {
  if (!fs.existsSync(BATCH_DIR)) {
    fs.mkdirSync(BATCH_DIR, { recursive: true })
  }

  const batchId = `batch_${Date.now()}`
  const inputFile = path.join(BATCH_DIR, `${batchId}_input.jsonl`)
  const metadataFile = path.join(BATCH_DIR, `${batchId}_metadata.json`)

  console.log(`\n📥 Fetching page content for ${businesses.length} businesses...`)

  const requests: string[] = []
  const metadata: Record<string, { businessId: string; name: string }> = {}

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i]
    process.stdout.write(`\r   Processing ${i + 1}/${businesses.length}: ${business.name.slice(0, 40)}...`)

    const pageContent = await fetchPageContent(business.website)

    if (!pageContent) {
      console.log(`\n   ⚠️  Could not fetch content for ${business.name}`)
      continue
    }

    const customId = `biz_${business.id}`
    metadata[customId] = { businessId: business.id, name: business.name }

    const request = {
      custom_id: customId,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: createVerificationPrompt(business, pageContent)
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }
    }

    requests.push(JSON.stringify(request))

    // Small delay to avoid overwhelming servers
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('\n')

  // Write batch input file
  fs.writeFileSync(inputFile, requests.join('\n'))
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2))

  console.log(`✅ Created batch file: ${inputFile}`)
  console.log(`   Requests: ${requests.length}`)
  console.log(`   Metadata: ${metadataFile}`)

  return batchId
}

// Submit batch to OpenAI
async function submitBatch(batchId: string): Promise<string> {
  const inputFile = path.join(BATCH_DIR, `${batchId}_input.jsonl`)

  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }

  console.log('\n📤 Uploading batch file to OpenAI...')

  // Upload file
  const fileContent = fs.readFileSync(inputFile)
  const formData = new FormData()
  formData.append('file', new Blob([fileContent]), `${batchId}_input.jsonl`)
  formData.append('purpose', 'batch')

  const uploadResponse = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    throw new Error(`Failed to upload file: ${error}`)
  }

  const uploadResult = await uploadResponse.json()
  const fileId = uploadResult.id
  console.log(`   File uploaded: ${fileId}`)

  // Create batch
  console.log('\n📋 Creating batch job...')
  const batchResponse = await fetch('https://api.openai.com/v1/batches', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input_file_id: fileId,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
      metadata: {
        description: `Contact verification batch ${batchId}`,
      }
    }),
  })

  if (!batchResponse.ok) {
    const error = await batchResponse.text()
    throw new Error(`Failed to create batch: ${error}`)
  }

  const batchResult = await batchResponse.json()
  console.log(`   Batch created: ${batchResult.id}`)
  console.log(`   Status: ${batchResult.status}`)

  // Save batch ID for later retrieval
  const statusFile = path.join(BATCH_DIR, `${batchId}_status.json`)
  fs.writeFileSync(statusFile, JSON.stringify({
    localBatchId: batchId,
    openAiBatchId: batchResult.id,
    fileId: fileId,
    createdAt: new Date().toISOString(),
    status: batchResult.status,
  }, null, 2))

  return batchResult.id
}

// Check batch status and process results
async function processBatchResults(openAiBatchId: string): Promise<void> {
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY environment variable')
  }

  console.log(`\n🔍 Checking batch status: ${openAiBatchId}`)

  const statusResponse = await fetch(`https://api.openai.com/v1/batches/${openAiBatchId}`, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
  })

  if (!statusResponse.ok) {
    throw new Error(`Failed to get batch status: ${await statusResponse.text()}`)
  }

  const batchStatus = await statusResponse.json()
  console.log(`   Status: ${batchStatus.status}`)
  console.log(`   Completed: ${batchStatus.request_counts?.completed || 0}`)
  console.log(`   Failed: ${batchStatus.request_counts?.failed || 0}`)

  if (batchStatus.status !== 'completed') {
    console.log('\n⏳ Batch not yet completed. Run this command again later.')
    return
  }

  // Download results
  const outputFileId = batchStatus.output_file_id
  if (!outputFileId) {
    throw new Error('No output file available')
  }

  console.log('\n📥 Downloading results...')
  const fileResponse = await fetch(`https://api.openai.com/v1/files/${outputFileId}/content`, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
  })

  if (!fileResponse.ok) {
    throw new Error(`Failed to download results: ${await fileResponse.text()}`)
  }

  const resultsText = await fileResponse.text()
  const results = resultsText.trim().split('\n').map(line => JSON.parse(line))

  console.log(`   Downloaded ${results.length} results`)

  // Find metadata file
  const metadataFiles = fs.readdirSync(BATCH_DIR).filter(f => f.endsWith('_metadata.json'))
  let metadata: Record<string, { businessId: string; name: string }> = {}

  for (const file of metadataFiles) {
    const content = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, file), 'utf-8'))
    metadata = { ...metadata, ...content }
  }

  // Process results and update database
  const supabase = getSupabaseClient()
  let updatedCount = 0
  let skippedCount = 0

  console.log('\n📝 Updating database...')

  for (const result of results) {
    const customId = result.custom_id
    const businessInfo = metadata[customId]

    if (!businessInfo) {
      console.log(`   ⚠️  Unknown custom_id: ${customId}`)
      continue
    }

    try {
      const content = result.response?.body?.choices?.[0]?.message?.content
      if (!content) {
        console.log(`   ⚠️  No content for ${businessInfo.name}`)
        skippedCount++
        continue
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.log(`   ⚠️  Invalid JSON for ${businessInfo.name}`)
        skippedCount++
        continue
      }

      const verified: VerifiedContact = JSON.parse(jsonMatch[0])

      // Only update if confidence is high or medium
      if (verified.confidence === 'none' || verified.confidence === 'low') {
        console.log(`   ⏭️  Low confidence for ${businessInfo.name}, clearing unverified data`)

        // Clear unverified data
        await supabase
          .from('businesses')
          .update({
            verified_address: null,
            verified_phone: null,
            verified_email: verified.email, // Still save email for internal use
            verified_at: new Date().toISOString(),
            verification_confidence: verified.confidence,
          })
          .eq('id', businessInfo.businessId)

        skippedCount++
        continue
      }

      // Update with verified data
      const updateData: Record<string, any> = {
        verified_at: new Date().toISOString(),
        verification_confidence: verified.confidence,
      }

      // Only set fields that were found with confidence
      if (verified.address) updateData.verified_address = verified.address
      if (verified.phone) updateData.verified_phone = verified.phone
      if (verified.email) updateData.verified_email = verified.email
      if (verified.city) updateData.verified_city = verified.city
      if (verified.postal_code) updateData.verified_postal_code = verified.postal_code

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessInfo.businessId)

      if (error) {
        console.log(`   ❌ Failed to update ${businessInfo.name}: ${error.message}`)
        continue
      }

      console.log(`   ✅ ${businessInfo.name} (${verified.confidence})`)
      updatedCount++

    } catch (error) {
      console.log(`   ❌ Error processing ${businessInfo.name}:`, error)
      skippedCount++
    }
  }

  console.log('\n📈 Summary:')
  console.log(`   ✅ Updated: ${updatedCount}`)
  console.log(`   ⏭️  Skipped: ${skippedCount}`)
}

// Main function
async function main() {
  console.log('🔍 Contact Info Verification Script')
  console.log('====================================\n')

  if (!OPENAI_API_KEY) {
    console.error('❌ Missing OPENAI_API_KEY environment variable')
    process.exit(1)
  }

  // If processing existing batch
  if (PROCESS_BATCH) {
    await processBatchResults(PROCESS_BATCH)
    return
  }

  const supabase = getSupabaseClient()

  // Fetch businesses that need verification
  console.log('📊 Fetching businesses to verify...')
  // Simple query to avoid timeout - just get businesses with websites
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, slug, website, address, phone, email, city, postal_code')
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

  console.log(`   Found ${businesses.length} businesses to verify`)

  // Estimate cost
  const estimatedCost = (businesses.length * 0.0002).toFixed(2)
  console.log(`   Estimated cost: ~$${estimatedCost} USD (Batch API 50% off)`)

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would create batch for verification')
    return
  }

  // Create and submit batch
  const batchId = await createBatchFile(businesses as Business[])
  const openAiBatchId = await submitBatch(batchId)

  console.log('\n✅ Batch submitted successfully!')
  console.log(`\nTo check status and process results, run:`)
  console.log(`   npx tsx scripts/verify-contact-info.ts --process-batch=${openAiBatchId}`)
}

main().catch(console.error)
