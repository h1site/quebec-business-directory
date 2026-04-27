require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const SLUG = 'femmes-entrepreneures-repreneuriat-quebec-2026'

// External link helper (HTML inline in markdown, since markdown doesn't support rel attrs)
const ext = (text, url) => `<a href="${url}" rel="nofollow noopener noreferrer" target="_blank">${text}</a>`

const REGISTRAIRE = 'https://www.quebec.ca/entreprises-et-travailleurs-autonomes/obtenir-renseignements-entreprise/recherche-registre-entreprises'
const CTEQ = 'https://www.cteq.ca'
const BDC = 'https://www.bdc.ca/fr/articles-outils/strategie-affaires/etapes-acheter-une-entreprise'
const ISQ = 'https://statistique.quebec.ca/fr/document/portrait-des-pme-au-quebec'

const REGISTRAIRE_EN = 'https://www.quebec.ca/en/businesses-and-self-employed-workers/obtaining-information-business/search-business-register'
const CTEQ_EN = 'https://www.cteq.ca/en'
const BDC_EN = 'https://www.bdc.ca/en/articles-tools/business-strategy-planning/steps-buy-business'
const ISQ_EN = 'https://statistique.quebec.ca/en/document/portrait-des-pme-au-quebec'

;(async () => {
  const { data: article } = await s.from('blog_articles').select('content_fr, content_en').eq('slug', SLUG).single()
  if (!article) return console.log('❌ Not found')

  let fr = article.content_fr
  let en = article.content_en

  // FR replacements
  fr = fr.replace(
    'Le Registraire des entreprises du Québec recense chaque année des centaines de milliers d\'entreprises actives.',
    `Le ${ext('Registraire des entreprises du Québec', REGISTRAIRE)} recense chaque année des centaines de milliers d'entreprises actives.`
  )

  fr = fr.replace(
    'On estime que **des dizaines de milliers d\'entreprises devront être transférées dans les prochaines années** au Québec.',
    `Selon le ${ext('Centre de transfert d\'entreprise du Québec (CTEQ)', CTEQ)}, **des dizaines de milliers d'entreprises devront être transférées dans les prochaines années** au Québec.`
  )

  fr = fr.replace(
    'Avant de reprendre une entreprise, certains éléments sont essentiels.',
    `Avant de reprendre une entreprise, certains éléments sont essentiels (la ${ext('BDC propose un guide complet', BDC)} sur les étapes clés).`
  )

  fr = fr.replace(
    'Le Québec entre dans une période charnière :',
    `Selon les ${ext('données de l\'Institut de la statistique du Québec', ISQ)}, le Québec entre dans une période charnière :`
  )

  // EN replacements
  if (en) {
    en = en.replace(
      'The Quebec Business Registrar lists hundreds of thousands of active companies each year.',
      `The ${ext('Quebec Business Registrar', REGISTRAIRE_EN)} lists hundreds of thousands of active companies each year.`
    )

    en = en.replace(
      'It is estimated that **tens of thousands of businesses will need to be transferred in the coming years** in Quebec.',
      `According to the ${ext('Quebec Business Transfer Centre (CTEQ)', CTEQ_EN)}, **tens of thousands of businesses will need to be transferred in the coming years** in Quebec.`
    )

    en = en.replace(
      'Before acquiring a business, several elements are essential.',
      `Before acquiring a business, several elements are essential (${ext('BDC provides a complete guide', BDC_EN)} to the key steps).`
    )

    en = en.replace(
      'Quebec is entering a pivotal period:',
      `According to ${ext('Institut de la statistique du Québec data', ISQ_EN)}, Quebec is entering a pivotal period:`
    )
  }

  const { error } = await s.from('blog_articles').update({
    content_fr: fr,
    content_en: en,
    updated_at: new Date().toISOString(),
  }).eq('slug', SLUG)

  console.log(error ? '❌ ' + error.message : '✅ Updated with 4 external nofollow sources')
})()
