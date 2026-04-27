require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const TARGET_SLUG = 'femmes-entrepreneures-repreneuriat-quebec-2026'
const TARGET_TITLE_FR = 'Femmes entrepreneures au Québec : repreneuriat 2026'
const TARGET_TITLE_EN = 'Women Entrepreneurs in Quebec: Acquisition in 2026'

const SOURCES = [
  {
    slug: 'repreneuriat-quebec-2026-10-secteurs-opportunites',
    teaser_fr: `Les femmes représentent une part croissante des repreneurs au Québec. Pour comprendre cette tendance de fond, lisez notre analyse : [${TARGET_TITLE_FR}](/blogue/${TARGET_SLUG}).`,
    teaser_en: `Women represent a growing share of buyers in Quebec. For deeper analysis, read: [${TARGET_TITLE_EN}](/en/blog/${TARGET_SLUG}).`,
  },
  {
    slug: '150000-entreprises-a-vendre-quebec-repreneur-2026',
    teaser_fr: `**À lire aussi :** [${TARGET_TITLE_FR}](/blogue/${TARGET_SLUG}) — pourquoi le repreneuriat féminin devient une opportunité stratégique majeure.`,
    teaser_en: `**See also:** [${TARGET_TITLE_EN}](/en/blog/${TARGET_SLUG}) — why women-led acquisition is becoming a major strategic opportunity.`,
  },
  {
    slug: 'transfert-entreprise-6-erreurs-fatales-repreneurs',
    teaser_fr: `Pour aller plus loin sur le profil des repreneurs en croissance, consultez : [${TARGET_TITLE_FR}](/blogue/${TARGET_SLUG}).`,
    teaser_en: `For more on the growing profile of business buyers, read: [${TARGET_TITLE_EN}](/en/blog/${TARGET_SLUG}).`,
  },
]

;(async () => {
  for (const src of SOURCES) {
    const { data: article } = await s.from('blog_articles').select('slug, content_fr, content_en').eq('slug', src.slug).single()
    if (!article) {
      console.log(`❌ ${src.slug} not found`)
      continue
    }

    // Skip if link already exists
    if (article.content_fr?.includes(`/blogue/${TARGET_SLUG}`)) {
      console.log(`⏭  ${src.slug} already has link`)
      continue
    }

    // Insert teaser before the conclusion section if found, else append
    const insertFr = (txt) => {
      const concIdx = txt.search(/^##\s+Conclusion/im)
      if (concIdx >= 0) {
        return txt.slice(0, concIdx) + '> ' + src.teaser_fr + '\n\n' + txt.slice(concIdx)
      }
      return txt + '\n\n> ' + src.teaser_fr + '\n'
    }
    const insertEn = (txt) => {
      const concIdx = txt.search(/^##\s+Conclusion/im)
      if (concIdx >= 0) {
        return txt.slice(0, concIdx) + '> ' + src.teaser_en + '\n\n' + txt.slice(concIdx)
      }
      return txt + '\n\n> ' + src.teaser_en + '\n'
    }

    const newFr = insertFr(article.content_fr)
    const newEn = article.content_en ? insertEn(article.content_en) : null

    const { error } = await s.from('blog_articles').update({
      content_fr: newFr,
      content_en: newEn,
      updated_at: new Date().toISOString(),
    }).eq('slug', src.slug)

    console.log(error ? `❌ ${src.slug}: ${error.message}` : `✅ ${src.slug}`)
  }
})()
