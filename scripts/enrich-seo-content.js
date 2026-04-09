/**
 * SEO Content Enrichment Script V2
 *
 * Generates UNIQUE analysis text per business using OpenAI.
 * Stores in ai_analysis field (new column needed).
 *
 * Usage:
 *   node scripts/enrich-seo-content.js --limit=5
 *   node scripts/enrich-seo-content.js --limit=100
 *   node scripts/enrich-seo-content.js --slug=bleu-rive
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '5');
const SLUG = process.argv.find(a => a.startsWith('--slug='))?.split('=')[1];

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': method === 'GET' ? 'count=exact' : 'return=minimal',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function callOpenAI(prompt) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1500
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.choices?.[0]?.message?.content || null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(30000, () => { req.destroy(); resolve(null); });
    req.write(postData);
    req.end();
  });
}

async function generateSEOContent(business) {
  const categoryName = business.main_category_slug
    ? business.main_category_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'entreprise';

  const prompt = `Tu es un expert en rédaction SEO pour un annuaire d'entreprises québécoises. Génère du contenu UNIQUE et SPÉCIFIQUE pour cette entreprise. NE SOIS PAS GÉNÉRIQUE.

Entreprise: ${business.name}
Ville: ${business.city || 'Québec'}
Région: ${business.region || 'Québec'}
Catégorie: ${categoryName}
Services: ${business.ai_services ? business.ai_services.join(', ') : 'non spécifiés'}
Note Google: ${business.google_rating || 'N/A'} (${business.google_reviews_count || 0} avis)
NEQ: ${business.neq || 'N/A'}
Description existante: ${business.ai_description ? business.ai_description.substring(0, 300) : 'aucune'}

Génère un JSON avec ces champs (200-300 mots par champ) :

{
  "intro": "Paragraphe d'introduction unique (120-200 mots) présentant l'entreprise, son positionnement, ce qui la distingue. Mentionne la ville et la région. NE COMMENCE PAS par le nom de l'entreprise.",
  "analysis": "Analyse stratégique (150-250 mots) : positionnement dans son secteur, type de clientèle, avantages concurrentiels, dépendances (trafic local, saisonnalité, etc.). Sois spécifique au secteur.",
  "local_context": "Contexte local (100-150 mots) : rôle dans l'économie locale, importance pour la communauté, accessibilité géographique.",
  "reputation_text": "Analyse de la réputation (80-120 mots) basée sur la note Google et le nombre d'avis. Sois spécifique.",
  "score_popularity": nombre entre 1 et 10,
  "score_services": nombre entre 1 et 10,
  "score_accessibility": nombre entre 1 et 10
}

IMPORTANT: Réponds UNIQUEMENT en JSON valide, sans markdown ni commentaire.`;

  const response = await callOpenAI(prompt);
  if (!response) return null;

  try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.log('  Parse error:', e.message);
    return null;
  }
}

async function main() {
  console.log('🚀 SEO Content Enrichment V2\n');

  // Fetch businesses
  let url = `/rest/v1/businesses?select=id,slug,name,city,region,main_category_slug,ai_description,ai_services,google_rating,google_reviews_count,neq&verification_confidence=eq.high&ai_seo_content=is.null&order=google_reviews_count.desc.nullslast&limit=${LIMIT}`;

  if (SLUG) {
    url = `/rest/v1/businesses?select=id,slug,name,city,region,main_category_slug,ai_description,ai_services,google_rating,google_reviews_count,neq&slug=eq.${SLUG}`;
  }

  const businesses = await supabaseRequest('GET', url);

  if (!businesses || businesses.length === 0) {
    console.log('No businesses to process. Make sure ai_seo_content column exists.');
    console.log('Run this SQL: ALTER TABLE businesses ADD COLUMN IF NOT EXISTS ai_seo_content JSONB;');
    return;
  }

  console.log(`Processing ${businesses.length} businesses\n`);

  let success = 0, fail = 0;

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    process.stdout.write(`[${i+1}/${businesses.length}] ${biz.name.substring(0, 50).padEnd(50)} `);

    const seoContent = await generateSEOContent(biz);

    if (!seoContent || !seoContent.intro) {
      console.log('❌ Failed');
      fail++;
      continue;
    }

    // Update Supabase
    const updateUrl = `/rest/v1/businesses?id=eq.${biz.id}`;
    await supabaseRequest('PATCH', updateUrl, {
      ai_seo_content: seoContent
    });

    console.log('✅');
    success++;

    // Rate limit
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n✅ Success: ${success}`);
  console.log(`❌ Failed: ${fail}`);
}

main().catch(console.error);
