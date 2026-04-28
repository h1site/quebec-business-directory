/**
 * Add a "Sources et références" section with 3-4 nofollow external links
 * to each blog article. Builds domain authority via citation of
 * high-DA Quebec/Canada institutional sources.
 */
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Helper to render a nofollow external link in markdown (inline HTML)
const ext = (text, url) => `<a href="${url}" rel="nofollow noopener noreferrer" target="_blank">${text}</a>`

// High-authority sources by topic
const SOURCES = {
  'repreneuriat': [
    { fr: ['Centre de transfert d\'entreprise du Québec (CTEQ)', 'https://www.cteq.ca'], en: ['Quebec Business Transfer Centre (CTEQ)', 'https://www.cteq.ca/en'] },
    { fr: ['BDC — Acheter une entreprise', 'https://www.bdc.ca/fr/articles-outils/strategie-affaires/etapes-acheter-une-entreprise'], en: ['BDC — Buying a business', 'https://www.bdc.ca/en/articles-tools/business-strategy-planning/steps-buy-business'] },
    { fr: ['Réseau M — Repreneuriat', 'https://www.reseaum.com'], en: ['Réseau M — Mentorship', 'https://www.reseaum.com/en'] },
    { fr: ['Institut de la statistique du Québec', 'https://statistique.quebec.ca'], en: ['Institut de la statistique du Québec', 'https://statistique.quebec.ca/en'] },
  ],
  'subventions': [
    { fr: ['Quebec.ca — Aide financière pour les entreprises', 'https://www.quebec.ca/entreprises-et-travailleurs-autonomes/aide-financiere-entreprises'], en: ['Quebec.ca — Financial assistance', 'https://www.quebec.ca/en/businesses-and-self-employed-workers'] },
    { fr: ['Investissement Québec', 'https://www.investquebec.com/quebec/fr'], en: ['Investissement Québec', 'https://www.investquebec.com/quebec/en'] },
    { fr: ['Ministère de l\'Économie, de l\'Innovation et de l\'Énergie', 'https://www.economie.gouv.qc.ca'], en: ['Ministry of Economy, Innovation and Energy', 'https://www.economie.gouv.qc.ca/en'] },
    { fr: ['BDC — Financement', 'https://www.bdc.ca/fr/financement'], en: ['BDC — Financing', 'https://www.bdc.ca/en/financing'] },
  ],
  'budget': [
    { fr: ['Budget du Québec — Finances Québec', 'https://www.finances.gouv.qc.ca/Budget_et_mise_a_jour'], en: ['Quebec Budget — Finances Québec', 'https://www.finances.gouv.qc.ca/Budget_et_mise_a_jour/en'] },
    { fr: ['Ministère des Finances du Québec', 'https://www.finances.gouv.qc.ca'], en: ['Ministry of Finance of Quebec', 'https://www.finances.gouv.qc.ca/en'] },
    { fr: ['Statistique Canada', 'https://www.statcan.gc.ca'], en: ['Statistics Canada', 'https://www.statcan.gc.ca/en'] },
    { fr: ['Conseil du patronat du Québec', 'https://www.cpq.qc.ca'], en: ['Conseil du patronat du Québec', 'https://www.cpq.qc.ca/en'] },
  ],
  'ia': [
    { fr: ['IVADO — Institut de valorisation des données', 'https://ivado.ca'], en: ['IVADO', 'https://ivado.ca/en'] },
    { fr: ['Mila — Institut québécois d\'IA', 'https://mila.quebec'], en: ['Mila — Quebec AI Institute', 'https://mila.quebec/en'] },
    { fr: ['Scale AI — Supergrappe canadienne', 'https://www.scaleai.ca'], en: ['Scale AI — Canadian supercluster', 'https://www.scaleai.ca/en'] },
    { fr: ['BDC — Numérique et IA', 'https://www.bdc.ca/fr/articles-outils/technologie'], en: ['BDC — Digital & technology', 'https://www.bdc.ca/en/articles-tools/technology'] },
  ],
  'penurie': [
    { fr: ['Statistique Canada — Marché du travail', 'https://www.statcan.gc.ca/fr/sujets-debut/emploi_et_chomage'], en: ['Statistics Canada — Labour market', 'https://www.statcan.gc.ca/en/subjects-start/labour'] },
    { fr: ['Institut du Québec — Marché du travail', 'https://institutduquebec.ca'], en: ['Institut du Québec', 'https://institutduquebec.ca/en'] },
    { fr: ['FCEI — Pénurie de main-d\'œuvre', 'https://www.cfib-fcei.ca/fr'], en: ['CFIB — Labour shortage', 'https://www.cfib-fcei.ca/en'] },
    { fr: ['Emploi-Québec', 'https://www.emploiquebec.gouv.qc.ca'], en: ['Emploi-Québec', 'https://www.emploiquebec.gouv.qc.ca/en'] },
  ],
  'innovation': [
    { fr: ['Ministère de l\'Économie, de l\'Innovation et de l\'Énergie', 'https://www.economie.gouv.qc.ca'], en: ['Ministry of Economy, Innovation and Energy', 'https://www.economie.gouv.qc.ca/en'] },
    { fr: ['Conseil de l\'innovation du Québec', 'https://conseilinnovation.quebec'], en: ['Quebec Innovation Council', 'https://conseilinnovation.quebec/en'] },
    { fr: ['BDC — Productivité', 'https://www.bdc.ca/fr/articles-outils/strategie-affaires/innover'], en: ['BDC — Innovation', 'https://www.bdc.ca/en/articles-tools/business-strategy-planning/innovate'] },
    { fr: ['OCDE — Innovation', 'https://www.oecd.org/fr/innovation'], en: ['OECD — Innovation', 'https://www.oecd.org/innovation'] },
  ],
  'femmes': [
    { fr: ['Femmessor', 'https://femmessor.com'], en: ['Femmessor', 'https://femmessor.com/en'] },
    { fr: ['Réseau des Femmes d\'affaires du Québec', 'https://rfaq.ca'], en: ['Quebec Women in Business Network', 'https://rfaq.ca/en'] },
    { fr: ['Statistique Canada — Femmes en entreprise', 'https://www.statcan.gc.ca/fr/sujets-debut/genre_diversite_inclusion'], en: ['Statistics Canada — Women in business', 'https://www.statcan.gc.ca/en/subjects-start/gender_diversity_and_inclusion'] },
    { fr: ['BDC — Soutien aux femmes entrepreneures', 'https://www.bdc.ca/fr/articles-outils/strategie-affaires/femmes-entrepreneures'], en: ['BDC — Women entrepreneurs', 'https://www.bdc.ca/en/articles-tools/business-strategy-planning/women-entrepreneurs'] },
  ],
  'durabilite': [
    { fr: ['Ministère de l\'Environnement et de la Lutte contre les changements climatiques', 'https://www.environnement.gouv.qc.ca'], en: ['Quebec Ministry of Environment', 'https://www.environnement.gouv.qc.ca/index_en.htm'] },
    { fr: ['Écotech Québec', 'https://ecotechquebec.com'], en: ['Écotech Québec', 'https://ecotechquebec.com/en'] },
    { fr: ['Transition énergétique Québec — Programmes', 'https://transitionenergetique.gouv.qc.ca'], en: ['Energy Transition Quebec', 'https://transitionenergetique.gouv.qc.ca/en'] },
    { fr: ['Investissement Québec — Économie verte', 'https://www.investquebec.com/quebec/fr/secteurs-affaires/technologies-vertes'], en: ['Investissement Québec — Green economy', 'https://www.investquebec.com/quebec/en/business-sectors/clean-technologies'] },
  ],
  'defis': [
    { fr: ['FCEI — Études sur les PME', 'https://www.cfib-fcei.ca/fr/recherche-economique'], en: ['CFIB — SME research', 'https://www.cfib-fcei.ca/en/research-economics'] },
    { fr: ['Banque du Canada — Inflation', 'https://www.banqueducanada.ca'], en: ['Bank of Canada — Inflation', 'https://www.bankofcanada.ca/'] },
    { fr: ['Statistique Canada', 'https://www.statcan.gc.ca'], en: ['Statistics Canada', 'https://www.statcan.gc.ca/en'] },
    { fr: ['Institut du Québec', 'https://institutduquebec.ca'], en: ['Institut du Québec', 'https://institutduquebec.ca/en'] },
  ],
  'financement': [
    { fr: ['BDC — Financement', 'https://www.bdc.ca/fr/financement'], en: ['BDC — Financing', 'https://www.bdc.ca/en/financing'] },
    { fr: ['Investissement Québec', 'https://www.investquebec.com/quebec/fr'], en: ['Investissement Québec', 'https://www.investquebec.com/quebec/en'] },
    { fr: ['Crédit d\'impôt R-D — Revenu Québec', 'https://www.revenuquebec.ca/fr/entreprises/impots/credits-dimpot/credits-dimpot-pour-la-recherche-et-developpement'], en: ['Quebec R&D tax credits', 'https://www.revenuquebec.ca/en/businesses/income-taxes/tax-credits/tax-credits-for-research-and-development'] },
    { fr: ['Réseau capital — Capital de risque Québec', 'https://reseaucapital.com'], en: ['Réseau capital — Quebec VC', 'https://reseaucapital.com/en'] },
  ],
  'ville-quebec': [
    { fr: ['Ville de Québec — Économie', 'https://www.ville.quebec.qc.ca/affaires'], en: ['Ville de Québec — Business', 'https://www.ville.quebec.qc.ca/EN/business'] },
    { fr: ['Québec International', 'https://www.quebecinternational.ca'], en: ['Québec International', 'https://www.quebecinternational.ca/en'] },
    { fr: ['Investissement Québec', 'https://www.investquebec.com/quebec/fr'], en: ['Investissement Québec', 'https://www.investquebec.com/quebec/en'] },
    { fr: ['Chambre de commerce et d\'industrie de Québec', 'https://www.cciquebec.ca'], en: ['Quebec Chamber of Commerce', 'https://www.cciquebec.ca/en'] },
  ],
}

// Map each article slug → topic key
const ARTICLE_TOPICS = {
  '150000-entreprises-a-vendre-quebec-repreneur-2026': 'repreneuriat',
  'repreneuriat-quebec-2026-10-secteurs-opportunites': 'repreneuriat',
  'transfert-entreprise-6-erreurs-fatales-repreneurs': 'repreneuriat',
  'acquisition-vs-creation-entreprise-quebec-2026': 'repreneuriat',
  'femmes-entrepreneures-repreneuriat-quebec-2026': 'femmes',
  'subventions-aide-financiere-pme-quebec-2026': 'subventions',
  'plan-pme-2025-2028-subventions-accompagnements': 'subventions',
  'budget-2026-2027-quebec-5-mesures-pme': 'budget',
  'integrer-ia-pme-quebecoise-2026': 'ia',
  'ia-productivite-pme-20-30-efficacite': 'ia',
  'penurie-main-doeuvre-2026-7-strategies-recrutement': 'penurie',
  'innovation-quebec-2026-pme-stagnent': 'innovation',
  'durabilite-transition-ecologique-entrepreneurs-quebec': 'durabilite',
  'defis-pme-quebecoises-2026-inflation-geopolitique': 'defis',
  'financer-startup-reprise-entreprise-quebec-2026': 'financement',
  'vision-entrepreneuriale-ville-quebec-2026': 'ville-quebec',
}

function buildSourcesSection(topic, lang) {
  const list = SOURCES[topic]
  if (!list) return null
  const heading = lang === 'en' ? '## Sources and references' : '## Sources et références'
  const intro = lang === 'en'
    ? 'This article relies on data and analysis from the following high-authority Quebec and Canadian institutional sources:'
    : 'Cet article s\'appuie sur les données et analyses des sources institutionnelles québécoises et canadiennes suivantes :'
  const items = list.map(s => {
    const [text, url] = lang === 'en' ? s.en : s.fr
    return `- ${ext(text, url)}`
  }).join('\n')
  return `\n\n${heading}\n\n${intro}\n\n${items}\n`
}

function stripExisting(content) {
  // Remove any existing "Sources et références" / "Sources and references" section
  return content.replace(/\n+##\s+Sources (et références|and references)[\s\S]*$/i, '\n')
}

;(async () => {
  const slugs = Object.keys(ARTICLE_TOPICS)
  let updated = 0, skipped = 0, failed = 0

  for (const slug of slugs) {
    const topic = ARTICLE_TOPICS[slug]
    const { data: a } = await s.from('blog_articles').select('content_fr, content_en').eq('slug', slug).single()
    if (!a) { console.log(`❌ ${slug} (not found)`); failed++; continue }

    const fr = stripExisting(a.content_fr || '') + (buildSourcesSection(topic, 'fr') || '')
    const en = a.content_en ? stripExisting(a.content_en) + (buildSourcesSection(topic, 'en') || '') : null

    const { error } = await s.from('blog_articles').update({
      content_fr: fr,
      content_en: en,
      updated_at: new Date().toISOString(),
    }).eq('slug', slug)

    if (error) { console.log(`❌ ${slug}: ${error.message}`); failed++ }
    else { console.log(`✅ ${slug} (${topic})`); updated++ }
  }

  console.log(`\nDone — updated: ${updated}, failed: ${failed}, skipped: ${skipped}`)
})()
