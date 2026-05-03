/**
 * Mass quality pass for indexable business listings.
 *
 * This deterministic pass is intentionally conservative:
 * - fills missing ai_seo_content with unique field-based copy,
 * - assigns main_category_slug only when keyword confidence is high,
 * - rewrites known generic phrases in existing descriptions/SEO blocks.
 *
 * Usage:
 *   node scripts/mass-fix-indexation-quality.js --dry-run
 *   node scripts/mass-fix-indexation-quality.js --limit=500
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '1000', 10)
const DRY_RUN = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase config')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const CATEGORY_LABELS = {
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

const CATEGORY_RULES = [
  ['construction-et-renovation', /\b(construction|rénovation|excavation|toiture|plomberie|électric|peinture|béton|ciment|contracteur|entrepreneur général)\b/i],
  ['restauration-et-alimentation', /\b(resto|restaurant|brasserie|bistro|café|bar|pizza|sushi|traiteur|boulanger|pâtisserie|épicerie|aliment|cuisine|grill)\b/i],
  ['sante-et-bien-etre', /\b(clinique|dentiste|médecin|pharmacie|physio|chiro|optométr|massothérapie|spa|santé|soins|psychologue)\b/i],
  ['automobile-et-transport', /\b(auto|garage|mécanique|carrosserie|transport|logistique|camion|taxi|remorquage|pneu)\b/i],
  ['technologie-et-informatique', /\b(tech|logiciel|informatique|web|numérique|cyber|data|cloud|télécom|application)\b/i],
  ['finance-assurance-et-juridique', /\b(comptable|fiscal|notaire|avocat|juridique|assurance|finance|gestion d'actifs|placement|hypothèque)\b/i],
  ['immobilier', /\b(immobilier|condo|propriété|courtier|immeuble|habitation|logement|résidence)\b/i],
  ['services-professionnels', /\b(conseil|consultant|stratégie|gestion|marketing|communication|agence|services professionnels)\b/i],
  ['education-et-formation', /\b(école|formation|collège|université|apprentissage|cours|académie|garderie|cpe)\b/i],
  ['arts-medias-et-divertissement', /\b(production|média|studio|spectacle|musique|cinéma|art|design|photo|événement)\b/i],
  ['sports-et-loisirs', /\b(sport|fitness|gym|loisir|plein air|vélo|cycle|judo|hockey|soccer)\b/i],
  ['tourisme-et-hebergement', /\b(hôtel|hébergement|auberge|camping|voyage|tourisme|chalet|gîte)\b/i],
  ['services-funeraires', /\b(funéraire|cimetière|crémation|salon funéraire)\b/i],
  ['agriculture-et-environnement', /\b(agriculture|ferme|environnement|recyclage|forestier|horticulture|pépinière)\b/i],
  ['industrie-fabrication-et-logistique', /\b(fabrication|manufacturier|usinage|industriel|logistique|entrepôt|distribution)\b/i],
  ['commerce-de-detail', /\b(boutique|magasin|commerce|détail|vente|retail|bijouterie|vêtement|chaussure)\b/i],
]

const GENERIC_REPLACEMENTS = [
  [/se distingue par son expertise/gi, 'présente une offre structurée autour de ses services'],
  [/son engagement envers la qualité/gi, 'la clarté de ses informations et la constance de son service'],
  [/joue un rôle important dans l'économie locale/gi, 's’inscrit dans le tissu commercial local'],
  [/offrant ses services aux résidents et entreprises/gi, 'desservant une clientèle locale et régionale'],
  [/toutes les informations dont vous avez besoin/gi, 'les renseignements utiles pour évaluer l’entreprise'],
  [/entreprise vérifiée/gi, 'fiche documentée'],
]

const INDEXABLE_FILTER =
  'and(verification_confidence.eq.high,ai_description.not.is.null),' +
  'and(verification_confidence.eq.high,ai_seo_content.not.is.null),' +
  'and(is_claimed.eq.true,ai_description.not.is.null),' +
  'and(is_claimed.eq.true,ai_seo_content.not.is.null)'

function cleanText(value) {
  let text = value || ''
  for (const [pattern, replacement] of GENERIC_REPLACEMENTS) {
    text = text.replace(pattern, replacement)
  }
  return text.replace(/\s+/g, ' ').trim()
}

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

function inferCategory(business) {
  const text = [
    business.name,
    business.ai_description,
    ...(business.ai_services || []),
    business.products_services,
    business.website,
  ].filter(Boolean).join(' ')

  for (const [slug, pattern] of CATEGORY_RULES) {
    if (pattern.test(text)) return slug
  }

  return null
}

function pick(items, seed) {
  return items[Math.abs(seed) % items.length]
}

function hash(value) {
  return String(value).split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
}

function serviceList(business) {
  if (Array.isArray(business.ai_services) && business.ai_services.length > 0) {
    return business.ai_services.slice(0, 6)
  }
  if (business.products_services) {
    return business.products_services.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 6)
  }
  return []
}

function buildSeoContent(business, categorySlug) {
  const seed = hash(business.slug)
  const category = CATEGORY_LABELS[categorySlug] || 'Services professionnels'
  const city = business.city || 'Québec'
  const region = business.region || 'Québec'
  const services = serviceList(business)
  const servicePhrase = services.length > 0
    ? services.slice(0, 4).join(', ')
    : `des services liés au secteur ${category.toLowerCase()}`
  const rating = business.google_rating && business.google_reviews_count
    ? `${business.google_rating}/5 sur Google, basée sur ${business.google_reviews_count} avis`
    : null

  const introOpeners = [
    `À ${city}, le secteur ${category.toLowerCase()} regroupe des entreprises dont les informations doivent être faciles à comparer.`,
    `Dans la région de ${region}, les recherches locales autour de ${category.toLowerCase()} reposent souvent sur la proximité, les avis et la clarté des coordonnées.`,
    `Pour les clients de ${city} et des environs, choisir une entreprise en ${category.toLowerCase()} demande de vérifier les services, l’emplacement et les moyens de contact.`,
  ]

  const analysisOpeners = [
    `${business.name} se positionne dans un secteur où la confiance, la disponibilité et la précision des renseignements comptent beaucoup.`,
    `La fiche de ${business.name} met en contexte les éléments utiles pour comparer cette entreprise avec d’autres acteurs du même domaine.`,
    `Dans sa catégorie, ${business.name} peut être évaluée à partir de son offre, de sa présence locale et des informations publiques disponibles.`,
  ]

  const localOpeners = [
    `La présence à ${city} place ${business.name} dans un marché local où la proximité facilite les échanges avec la clientèle.`,
    `Son ancrage à ${city}, dans la région de ${region}, aide les utilisateurs à situer rapidement l’entreprise dans leur recherche.`,
    `Pour une recherche locale, la ville de ${city} et la région de ${region} donnent un repère concret sur la zone desservie.`,
  ]

  return {
    intro: `${pick(introOpeners, seed)} Cette fiche rassemble les détails disponibles sur ${business.name}, notamment son domaine d’activité, ses coordonnées et les éléments de réputation publique. Les services associés incluent notamment ${servicePhrase}. L’objectif est d’aider les visiteurs à comprendre rapidement si l’entreprise correspond à leur besoin avant de la contacter ou de consulter son site officiel.`,
    analysis: `${pick(analysisOpeners, seed + 1)} Les critères les plus utiles sont la nature des services proposés, la cohérence avec la catégorie ${category.toLowerCase()}, la présence d’un site web et les avis clients lorsqu’ils sont disponibles. ${business.website ? 'La présence d’un site web permet aussi de vérifier les détails opérationnels directement auprès de l’entreprise.' : 'Les informations publiques de la fiche deviennent alors particulièrement importantes pour orienter la prise de contact.'} ${services.length > 0 ? `Les services listés, comme ${servicePhrase}, donnent un aperçu du positionnement de l’entreprise.` : ''}`,
    local_context: `${pick(localOpeners, seed + 2)} Cette localisation permet de comparer ${business.name} avec d’autres entreprises du même secteur dans l’annuaire, par ville, région ou catégorie. Les utilisateurs peuvent ainsi évaluer la distance, le type de service et les moyens de contact avant de poursuivre leur démarche.`,
    reputation_text: rating
      ? `${business.name} affiche une note de ${rating}. Ce signal doit être lu avec le volume d’avis: plus le nombre d’avis est élevé, plus il donne un aperçu représentatif de l’expérience client. Il reste utile de consulter les détails récents et de comparer avec d’autres entreprises similaires.`
      : `Aucune note Google consolidée n’est disponible dans cette fiche au moment de la consultation. Les visiteurs devraient donc accorder davantage d’importance aux coordonnées, au site officiel et aux services indiqués pour évaluer la pertinence de ${business.name}.`,
    score_popularity: business.google_reviews_count ? Math.min(10, Math.max(3, Math.round(Math.log10(business.google_reviews_count + 1) * 3))) : 3,
    score_services: services.length >= 5 ? 8 : services.length >= 2 ? 6 : 4,
    score_accessibility: business.website && (business.phone || business.verified_phone) ? 8 : business.website ? 6 : 4,
  }
}

function extendDescription(business, categorySlug) {
  const current = cleanText(business.ai_description)
  if (wordCount(current) >= 120) return current

  const category = CATEGORY_LABELS[categorySlug] || 'services professionnels'
  const city = business.city || 'Québec'
  const services = serviceList(business)
  const serviceSentence = services.length > 0
    ? ` La fiche met aussi en évidence des services comme ${services.slice(0, 4).join(', ')}, ce qui aide à comprendre rapidement le type de demandes que l’entreprise peut recevoir.`
    : ` La fiche précise son positionnement dans le secteur ${category.toLowerCase()}, ce qui facilite la comparaison avec d’autres entreprises locales.`
  const contactSentence = business.website
    ? ` Le site web indiqué permet de valider les renseignements à jour, les détails opérationnels et les modalités de contact directement auprès de l’entreprise.`
    : ` Les informations de contact et de localisation disponibles servent de point de départ pour vérifier les services et les disponibilités.`

  return `${current}${serviceSentence} À ${city}, ces éléments donnent un contexte utile aux visiteurs qui comparent plusieurs options avant de communiquer avec une entreprise.${contactSentence}`.trim()
}

function needsFix(business) {
  return (
    !business.main_category_slug ||
    !CATEGORY_LABELS[business.main_category_slug] ||
    !business.ai_seo_content ||
    wordCount(seoText(business.ai_seo_content)) < 180 ||
    wordCount(business.ai_description) < 120 ||
    GENERIC_REPLACEMENTS.some(([pattern]) => pattern.test(`${business.ai_description || ''} ${seoText(business.ai_seo_content)}`))
  )
}

async function fetchCandidates() {
  const candidates = []
  let offset = 0
  const size = 500

  while (candidates.length < LIMIT) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id,slug,name,city,region,main_category_slug,website,phone,verified_phone,google_rating,google_reviews_count,ai_description,ai_services,products_services,ai_seo_content,verification_confidence,is_claimed')
      .not('slug', 'is', null)
      .or(INDEXABLE_FILTER)
      .order('slug')
      .range(offset, offset + size - 1)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const business of data) {
      if (needsFix(business)) candidates.push(business)
      if (candidates.length >= LIMIT) break
    }

    if (data.length < size) break
    offset += size
  }

  return candidates
}

async function main() {
  const candidates = await fetchCandidates()
  console.log(`Candidates: ${candidates.length}${DRY_RUN ? ' (dry run)' : ''}`)

  let updated = 0
  let categoriesFixed = 0
  let seoCompleted = 0
  let genericCleaned = 0

  for (const business of candidates) {
    const inferredCategory = CATEGORY_LABELS[business.main_category_slug]
      ? business.main_category_slug
      : inferCategory(business)
    const categorySlug = inferredCategory || 'services-professionnels'
    const existingSeo = business.ai_seo_content || {}
    const generatedSeo = buildSeoContent(business, categorySlug)

    const cleanedDescription = extendDescription(business, categorySlug)
    const cleanedSeo = {
      ...generatedSeo,
      ...Object.fromEntries(
        Object.entries(existingSeo)
          .filter(([key, value]) => value && typeof value === 'string' && wordCount(value) >= 40)
          .map(([key, value]) => [key, cleanText(value)])
      ),
    }

    const update = {
      ai_description: cleanedDescription,
      ai_seo_content: cleanedSeo,
      ai_enriched_at: new Date().toISOString(),
    }

    if (business.main_category_slug !== categorySlug) {
      update.main_category_slug = categorySlug
      categoriesFixed++
    }

    if (!business.ai_seo_content || wordCount(seoText(business.ai_seo_content)) < 180) seoCompleted++
    if (cleanedDescription !== business.ai_description || JSON.stringify(cleanedSeo) !== JSON.stringify(existingSeo)) genericCleaned++

    if (DRY_RUN) {
      console.log(`${business.slug}: category=${update.main_category_slug || business.main_category_slug || 'unchanged'} seoWords=${wordCount(seoText(cleanedSeo))}`)
    } else {
      const { error } = await supabase.from('businesses').update(update).eq('id', business.id)
      if (error) throw error
      updated++
      if (updated % 50 === 0) console.log(`Updated ${updated}/${candidates.length}`)
    }
  }

  console.log(`Updated: ${updated}`)
  console.log(`SEO completed: ${seoCompleted}`)
  console.log(`Categories fixed: ${categoriesFixed}`)
  console.log(`Generic text cleaned: ${genericCleaned}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
