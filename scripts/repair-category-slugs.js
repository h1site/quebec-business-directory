/**
 * Conservative category repair based only on business name + slug.
 *
 * This avoids using generated descriptions as category signals.
 *
 * Usage:
 *   node scripts/repair-category-slugs.js --dry-run
 *   node scripts/repair-category-slugs.js --limit=2000
 */

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const LIMIT = parseInt(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || '10000', 10)
const START_OFFSET = parseInt(process.argv.find((a) => a.startsWith('--offset='))?.split('=')[1] || '0', 10)
const DRY_RUN = process.argv.includes('--dry-run')

if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing Supabase config')

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const VALID = new Set([
  'agriculture-et-environnement',
  'arts-medias-et-divertissement',
  'automobile-et-transport',
  'commerce-de-detail',
  'construction-et-renovation',
  'education-et-formation',
  'finance-assurance-et-juridique',
  'immobilier',
  'industrie-fabrication-et-logistique',
  'maison-et-services-domestiques',
  'organismes-publics-et-communautaires',
  'restauration-et-alimentation',
  'sante-et-bien-etre',
  'services-funeraires',
  'services-professionnels',
  'soins-a-domicile',
  'sports-et-loisirs',
  'technologie-et-informatique',
  'tourisme-et-hebergement',
])

const RULES = [
  ['sante-et-bien-etre', /\b(dre?|docteure?|dentiste|orthodontiste|optometriste|optométriste|dermatologue|podiatre|clinique|medical|médical|sante|santé|pharma|chiro|physio|psychologue|veterinaire|vétérinaire)\b/i],
  ['finance-assurance-et-juridique', /\b(comptabil|comptable|cpa|fiscal|impot|impôt|notaire|avocat|juridique|droit|assurance|financ|capital|placement|investissement|commandite|fiducie|fonds)\b/i],
  ['immobilier', /\b(immobilier|immobiliers|condo|condominium|habitation|logement|residence|résidence|propriete|propriété|immeuble|locatif|courtage immobilier|realty)\b/i],
  ['construction-et-renovation', /\b(construction|renovation|rénovation|reno|réno|excavation|toiture|plomberie|electrique|électrique|electric|béton|ciment|plancher|ebenisterie|ébénisterie|aluminium|gouttiere|gouttière|architecte)\b/i],
  ['technologie-et-informatique', /\b(informatique|logiciel|software|technolog|numerique|numérique|web|cyber|data|cloud|telecom|télécom|application|internet)\b/i],
  ['automobile-et-transport', /\b(auto|automobile|garage|mecanique|mécanique|pneu|transport|logistique|camion|cargo|taxi|remorquage|chauffeur|driver)\b/i],
  ['restauration-et-alimentation', /\b(restaurant|resto|brasserie|bistro|cafe|café|bar|pizza|sushi|traiteur|boulanger|patisserie|pâtisserie|epicerie|épicerie|alimentaire|gourmet)\b/i],
  ['arts-medias-et-divertissement', /\b(production|media|média|studio|spectacle|musique|cinema|cinéma|theatre|théâtre|art|galerie|design|photo|joaillier|bijou)\b/i],
  ['sports-et-loisirs', /\b(sport|loisir|fitness|gym|yoga|tennis|judo|hockey|soccer|baseball|darts?|arts martiaux|cycliste|cycle|velo|vélo|plein air)\b/i],
  ['organismes-publics-et-communautaires', /\b(association|fondation|communaute|communauté|congregation|congrégation|organisme|centre communautaire|mission|eglise|église|paroisse)\b/i],
  ['education-et-formation', /\b(ecole|école|formation|college|collège|universite|université|academie|académie|cours|garderie|cpe|apprentissage|conference|conférence)\b/i],
  ['tourisme-et-hebergement', /\b(hotel|hôtel|auberge|camping|tourisme|chalet|gite|gîte|voyage)\b/i],
  ['agriculture-et-environnement', /\b(agric|ferme|environnement|recycl|forest|horticulture|pepiniere|pépinière|compost)\b/i],
  ['industrie-fabrication-et-logistique', /\b(fabrication|manufactur|usinage|industriel|industrie|valves|composants|distribution industrielle)\b/i],
  ['commerce-de-detail', /\b(boutique|magasin|commerce|detail|détail|vente|confection|cosmetique|cosmétique|jouet)\b/i],
  ['services-professionnels', /\b(conseil|consult|gestion|strategie|stratégie|marketing|communication|agence|recrutement|administration)\b/i],
]

function inferCategory(business) {
  const text = `${business.name || ''} ${business.slug || ''}`
  for (const [slug, pattern] of RULES) {
    if (pattern.test(text)) return slug
  }
  return null
}

async function main() {
  const rows = []
  let offset = START_OFFSET
  const size = 200

  while (rows.length < LIMIT) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id,slug,name,main_category_slug,verification_confidence,is_claimed')
      .not('slug', 'is', null)
      .or('verification_confidence.eq.high,is_claimed.eq.true')
      .order('slug')
      .range(offset, offset + size - 1)

    if (error) throw error
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < size) break
    offset += size
  }

  let updated = 0
  let invalid = 0
  let inferred = 0

  for (const business of rows.slice(0, LIMIT)) {
    if (business.main_category_slug && !VALID.has(business.main_category_slug)) invalid++
    const category = inferCategory(business)
    if (!category) continue
    if (category === business.main_category_slug) continue

    inferred++
    if (DRY_RUN) {
      console.log(`${business.slug}: ${business.main_category_slug || 'null'} -> ${category}`)
    } else {
      const { error } = await supabase
        .from('businesses')
        .update({ main_category_slug: category })
        .eq('id', business.id)

      if (error) throw error
      updated++
      if (updated % 100 === 0) console.log(`Updated ${updated}`)
    }
  }

  console.log(`Rows checked: ${Math.min(rows.length, LIMIT)} from offset ${START_OFFSET}`)
  console.log(`Invalid existing categories: ${invalid}`)
  console.log(`Inferred changes: ${inferred}`)
  console.log(`Updated: ${updated}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
