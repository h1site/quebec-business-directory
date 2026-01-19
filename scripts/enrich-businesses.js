const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration - Load from .env.local
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_KEY) {
  console.error('Missing required environment variables: OPENAI_API_KEY, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const BATCH_SIZE = 1000;
const BATCH_NUMBER = parseInt(process.argv[2]) || 1;
const PROGRESS_FILE = './scripts/enrichment-progress.json';
const RESULTS_FILE = `./scripts/enrichment-results-batch-${BATCH_NUMBER}.json`;

// Load progress
function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
  } catch (e) {}
  return { processed: [], failed: [], lastIndex: 0 };
}

// Save progress
function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Fetch website content
function fetchWebsite(url, timeout = 10000) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;

      const req = client.get(url, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BusinessBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8'
        }
      }, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redirectUrl = res.headers.location;
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
          }
          return fetchWebsite(redirectUrl, timeout).then(resolve);
        }

        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

// Extract text from HTML
function extractText(html) {
  if (!html) return '';

  // Remove scripts, styles, and other non-content
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

  // Limit to first 4000 chars to save tokens
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
            // Parse JSON from response
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

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main process
async function main() {
  console.log(`\n=== Enrichissement Batch ${BATCH_NUMBER} ===\n`);

  // Load businesses
  const allBusinesses = JSON.parse(fs.readFileSync('./businesses-export.json', 'utf8'));
  const startIndex = (BATCH_NUMBER - 1) * BATCH_SIZE;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allBusinesses.length);
  const businesses = allBusinesses.slice(startIndex, endIndex);

  console.log(`Processing businesses ${startIndex + 1} to ${endIndex} (${businesses.length} total)`);

  // Load progress
  const progress = loadProgress();
  const results = [];

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const slug = business.registre_url.split('/').pop();

    // Skip if already processed
    if (progress.processed.includes(slug)) {
      skipCount++;
      continue;
    }

    console.log(`\n[${i + 1}/${businesses.length}] ${business.name}`);
    console.log(`  URL: ${business.website}`);

    // 1. Fetch website
    console.log('  Fetching website...');
    const html = await fetchWebsite(business.website);

    if (!html) {
      console.log('  ❌ Could not fetch website');
      progress.failed.push({ slug, reason: 'fetch_failed' });
      failCount++;
      saveProgress(progress);
      continue;
    }

    // 2. Extract text
    const text = extractText(html);
    if (text.length < 100) {
      console.log('  ❌ Not enough content');
      progress.failed.push({ slug, reason: 'no_content' });
      failCount++;
      saveProgress(progress);
      continue;
    }

    console.log(`  Extracted ${text.length} chars`);

    // 3. Call OpenAI
    console.log('  Calling OpenAI...');
    const enrichedData = await callOpenAI(business.name, text);

    if (!enrichedData || !enrichedData.description) {
      console.log('  ❌ OpenAI failed to generate content');
      progress.failed.push({ slug, reason: 'openai_failed' });
      failCount++;
      saveProgress(progress);
      await sleep(1000);
      continue;
    }

    console.log('  ✓ Generated description and services');

    // 4. Update Supabase
    console.log('  Updating Supabase...');
    const updated = await updateSupabase(slug, enrichedData);

    if (updated) {
      console.log('  ✓ Updated successfully');
      progress.processed.push(slug);
      successCount++;
      results.push({
        name: business.name,
        slug,
        ...enrichedData
      });
    } else {
      console.log('  ❌ Supabase update failed');
      progress.failed.push({ slug, reason: 'supabase_failed', data: enrichedData });
      failCount++;
    }

    saveProgress(progress);

    // Save results periodically
    if (results.length % 50 === 0) {
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    }

    // Rate limiting - 1 request per second
    await sleep(1500);
  }

  // Final save
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log(`\n=== Batch ${BATCH_NUMBER} Complete ===`);
  console.log(`✓ Success: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`→ Skipped: ${skipCount}`);
  console.log(`\nResults saved to: ${RESULTS_FILE}`);
}

main().catch(console.error);
