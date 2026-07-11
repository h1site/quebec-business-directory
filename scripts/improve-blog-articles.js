/**
 * Améliore la QUALITÉ de 3 articles de blog (lot de test indexation).
 *
 * Pourquoi : GSC les classe « Explorée, actuellement non indexée » = jugement de
 * qualité. Ils avaient été générés en masse (gpt-4o-mini, prompt générique).
 * Ce script les réécrit en profondeur avec un modèle plus fort + un prompt
 * E-E-A-T (programmes québécois nommés, tableaux, FAQ, liens internes croisés),
 * puis met à jour content_fr / excerpt_fr / updated_at (bump du lastmod sitemap
 * → invite Google à re-crawler).
 *
 * Sécurité : backup JSON des versions actuelles AVANT tout upsert.
 *
 * Usage : node scripts/improve-blog-articles.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MODEL = 'gpt-4o'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Lot de test. `related` = slugs à lier en contexte (maillage croisé).
const TARGETS = [
  {
    slug: 'financer-startup-reprise-entreprise-quebec-2026',
    focus:
      "Financement d'une startup OU d'une reprise d'entreprise au Québec en 2026 : sources (mise de fonds, prêts BDC/Investissement Québec, Futurpreneur, capital de risque et anges — ANGE Québec, financement de la relève d'entreprise/CTEQ, PME MTL, crédits d'impôt RS&DE et CDAE, love money, financement vendeur/balance de prix de vente). Comparer création vs reprise. Étapes concrètes, erreurs de financement, ordre de grandeur des montants.",
  },
  {
    slug: 'femmes-entrepreneures-repreneuriat-quebec-2026',
    focus:
      "Les femmes et le repreneuriat au Québec en 2026 : contexte, obstacles spécifiques (accès au financement, réseaux, biais), organismes de soutien (Evol ex-Femmessor, Réseau Mentorat, CTEQ/Centre de transfert d'entreprise du Québec, Investissement Québec), financement adapté, parcours type d'une repreneuse, secteurs porteurs, conseils actionables.",
  },
  {
    slug: 'defis-pme-quebecoises-2026-inflation-geopolitique',
    focus:
      "Les grands défis des PME québécoises en 2026 : inflation et coûts, incertitude géopolitique et tarifs/chaînes d'approvisionnement, pénurie de main-d'œuvre, virage numérique/IA, attentes clients (durabilité, expérience). Pour chaque défi : impact concret + pistes d'action réalistes pour une PME.",
  },
]

const BASE = 'https://registreduquebec.com'

async function callOpenAI(messages, maxTokens = 8000, temperature = 0.6) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, temperature, max_tokens: maxTokens }),
  })
  const data = await res.json()
  if (!data.choices || !data.choices[0]) {
    throw new Error('OpenAI: ' + JSON.stringify(data).slice(0, 300))
  }
  return data.choices[0].message.content
}

function buildPrompt(target, current, others) {
  const relatedLinks = others
    .map((o) => `- [${o.title_fr}](/blogue/${o.slug})`)
    .join('\n')

  return `Tu es un rédacteur SEO expert de l'écosystème entrepreneurial québécois. Réécris et ENRICHIS l'article ci-dessous pour qu'il soit nettement plus utile, original et approfondi que la version actuelle — l'objectif est qu'il mérite d'être indexé par Google (il ne l'est pas actuellement, jugé trop générique).

TITRE (à conserver, sans H1 dans le corps) : "${current.title_fr}"

SUJET / ANGLE À COUVRIR :
${target.focus}

VERSION ACTUELLE (à dépasser en qualité, ne pas simplement paraphraser) :
"""
${(current.content_fr || '').slice(0, 6000)}
"""

EXIGENCES DE QUALITÉ (E-E-A-T) :
- 2400 à 3200 mots, français québécois professionnel et concret.
- Nomme de VRAIS programmes/organismes québécois pertinents (Investissement Québec, BDC, Futurpreneur, PME MTL, Evol, Réseau Mentorat, CTEQ, ANGE Québec, crédits d'impôt RS&DE/CDAE, etc.) et explique à quoi ils servent.
- Donne des ordres de grandeur chiffrés PLAUSIBLES, mais reste honnête : emploie « à titre indicatif », « selon », des fourchettes ; n'invente PAS de statistiques précises présentées comme vérifiées.
- Structure : intro percutante ancrée en 2026 ; 5 à 7 sections en ## (H2) avec des ### si utile ; au moins UN tableau comparatif markdown ; au moins une liste numérotée d'étapes actionables.
- Ajoute une section « ## Questions fréquentes » avec 4 à 5 vraies Q/R.
- Termine par « ## Points clés à retenir » (liste à puces synthétique).
- Insère 2 à 3 liens internes CONTEXTUELS en markdown, placés naturellement dans le texte (pas en bloc) :
  - vers l'annuaire : [texte pertinent](/recherche)
  - vers ces articles connexes :
${relatedLinks}
- Ton d'expert qui a une opinion, exemples concrets (Montréal, Québec, Laval, régions), pas de remplissage générique, pas de répétitions.

FORMAT :
- Markdown uniquement. ## pour H2, ### pour H3, **gras**, listes -/1., tableaux |.
- PAS de titre H1 (il est ajouté automatiquement).
- Réponds UNIQUEMENT avec le corps markdown de l'article, rien d'autre.`
}

async function main() {
  console.log('📥 Récupération des 3 articles…')
  const { data: rows, error } = await supabase
    .from('blog_articles')
    .select('*')
    .in('slug', TARGETS.map((t) => t.slug))

  if (error) throw error
  if (!rows || rows.length !== TARGETS.length) {
    console.log(`⚠️  ${rows ? rows.length : 0}/${TARGETS.length} trouvés :`, (rows || []).map((r) => r.slug))
  }

  // Backup avant écrasement
  const backupPath = path.join(__dirname, 'blog-backup-before-improve.json')
  fs.writeFileSync(backupPath, JSON.stringify(rows, null, 2))
  console.log(`💾 Backup: ${backupPath}`)

  const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r]))

  for (const target of TARGETS) {
    const current = bySlug[target.slug]
    if (!current) { console.log(`⏭  Introuvable: ${target.slug}`); continue }

    const others = TARGETS.filter((t) => t.slug !== target.slug).map((t) => ({
      slug: t.slug,
      title_fr: bySlug[t.slug]?.title_fr || t.slug,
    }))

    console.log(`\n✍️  ${target.slug}`)
    const content = await callOpenAI([{ role: 'user', content: buildPrompt(target, current, others) }])

    const excerpt = (
      await callOpenAI(
        [{ role: 'user', content: `Rédige une meta description SEO française (max 155 caractères, accrocheuse, sans guillemets) pour : "${current.title_fr}".` }],
        120,
        0.5
      )
    ).replace(/^["']|["']$/g, '').trim().slice(0, 160)

    // Sauvegarde locale du nouveau contenu (revue humaine)
    fs.writeFileSync(path.join(__dirname, `blog-improved-${target.slug}.md`), `# ${current.title_fr}\n\n${content}`)

    const { error: upErr } = await supabase
      .from('blog_articles')
      .update({ content_fr: content, excerpt_fr: excerpt, updated_at: new Date().toISOString() })
      .eq('slug', target.slug)

    if (upErr) console.log(`  ❌ update: ${upErr.message}`)
    else console.log(`  ✅ ${content.length} chars — excerpt: ${excerpt.length} chars`)

    await new Promise((r) => setTimeout(r, 1500))
  }

  console.log('\n✅ Terminé. Backup dans scripts/blog-backup-before-improve.json')
  console.log('   Pour restaurer : réécrire content_fr/excerpt_fr depuis le backup.')
}

main().catch((e) => { console.error(e); process.exit(1) })
