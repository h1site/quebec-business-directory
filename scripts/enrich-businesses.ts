/**
 * Business Content Enrichment Script using Ollama
 *
 * Usage:
 *   npx tsx scripts/enrich-businesses.ts [--limit=100] [--model=llama3.2]
 *
 * Requirements:
 *   - Ollama running locally (ollama serve)
 *   - Environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.argv.find(arg => arg.startsWith('--model='))?.split('=')[1] || 'llama3.2'
const BATCH_LIMIT = parseInt(process.argv.find(arg => arg.startsWith('--limit='))?.split('=')[1] || '100')
const DRY_RUN = process.argv.includes('--dry-run')

// Category translations for context
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'commerce-de-detail': 'Retail',
  'restaurants-et-alimentation': 'Food & Restaurants',
  'services-professionnels': 'Professional Services',
  'sante-et-bien-etre': 'Health & Wellness',
  'construction-et-renovation': 'Construction & Renovation',
  'automobile': 'Automotive',
  'technologie-et-informatique': 'Technology & IT',
  'finance-et-assurance': 'Finance & Insurance',
  'immobilier': 'Real Estate',
  'education-et-formation': 'Education & Training',
  'arts-et-divertissement': 'Arts & Entertainment',
  'services-aux-entreprises': 'Business Services',
  'transport-et-logistique': 'Transport & Logistics',
  'hebergement-et-tourisme': 'Hospitality & Tourism',
  'agriculture-et-environnement': 'Agriculture & Environment',
  'services-personnels': 'Personal Services',
  'fabrication-et-industrie': 'Manufacturing & Industry',
  'energie-et-utilities': 'Energy & Utilities',
  'organismes-et-associations': 'Organizations & Associations',
  'services-gouvernementaux': 'Government Services',
  'medias-et-communication': 'Media & Communications',
  'sports-et-loisirs': 'Sports & Recreation',
  'services-juridiques': 'Legal Services',
  'mode-et-beaute': 'Fashion & Beauty',
  'animaux-et-veterinaires': 'Pets & Veterinary',
}

interface Business {
  id: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  main_category_slug: string | null
  scian_description: string | null
  products_services: string | null
}

interface EnrichmentResult {
  ai_description: string
  ai_description_en: string
  ai_services: string[]
  ai_services_en: string[]
  ai_faq: Array<{ q: string; a: string; q_en: string; a_en: string }>
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

// Call Ollama API
async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 2000,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.response
}

// Generate enrichment prompt
function createEnrichmentPrompt(business: Business): string {
  const categoryEn = business.main_category_slug
    ? CATEGORY_TRANSLATIONS[business.main_category_slug] || business.main_category_slug
    : 'Business'

  const categoryFr = business.main_category_slug?.replace(/-/g, ' ') || 'entreprise'

  return `Tu es un rédacteur SEO expert pour un annuaire d'entreprises au Québec. Génère du contenu unique et informatif pour cette entreprise.

ENTREPRISE:
- Nom: ${business.name}
- Catégorie: ${categoryFr} (${categoryEn})
- Ville: ${business.city || 'Québec'}
- Région: ${business.region || 'Québec'}
${business.description ? `- Description existante: ${business.description}` : ''}
${business.scian_description ? `- Secteur SCIAN: ${business.scian_description}` : ''}
${business.products_services ? `- Produits/Services: ${business.products_services}` : ''}

GÉNÈRE EN FORMAT JSON STRICT (pas de texte avant ou après):
{
  "description_fr": "Description détaillée de 150-200 mots en français, mentionnant l'entreprise, ses services, sa localisation et sa valeur ajoutée pour les clients québécois",
  "description_en": "English translation of the description, 150-200 words",
  "services_fr": ["service 1", "service 2", "service 3", "service 4", "service 5"],
  "services_en": ["service 1 EN", "service 2 EN", "service 3 EN", "service 4 EN", "service 5 EN"],
  "faq": [
    {"q": "Question fréquente 1 en français?", "a": "Réponse en français", "q_en": "FAQ 1 in English?", "a_en": "Answer in English"},
    {"q": "Question fréquente 2 en français?", "a": "Réponse en français", "q_en": "FAQ 2 in English?", "a_en": "Answer in English"},
    {"q": "Question fréquente 3 en français?", "a": "Réponse en français", "q_en": "FAQ 3 in English?", "a_en": "Answer in English"}
  ]
}

IMPORTANT:
- Le contenu doit être UNIQUE et spécifique à cette entreprise
- Utilise un ton professionnel mais accessible
- Inclus des mots-clés SEO naturellement
- Les services doivent être réalistes pour ce type d'entreprise
- Les FAQ doivent répondre aux vraies questions des clients
- Retourne SEULEMENT le JSON, rien d'autre`
}

// Parse Ollama response
function parseEnrichmentResponse(response: string): EnrichmentResult | null {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response')
      return null
    }

    const data = JSON.parse(jsonMatch[0])

    return {
      ai_description: data.description_fr || '',
      ai_description_en: data.description_en || '',
      ai_services: Array.isArray(data.services_fr) ? data.services_fr : [],
      ai_services_en: Array.isArray(data.services_en) ? data.services_en : [],
      ai_faq: Array.isArray(data.faq) ? data.faq : [],
    }
  } catch (error) {
    console.error('Failed to parse response:', error)
    console.error('Response was:', response.substring(0, 500))
    return null
  }
}

// Main enrichment function
async function enrichBusinesses() {
  console.log('🚀 Starting business enrichment')
  console.log(`   Model: ${OLLAMA_MODEL}`)
  console.log(`   Limit: ${BATCH_LIMIT}`)
  console.log(`   Dry run: ${DRY_RUN}`)
  console.log('')

  // Check Ollama is running
  try {
    const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`)
    if (!healthCheck.ok) throw new Error('Ollama not responding')
    console.log('✅ Ollama is running')
  } catch {
    console.error('❌ Cannot connect to Ollama. Make sure it is running:')
    console.error('   ollama serve')
    process.exit(1)
  }

  const supabase = getSupabaseClient()

  // Fetch businesses without AI enrichment
  console.log('\n📊 Fetching businesses to enrich...')
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, description, city, region, main_category_slug, scian_description, products_services')
    .is('ai_enriched_at', null)
    .not('name', 'is', null)
    .not('city', 'is', null)
    .order('google_rating', { ascending: false, nullsFirst: false })
    .limit(BATCH_LIMIT)

  if (error) {
    console.error('❌ Failed to fetch businesses:', error)
    process.exit(1)
  }

  if (!businesses || businesses.length === 0) {
    console.log('✅ No businesses to enrich!')
    return
  }

  console.log(`   Found ${businesses.length} businesses to enrich\n`)

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i] as Business
    console.log(`[${i + 1}/${businesses.length}] ${business.name} (${business.city})`)

    try {
      const prompt = createEnrichmentPrompt(business)

      if (DRY_RUN) {
        console.log('   [DRY RUN] Would generate content')
        successCount++
        continue
      }

      const response = await callOllama(prompt)
      const enrichment = parseEnrichmentResponse(response)

      if (!enrichment) {
        console.log('   ⚠️  Failed to parse response, skipping')
        errorCount++
        continue
      }

      // Update database
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          ai_description: enrichment.ai_description,
          ai_description_en: enrichment.ai_description_en,
          ai_services: enrichment.ai_services,
          ai_services_en: enrichment.ai_services_en,
          ai_faq: enrichment.ai_faq,
          ai_enriched_at: new Date().toISOString(),
        })
        .eq('id', business.id)

      if (updateError) {
        console.log(`   ❌ Database update failed: ${updateError.message}`)
        errorCount++
        continue
      }

      console.log(`   ✅ Enriched (${enrichment.ai_services.length} services, ${enrichment.ai_faq.length} FAQs)`)
      successCount++

      // Small delay to avoid overwhelming Ollama
      await new Promise(resolve => setTimeout(resolve, 500))

    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      errorCount++
    }
  }

  console.log('\n📈 Summary:')
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
  console.log(`   Total: ${businesses.length}`)
}

// Run
enrichBusinesses().catch(console.error)
