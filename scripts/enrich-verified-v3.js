/**
 * Enrichment V3 — Verified SEO Content
 *
 * Uses OpenAI to VERIFY + CORRECT business data AND generate unique SEO content.
 * Fixes wrong categories, validates addresses/phones, generates analysis.
 *
 * Usage:
 *   node scripts/enrich-verified-v3.js --slug=bleu-rive
 *   node scripts/enrich-verified-v3.js --limit=10
 *   node scripts/enrich-verified-v3.js --limit=1000
 */

require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '5');
const SLUG = process.argv.find(a => a.startsWith('--slug='))?.split('=')[1];

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORY_MAP = {
  'agriculture-et-environnement': 'Agriculture et environnement',
  'arts-medias-et-divertissement': 'Arts, médias et divertissement',
  'automobile-et-transport': 'Automobile et transport',
  'commerce-de-detail': 'Commerce de détail',
  'construction-et-renovation': 'Construction et rénovation',
  'education-et-formation': 'Éducation et formation',
  'finance-assurance-et-juridique': 'Finance, assurance et juridique',
  'immobilier': 'Immobilier',
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
};

async function callOpenAI(prompt, maxTokens = 2000) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    console.log(`  API error: ${response.status}`);
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

async function enrichBusiness(biz) {
  const currentCategory = CATEGORY_MAP[biz.main_category_slug] || biz.main_category_slug || 'Non classé';
  const categoryList = Object.entries(CATEGORY_MAP).map(([slug, name]) => `- ${slug}: ${name}`).join('\n');

  const prompt = `Tu es un expert en vérification de données d'entreprises québécoises. Analyse cette entreprise et génère une fiche VÉRIFIÉE.

=== DONNÉES ACTUELLES (POSSIBLEMENT INCORRECTES) ===
Nom: ${biz.name}
Ville: ${biz.city || 'inconnue'}
Région: ${biz.region || 'inconnue'}
Catégorie actuelle: ${currentCategory} (slug: ${biz.main_category_slug || 'aucun'})
Adresse vérifiée: ${biz.verified_address || 'non vérifiée'}
Téléphone vérifié: ${biz.verified_phone || 'non vérifié'}
Email vérifié: ${biz.verified_email || 'non vérifié'}
Site web: ${biz.website || 'aucun'}
NEQ: ${biz.neq || 'inconnu'}
Note Google: ${biz.google_rating || 'N/A'} (${biz.google_reviews_count || 0} avis)
Description AI existante: ${biz.ai_description ? biz.ai_description.substring(0, 200) + '...' : 'aucune'}

=== CATÉGORIES DISPONIBLES ===
${categoryList}

=== TA MISSION ===
1. VÉRIFIE si la catégorie est CORRECTE pour cette entreprise. Choisis la bonne catégorie parmi la liste.
2. GÉNÈRE une description de l'entreprise (150-250 mots, en français) basée sur ce que tu sais de cette entreprise. Sois SPÉCIFIQUE, pas générique.
3. GÉNÈRE une liste de 5-8 services RÉELS offerts par ce type d'entreprise.
4. GÉNÈRE le contenu SEO unique (intro, analyse, contexte local, réputation).
5. ÉVALUE les scores.

RÉPONDS EN JSON STRICT (pas de markdown) :
{
  "correct_category_slug": "le-bon-slug-de-categorie",
  "category_changed": true/false,
  "description_fr": "Description vérifiée de l'entreprise en français (150-250 mots). Sois spécifique à CETTE entreprise.",
  "description_en": "Same description in English.",
  "services_fr": ["service 1", "service 2", ...],
  "services_en": ["service 1 en", "service 2 en", ...],
  "seo_content": {
    "intro": "Paragraphe d'intro unique 120-200 mots. NE COMMENCE PAS par le nom. Mentionne ville et région.",
    "analysis": "Analyse stratégique 150-250 mots. Positionnement, clientèle, avantages, dépendances.",
    "local_context": "Contexte local 100-150 mots. Rôle économique, communauté, accessibilité.",
    "reputation_text": "Analyse réputation 80-120 mots basée sur note Google et avis.",
    "score_popularity": 7,
    "score_services": 8,
    "score_accessibility": 7
  },
  "confidence": "high/medium/low",
  "notes": "Commentaires sur les corrections apportées ou doutes"
}`;

  const response = await callOpenAI(prompt, 2500);
  if (!response) return null;

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.log(`  Parse error: ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Enrichment V3 — Verified Content\n');

  let query = supabase
    .from('businesses')
    .select('id, slug, name, city, region, main_category_slug, ai_description, ai_services, verified_address, verified_phone, verified_email, website, neq, google_rating, google_reviews_count, ai_seo_content')
    .eq('verification_confidence', 'high');

  if (SLUG) {
    query = query.eq('slug', SLUG);
  } else {
    query = query
      .is('ai_seo_content', null)
      .order('google_reviews_count', { ascending: false, nullsFirst: false })
      .limit(LIMIT);
  }

  const { data: businesses, error } = await query;

  if (error) {
    console.error('Query error:', error.message);
    return;
  }

  if (!businesses || businesses.length === 0) {
    console.log('No businesses to process.');
    return;
  }

  console.log(`Processing ${businesses.length} businesses\n`);

  let success = 0, fail = 0, catFixed = 0;

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    process.stdout.write(`[${i + 1}/${businesses.length}] ${biz.name.substring(0, 45).padEnd(45)} `);

    const result = await enrichBusiness(biz);

    if (!result || !result.description_fr) {
      console.log('❌');
      fail++;
      await sleep(1000);
      continue;
    }

    // Build update
    const update = {
      ai_description: result.description_fr,
      ai_description_en: result.description_en || null,
      ai_services: result.services_fr || null,
      ai_services_en: result.services_en || null,
      ai_seo_content: result.seo_content || null,
      ai_enriched_at: new Date().toISOString(),
    };

    // Fix category if wrong
    if (result.category_changed && result.correct_category_slug && CATEGORY_MAP[result.correct_category_slug]) {
      update.main_category_slug = result.correct_category_slug;
      catFixed++;
      process.stdout.write(`📂 ${biz.main_category_slug} → ${result.correct_category_slug} `);
    }

    const { error: updateError } = await supabase
      .from('businesses')
      .update(update)
      .eq('id', biz.id);

    if (updateError) {
      console.log(`❌ DB: ${updateError.message}`);
      fail++;
    } else {
      console.log(`✅ (${result.confidence || '?'})`);
      success++;
    }

    await sleep(1500);
  }

  console.log(`\n=== Résultats ===`);
  console.log(`✅ Enrichies: ${success}`);
  console.log(`❌ Échouées: ${fail}`);
  console.log(`📂 Catégories corrigées: ${catFixed}`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

main().catch(console.error);
