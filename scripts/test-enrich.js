const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration - Load from .env.local
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_KEY) {
  console.error('Missing required environment variables: OPENAI_API_KEY, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Test avec 3 entreprises
const TEST_BUSINESSES = [
  {
    name: "ProGym",
    website: "https://www.progym.ca/",
    slug: "progym"
  },
  {
    name: "Habitations Morin",
    website: "http://constructionsmorin.com/",
    slug: "habitations-morin"
  },
  {
    name: "LABERGE CONSTRUCTIONS",
    website: "http://www.labergeconstructions.com/",
    slug: "laberge-constructions"
  }
];

// Fetch website content
function fetchWebsite(url, timeout = 15000, redirectCount = 0) {
  if (redirectCount > 5) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.get(url, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8'
        }
      }, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
          }
          console.log(`  → Redirect to: ${redirectUrl}`);
          return fetchWebsite(redirectUrl, timeout, redirectCount + 1).then(resolve);
        }

        if (res.statusCode !== 200) {
          console.log(`  → Status: ${res.statusCode}`);
          resolve(null);
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', (e) => {
        console.log(`  → Error: ${e.message}`);
        resolve(null);
      });
      req.on('timeout', () => {
        console.log('  → Timeout');
        req.destroy();
        resolve(null);
      });
    } catch (e) {
      console.log(`  → Exception: ${e.message}`);
      resolve(null);
    }
  });
}

// Extract text from HTML
function extractText(html) {
  if (!html) return '';

  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  return text.substring(0, 4000);
}

// Call OpenAI API
async function callOpenAI(businessName, websiteContent) {
  const prompt = `Analyse le contenu de ce site web d'entreprise québécoise et génère une fiche d'information.

Nom de l'entreprise: ${businessName}

Contenu du site web:
${websiteContent}

Génère une réponse JSON avec:
1. "description": Une description professionnelle de 2-3 paragraphes en français décrivant l'entreprise, ses activités, sa mission et ce qui la distingue. Base-toi UNIQUEMENT sur les informations du site web.
2. "services": Un tableau de 5-10 services/produits offerts par l'entreprise (en français).
3. "description_en": La même description traduite en anglais.
4. "services_en": Les mêmes services traduits en anglais.

Si le contenu du site ne permet pas d'extraire ces informations, retourne null pour les champs manquants.

Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`;

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
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
          if (response.choices && response.choices[0]) {
            const content = response.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              resolve(JSON.parse(jsonMatch[0]));
            } else {
              resolve(null);
            }
          } else {
            console.error('OpenAI error:', data);
            resolve(null);
          }
        } catch (e) {
          console.error('Parse error:', e.message);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}

// Update Supabase
async function updateSupabase(slug, data) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      ai_description: data.description,
      ai_services: data.services,
      ai_description_en: data.description_en,
      ai_services_en: data.services_en
    });

    const req = https.request({
      hostname: 'tiaofyawimkckjgxdnbd.supabase.co',
      path: `/rest/v1/businesses?slug=eq.${encodeURIComponent(slug)}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      resolve(res.statusCode === 204 || res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('=== TEST: Enrichissement de 3 entreprises ===\n');

  for (const business of TEST_BUSINESSES) {
    console.log(`\n▶ ${business.name}`);
    console.log(`  Website: ${business.website}`);

    // 1. Fetch
    console.log('  1. Fetching website...');
    const html = await fetchWebsite(business.website);

    if (!html) {
      console.log('  ❌ Failed to fetch');
      continue;
    }

    // 2. Extract
    const text = extractText(html);
    console.log(`  2. Extracted ${text.length} chars`);

    if (text.length < 50) {
      console.log('  ❌ Not enough content');
      continue;
    }

    // 3. OpenAI
    console.log('  3. Calling OpenAI...');
    const enriched = await callOpenAI(business.name, text);

    if (!enriched) {
      console.log('  ❌ OpenAI failed');
      continue;
    }

    console.log('  ✓ Generated:');
    console.log(`    - Description: ${enriched.description?.substring(0, 100)}...`);
    console.log(`    - Services: ${enriched.services?.length || 0} services`);

    // 4. Update Supabase
    console.log('  4. Updating Supabase...');
    const updated = await updateSupabase(business.slug, enriched);

    if (updated) {
      console.log('  ✓ SUCCESS - Database updated!');
    } else {
      console.log('  ❌ Supabase update failed');
    }

    await sleep(2000);
  }

  console.log('\n=== TEST COMPLETE ===');
}

main().catch(console.error);
