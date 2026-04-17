/**
 * Generate pillar pages: "Top X businesses in [category] in [city]"
 * Each page: unique intro/criteria/conclusion via OpenAI
 * Business list is computed at render-time from DB
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const CITIES = [
  'Montréal', 'Québec', 'Laval', 'Longueuil', 'Gatineau',
  'Sherbrooke', 'Lévis', 'Brossard', 'Terrebonne', 'Trois-Rivières',
]

const CATEGORIES = {
  'technologie-et-informatique': { fr: 'technologie et informatique', en: 'technology and IT', noun_fr: 'entreprises technologiques', noun_en: 'tech companies' },
  'restauration-et-alimentation': { fr: 'restauration et alimentation', en: 'restaurants and food', noun_fr: 'restaurants', noun_en: 'restaurants' },
  'sante-et-bien-etre': { fr: 'santé et bien-être', en: 'health and wellness', noun_fr: 'cliniques de santé', noun_en: 'health clinics' },
  'construction-et-renovation': { fr: 'construction et rénovation', en: 'construction and renovation', noun_fr: 'entrepreneurs en construction', noun_en: 'construction companies' },
  'finance-assurance-et-juridique': { fr: 'finance, assurance et juridique', en: 'finance, insurance and legal', noun_fr: 'cabinets financiers et juridiques', noun_en: 'financial and legal firms' },
  'services-professionnels': { fr: 'services professionnels', en: 'professional services', noun_fr: 'services professionnels', noun_en: 'professional services' },
  'commerce-de-detail': { fr: 'commerce de détail', en: 'retail', noun_fr: 'commerces de détail', noun_en: 'retail stores' },
  'immobilier': { fr: 'immobilier', en: 'real estate', noun_fr: 'agences immobilières', noun_en: 'real estate agencies' },
}

// Per city: top categories based on count (only include where >= 10 biz)
const CITY_CATEGORIES = {
  'Montréal': ['technologie-et-informatique', 'finance-assurance-et-juridique', 'restauration-et-alimentation', 'sante-et-bien-etre', 'services-professionnels'],
  'Québec': ['technologie-et-informatique', 'finance-assurance-et-juridique', 'services-professionnels', 'restauration-et-alimentation', 'sante-et-bien-etre'],
  'Laval': ['technologie-et-informatique', 'sante-et-bien-etre', 'restauration-et-alimentation', 'services-professionnels', 'construction-et-renovation'],
  'Longueuil': ['technologie-et-informatique', 'commerce-de-detail', 'finance-assurance-et-juridique', 'restauration-et-alimentation', 'services-professionnels'],
  'Gatineau': ['technologie-et-informatique', 'construction-et-renovation', 'sante-et-bien-etre', 'services-professionnels', 'commerce-de-detail'],
  'Sherbrooke': ['technologie-et-informatique', 'sante-et-bien-etre', 'commerce-de-detail', 'restauration-et-alimentation', 'finance-assurance-et-juridique'],
  'Lévis': ['technologie-et-informatique', 'construction-et-renovation', 'finance-assurance-et-juridique', 'commerce-de-detail', 'services-professionnels'],
  'Brossard': ['technologie-et-informatique', 'immobilier', 'commerce-de-detail', 'finance-assurance-et-juridique', 'sante-et-bien-etre'],
  'Terrebonne': ['technologie-et-informatique', 'sante-et-bien-etre', 'restauration-et-alimentation', 'construction-et-renovation', 'commerce-de-detail'],
  'Trois-Rivières': ['technologie-et-informatique', 'sante-et-bien-etre', 'restauration-et-alimentation', 'commerce-de-detail', 'finance-assurance-et-juridique'],
}

function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function callOpenAI(prompt, maxTokens = 1500) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  })
  const d = await res.json()
  return d.choices?.[0]?.message?.content || ''
}

async function generatePage(city, categorySlug) {
  const cat = CATEGORIES[categorySlug]
  if (!cat) return null

  const slug = `top-${slugify(cat.fr)}-${slugify(city)}`
  const titleFr = `Top 10 des meilleurs ${cat.noun_fr} à ${city} en 2026`
  const titleEn = `Top 10 Best ${cat.noun_en} in ${city} for 2026`

  console.log(`\n📝 ${slug}`)

  // Check if exists
  const { data: existing } = await supabase.from('top_pages').select('slug').eq('slug', slug).maybeSingle()
  if (existing) {
    console.log('  ⏭  Already exists, skip')
    return null
  }

  const prompt = `Tu écris une page pilier SEO pour un annuaire d'entreprises québécoises (Registre du Québec).

SUJET: "${titleFr}"
VILLE: ${city}
CATÉGORIE: ${cat.fr}

Génère 3 sections distinctes en français, séparées par "---":

SECTION 1 - INTRODUCTION (200-250 mots): Pourquoi chercher un ${cat.noun_fr.slice(0, -1)} à ${city} en 2026. Mentionne le contexte local (population, économie, spécificités de ${city}). Utilise des données concrètes. Termine en annonçant la sélection qui suit.

---

SECTION 2 - CRITÈRES DE SÉLECTION (150-200 mots): Comment nous avons sélectionné ces 10 entreprises. Liste de 5-6 critères concrets (note Google, nombre d'avis, ancienneté, spécialisation, localisation, etc.). Format: liste à puces markdown avec **gras** pour le critère et explication après.

---

SECTION 3 - CONCLUSION (150-200 mots): Conseils pratiques pour choisir son ${cat.noun_fr.slice(0, -1)} à ${city}. Questions à poser. Red flags à éviter. Termine par un appel à l'action pour consulter les fiches.

STYLE: Ton pro mais accessible, phrases variées, pas de répétition, SEO-friendly avec variations de mots-clés naturelles. PAS de titre H1 (ajouté automatiquement).`

  const response = await callOpenAI(prompt, 2500)
  const sections = response.split(/---+/).map(s => s.trim())
  if (sections.length < 3) {
    console.log(`  ❌ Bad format (${sections.length} sections)`)
    return null
  }

  const [introFr, criteriaFr, conclusionFr] = sections

  // Excerpt
  const excerptFr = `Découvrez notre sélection des 10 meilleurs ${cat.noun_fr} à ${city} en 2026. Classement basé sur notes Google, avis clients et critères de qualité.`.slice(0, 160)

  // English
  const introEn = await callOpenAI(`Translate to English, keep markdown:\n\n${introFr}`, 800)
  const criteriaEn = await callOpenAI(`Translate to English, keep markdown:\n\n${criteriaFr}`, 500)
  const conclusionEn = await callOpenAI(`Translate to English, keep markdown:\n\n${conclusionFr}`, 500)
  const excerptEn = `Our 2026 selection of the 10 best ${cat.noun_en} in ${city}. Ranked by Google reviews, client feedback, and quality criteria.`.slice(0, 160)

  const record = {
    slug,
    city,
    category_slug: categorySlug,
    title_fr: titleFr,
    title_en: titleEn,
    excerpt_fr: excerptFr,
    excerpt_en: excerptEn,
    intro_fr: introFr,
    intro_en: introEn,
    criteria_fr: criteriaFr,
    criteria_en: criteriaEn,
    conclusion_fr: conclusionFr,
    conclusion_en: conclusionEn,
    is_published: true,
    published_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('top_pages').insert(record)
  if (error) {
    console.log(`  ❌ ${error.message}`)
    return null
  }
  console.log(`  ✅ ${titleFr}`)
  return record
}

async function main() {
  let count = 0
  for (const city of CITIES) {
    const cats = CITY_CATEGORIES[city] || []
    for (const catSlug of cats) {
      try {
        await generatePage(city, catSlug)
        count++
      } catch (e) {
        console.log(`  ❌ Error: ${e.message}`)
      }
      await new Promise(r => setTimeout(r, 2000))
    }
  }
  console.log(`\n✅ Done (${count} attempted)`)
}

main().catch(console.error)
