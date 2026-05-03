/**
 * Improve indexable business listing quality.
 *
 * Targets high-quality/claimed listings that are already eligible for indexing
 * but have thin SEO content, missing category, or generic phrasing.
 *
 * Usage:
 *   node scripts/fix-indexation-quality.js --limit=25
 *   node scripts/fix-indexation-quality.js --slug=example-business
 *   node scripts/fix-indexation-quality.js --dry-run --limit=10
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '25', 10)
const SLUG = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1]
const DRY_RUN = process.argv.includes('--dry-run')

if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase config')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CATEGORY_MAP = {
  'agriculture-et-environnement': 'Agriculture et environnement',
  'arts-medias-et-divertissement': 'Arts, médias et divertissement',
  'automobile-et-transport': 'Automobile et transport',
  'commerce-de-detail': 'Commerce de détail',
  'construction-et-renovation': 'Construction et rénovation',
  'education-et-formation': 'Éducation et formation',
  'finance-assurance-et-juridique': 'Finance, assurance et juridique',
  immobilier: 'Immobilier',
  'industrie-fabrication-et-logistique': 'Industrie, fabrication et logistique',
  'maison-et-services-domestiques': 'Maison et services domestiques',
  'organismes-publics-et-communautaires': 'Organismes publics et communautaires',
  'restauration-et-alimentation': 'Restauration et alimentation',
  'sante-et-bien-etre': 'Santé et bien-être',
  'services-funeraires': 'Services funéraires',
  'services-professionnels': 'Services professionnels',
  'soins-a-domicile': 'Soins à domicile',
  'sports-et-loisirs': 'Sports et loisirs',
  'technologie-et-informatique': 'Technologie et informatique',
  'tourisme-et-hebergement': 'Tourisme et hébergement',
}

const GENERIC_PHRASES = [
  'se distingue par son expertise',
  'son engagement envers la qualité',
  "joue un rôle important dans l'économie locale",
  'offrant ses services aux résidents et entreprises',
  'toutes les informations dont vous avez besoin',
  'entreprise vérifiée',
]

function wordCount(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length
}

function seoText(seo) {
  if (!seo || typeof seo !== 'object') return ''
  return ['intro', 'analysis', 'local_context', 'reputation_text']
    .map((key) => seo[key])
    .filter(Boolean)
    .join(' ')
}

function hasGenericPhrasing(business) {
  const haystack = `${business.ai_description || ''} ${seoText(business.ai_seo_content)}`.toLowerCase()
  return GENERIC_PHRASES.some((phrase) => haystack.includes(phrase))
}

function needsQualityFix(business) {
  const descriptionWords = wordCount(business.ai_description)
  const seoWords = wordCount(seoText(business.ai_seo_content))

  return (
    !business.main_category_slug ||
    !business.ai_seo_content ||
    seoWords < 180 ||
    descriptionWords < 120 ||
    hasGenericPhrasing(business)
  )
}

function cleanJsonResponse(value) {
  return value
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
}

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.55,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI ${response.status}: ${body.slice(0, 300)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || null
}

async function generateFix(business) {
  const categoryList = Object.entries(CATEGORY_MAP)
    .map(([slug, label]) => `- ${slug}: ${label}`)
    .join('\n')

  const prompt = `Tu améliores une fiche d'entreprise québécoise pour indexation Google. Priorité: contenu français naturel, spécifique et utile.

RÈGLES STRICTES:
- Réponds seulement en JSON valide.
- N'invente pas d'adresse, téléphone, avis, certification ou fait précis absent des données.
- N'utilise pas ces formulations génériques: ${GENERIC_PHRASES.join('; ')}.
- Écris en français québécois clair, sans ton publicitaire.
- Le contenu doit être différent d'une fiche à l'autre et ancré dans le secteur, la ville, la région, les services, les avis et le site web disponibles.
- Choisis toujours une catégorie parmi la liste fournie. Si la catégorie actuelle est vide ou manifestement mauvaise, corrige-la.

CATÉGORIES DISPONIBLES:
${categoryList}

DONNÉES:
Nom: ${business.name}
Ville: ${business.city || ''}
Région: ${business.region || ''}
Catégorie actuelle: ${business.main_category_slug || 'AUCUNE'}
Site web: ${business.website || ''}
Adresse: ${business.verified_address || business.address || ''}
Téléphone: ${business.verified_phone || business.phone || ''}
Courriel: ${business.verified_email || business.email || ''}
NEQ: ${business.neq || ''}
Note Google: ${business.google_rating || ''} (${business.google_reviews_count || 0} avis)
Services actuels: ${(business.ai_services || []).join(', ') || business.products_services || ''}
Description actuelle: ${business.ai_description || ''}
SEO actuel: ${JSON.stringify(business.ai_seo_content || {})}

JSON attendu:
{
  "category_slug": "slug-valide",
  "category_confidence": "high|medium|low",
  "description_fr": "Description française améliorée de 140 à 220 mots, spécifique à la fiche.",
  "description_en": "English version, concise and accurate.",
  "services_fr": ["5 à 10 services pertinents, courts"],
  "services_en": ["English services"],
  "seo_content": {
    "intro": "90 à 140 mots. Présente le contexte sans commencer par le nom.",
    "analysis": "120 à 180 mots. Positionnement sectoriel, clientèle probable, critères de choix.",
    "local_context": "80 à 130 mots. Ville/région, accessibilité, rôle local sans phrase générique.",
    "reputation_text": "60 à 110 mots. Basé seulement sur la note et le nombre d'avis si disponibles.",
    "score_popularity": 1,
    "score_services": 1,
    "score_accessibility": 1
  },
  "notes": "raison courte des corrections"
}`

  const raw = await callOpenAI(prompt)
  if (!raw) return null
  return JSON.parse(cleanJsonResponse(raw))
}

async function fetchCandidates() {
  let query = supabase
    .from('businesses')
    .select('id,slug,name,city,region,main_category_slug,website,phone,email,address,verified_phone,verified_email,verified_address,neq,google_rating,google_reviews_count,ai_description,ai_description_en,ai_services,ai_services_en,products_services,ai_seo_content,verification_confidence,is_claimed')
    .not('slug', 'is', null)
    .or('verification_confidence.eq.high,is_claimed.eq.true')
    .not('ai_description', 'is', null)
    .order('google_reviews_count', { ascending: false, nullsFirst: false })
    .limit(SLUG ? 1 : LIMIT * 3)

  if (SLUG) query = query.eq('slug', SLUG)

  const { data, error } = await query
  if (error) throw error
  return (data || []).filter(needsQualityFix).slice(0, LIMIT)
}

async function main() {
  console.log(`Indexation quality fix${DRY_RUN ? ' (dry run)' : ''}`)

  const candidates = await fetchCandidates()
  console.log(`Candidates: ${candidates.length}`)

  let updated = 0
  let failed = 0
  let categoriesFixed = 0

  for (let i = 0; i < candidates.length; i++) {
    const business = candidates[i]
    process.stdout.write(`[${i + 1}/${candidates.length}] ${business.slug} `)

    try {
      const result = await generateFix(business)
      if (!result?.seo_content || !result?.description_fr) {
        throw new Error('Missing required generated fields')
      }

      const update = {
        ai_description: result.description_fr,
        ai_description_en: result.description_en || business.ai_description_en || null,
        ai_services: Array.isArray(result.services_fr) ? result.services_fr : business.ai_services,
        ai_services_en: Array.isArray(result.services_en) ? result.services_en : business.ai_services_en,
        ai_seo_content: result.seo_content,
        ai_enriched_at: new Date().toISOString(),
      }

      if (CATEGORY_MAP[result.category_slug] && result.category_slug !== business.main_category_slug) {
        update.main_category_slug = result.category_slug
        categoriesFixed++
      }

      if (DRY_RUN) {
        console.log(`DRY category=${update.main_category_slug || business.main_category_slug}`)
      } else {
        const { error } = await supabase.from('businesses').update(update).eq('id', business.id)
        if (error) throw error
        console.log(`OK category=${update.main_category_slug || business.main_category_slug}`)
        updated++
      }
    } catch (error) {
      console.log(`FAIL ${error.message}`)
      failed++
    }

    await new Promise((resolve) => setTimeout(resolve, 900))
  }

  console.log(`Updated: ${updated}`)
  console.log(`Failed: ${failed}`)
  console.log(`Categories fixed: ${categoriesFixed}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
