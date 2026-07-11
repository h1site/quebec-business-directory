/**
 * Passe d'expansion : étend les 3 articles du lot de test à 2400-3200 mots.
 * Lit la version actuelle (content_fr) dans Supabase, l'approfondit avec quotas
 * par section, conserve liens internes / FAQ / tableaux, puis met à jour la DB.
 *
 * Le backup original reste dans scripts/blog-backup-before-improve.json.
 * Usage : node scripts/expand-blog-articles.js
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

async function callOpenAI(messages, maxTokens = 9000, temperature = 0.6) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens: maxTokens }),
  })
  const data = await res.json()
  if (!data.choices || !data.choices[0]) throw new Error('OpenAI: ' + JSON.stringify(data).slice(0, 300))
  return data.choices[0].message.content
}

function buildExpandPrompt(title, content) {
  return `Voici un article de blog en français (markdown) qui est trop court (~1000 mots). Tu dois l'ÉTENDRE à 2400-3200 mots SANS le rendre répétitif ni ajouter de remplissage creux.

TITRE : "${title}"

RÈGLES D'EXPANSION :
- Garde la structure et TOUS les liens internes markdown existants (/recherche, /blogue/...). Ne les supprime pas.
- Garde (et enrichis) la section « ## Questions fréquentes » et « ## Points clés à retenir ».
- Chaque section ## doit faire AU MOINS 250-350 mots. Ajoute des sous-sections ### quand c'est pertinent.
- Approfondis avec : exemples concrets québécois, détails opérationnels sur les programmes/organismes nommés (ce qu'ils financent, critères, comment postuler), ordres de grandeur chiffrés PLAUSIBLES et honnêtes (fourchettes, « à titre indicatif », « selon »), pièges à éviter, mini études de cas.
- Ajoute au moins un tableau comparatif markdown supplémentaire si utile.
- Ne fabrique pas de statistiques précises présentées comme vérifiées.
- Ton d'expert, phrases variées, zéro répétition, français québécois professionnel.
- PAS de H1. Réponds UNIQUEMENT avec le corps markdown complet de l'article étendu.

ARTICLE ACTUEL À ÉTENDRE :
"""
${content}
"""`
}

async function main() {
  const { data: rows, error } = await supabase.from('blog_articles').select('slug, title_fr, content_fr').in('slug', SLUGS)
  if (error) throw error

  for (const slug of SLUGS) {
    const row = rows.find((r) => r.slug === slug)
    if (!row) { console.log(`⏭  Introuvable: ${slug}`); continue }

    const before = (row.content_fr || '').trim().split(/\s+/).filter(Boolean).length
    console.log(`\n✍️  ${slug} (${before} mots → cible 2400+)`)

    let content = await callOpenAI([{ role: 'user', content: buildExpandPrompt(row.title_fr, row.content_fr) }])
    let words = content.trim().split(/\s+/).filter(Boolean).length

    // Deuxième relance si encore court
    if (words < 2000) {
      console.log(`  ↻ ${words} mots, relance d'expansion…`)
      content = await callOpenAI([{ role: 'user', content: buildExpandPrompt(row.title_fr, content) }])
      words = content.trim().split(/\s+/).filter(Boolean).length
    }

    fs.writeFileSync(path.join(__dirname, `blog-expanded-${slug}.md`), `# ${row.title_fr}\n\n${content}`)

    const { error: upErr } = await supabase
      .from('blog_articles')
      .update({ content_fr: content, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    if (upErr) console.log(`  ❌ ${upErr.message}`)
    else console.log(`  ✅ ${words} mots`)

    await new Promise((r) => setTimeout(r, 1500))
  }
  console.log('\n✅ Expansion terminée.')
}

main().catch((e) => { console.error(e); process.exit(1) })
