/**
 * Finalisation des 3 articles du lot de test :
 *  - garantit une FAQ (## Questions fréquentes) et des Points clés (regénère si perdus)
 *  - garantit le maillage croisé via un bloc « ## À lire aussi » (2 articles liés
 *    + lien annuaire /recherche), ajouté proprement en fin d'article (dédupliqué)
 *  - met à jour updated_at (bump lastmod sitemap)
 *
 * Usage : node scripts/finalize-blog-articles.js
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MODEL = 'gpt-4o'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const SLUGS = [
  'financer-startup-reprise-entreprise-quebec-2026',
  'femmes-entrepreneures-repreneuriat-quebec-2026',
  'defis-pme-quebecoises-2026-inflation-geopolitique',
]

const FOOTER_MARK = '## À lire aussi'

async function callOpenAI(prompt, maxTokens = 900) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: prompt }], temperature: 0.5, max_tokens: maxTokens }),
  })
  const data = await res.json()
  if (!data.choices || !data.choices[0]) throw new Error('OpenAI: ' + JSON.stringify(data).slice(0, 300))
  return data.choices[0].message.content.trim()
}

async function main() {
  const { data: rows, error } = await supabase.from('blog_articles').select('slug, title_fr, content_fr').in('slug', SLUGS)
  if (error) throw error
  const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r]))

  for (const slug of SLUGS) {
    const row = bySlug[slug]
    if (!row) { console.log(`⏭  Introuvable: ${slug}`); continue }
    let content = row.content_fr || ''
    const notes = []

    // Retire un ancien footer « À lire aussi » pour éviter les doublons à la ré-exécution
    const idx = content.indexOf('\n' + FOOTER_MARK)
    if (idx !== -1) content = content.slice(0, idx).trimEnd()

    // FAQ manquante ?
    if (!/##\s*Questions fréquentes/i.test(content)) {
      const faq = await callOpenAI(
        `Rédige une section markdown « ## Questions fréquentes » (4 vraies questions/réponses utiles, réponses de 40-70 mots) pour un article intitulé "${row.title_fr}", axé PME/entrepreneuriat au Québec en 2026. Réponds uniquement avec le markdown de la section.`
      )
      content = content.trimEnd() + '\n\n' + faq
      notes.push('FAQ regénérée')
    }

    // Points clés manquants ?
    if (!/##\s*Points clés/i.test(content)) {
      const kp = await callOpenAI(
        `Rédige une section markdown « ## Points clés à retenir » (liste à puces de 5-6 points synthétiques et concrets) pour l'article "${row.title_fr}". Réponds uniquement avec le markdown de la section.`
      )
      content = content.trimEnd() + '\n\n' + kp
      notes.push('Points clés regénérés')
    }

    // Bloc « À lire aussi » (maillage croisé garanti)
    const related = SLUGS.filter((s) => s !== slug).map((s) => `- [${bySlug[s].title_fr}](/blogue/${s})`).join('\n')
    const footer = `${FOOTER_MARK}

${related}

Vous cherchez une entreprise québécoise en particulier ? Consultez notre [annuaire complet des entreprises du Québec](/recherche).`
    content = content.trimEnd() + '\n\n' + footer

    fs.writeFileSync(path.join(__dirname, `blog-final-${slug}.md`), `# ${row.title_fr}\n\n${content}`)

    const { error: upErr } = await supabase
      .from('blog_articles')
      .update({ content_fr: content, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    const words = content.trim().split(/\s+/).filter(Boolean).length
    if (upErr) console.log(`  ❌ ${slug}: ${upErr.message}`)
    else console.log(`  ✅ ${slug} — ${words} mots${notes.length ? ' (' + notes.join(', ') + ')' : ''}`)
  }
  console.log('\n✅ Finalisation terminée.')
}

main().catch((e) => { console.error(e); process.exit(1) })
