/**
 * Enrichment script that fetches businesses directly from Supabase
 * (not from businesses-export.json)
 *
 * Usage: node scripts/enrich-from-supabase.js [--limit=1000] [--offset=0]
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!OPENAI_API_KEY || !SUPABASE_KEY) {
  console.error('Missing OPENAI_API_KEY or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const LIMIT = parseInt(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] || '1000');
const OFFSET = parseInt(process.argv.find(a => a.startsWith('--offset='))?.split('=')[1] || '0');

function isSocialMediaUrl(url) {
  const socialDomains = ['facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'tiktok.com', 'youtube.com', 'wa.me', 'whatsapp.com'];
  try {
    const urlObj = new URL(url);
    return socialDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

function fetchWebsite(url, timeout = 10000, retryCount = 0) {
  return new Promise((resolve) => {
    if (!url || isSocialMediaUrl(url)) return resolve(null);

    // Global timeout to prevent hanging
    const globalTimeout = setTimeout(() => resolve(null), timeout + 5000);

    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.get(urlObj.toString(), { timeout, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RegistreQC/1.0)' }, rejectUnauthorized: false }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          clearTimeout(globalTimeout);
          if (retryCount < 3) return fetchWebsite(res.headers.location, timeout, retryCount + 1).then(resolve);
          return resolve(null);
        }
        if (res.statusCode !== 200) { clearTimeout(globalTimeout); return resolve(null); }

        let data = '';
        res.on('data', chunk => { data += chunk; if (data.length > 500000) { res.destroy(); clearTimeout(globalTimeout); resolve(data); } });
        res.on('end', () => { clearTimeout(globalTimeout); resolve(data); });
        res.on('error', () => { clearTimeout(globalTimeout); resolve(null); });
      });

      req.on('error', (err) => {
        clearTimeout(globalTimeout);
        if (retryCount === 0 && !urlObj.hostname.startsWith('www.')) {
          return fetchWebsite(url.replace('://', '://www.'), timeout, retryCount + 1).then(resolve);
        }
        resolve(null);
      });
      req.on('timeout', () => { req.destroy(); clearTimeout(globalTimeout); resolve(null); });
    } catch { clearTimeout(globalTimeout); resolve(null); }
  });
}

function extractText(html) {
  if (!html) return '';
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000);
}

function callOpenAI(businessName, websiteContent) {
  const prompt = `Analyse le contenu de ce site web d'entreprise québécoise et génère une fiche d'information.

Nom de l'entreprise: ${businessName}

Contenu du site web:
${websiteContent}

Génère une réponse JSON avec:
1. "description": Description professionnelle de 2-3 paragraphes en français.
2. "services": Tableau de 5-10 services/produits en français.
3. "description_en": Même description en anglais.
4. "services_en": Mêmes services en anglais.
5. "contact": { "address": string|null, "phone": string|null, "email": string|null, "city": string|null, "postal_code": string|null, "confidence": "high"|"medium"|"low" }

Réponds UNIQUEMENT avec le JSON.`;

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
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.choices?.[0]) {
            const content = response.choices[0].message.content;
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) resolve(JSON.parse(jsonMatch[0]));
            else resolve(null);
          } else resolve(null);
        } catch (e) {
          console.error('  Parse error:', e.message);
          resolve(null);
        }
      });
    });
    req.on('error', (e) => { console.error('  Request error:', e.message); resolve(null); });
    req.write(postData);
    req.end();
  });
}

function supabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: `/rest/v1/${path}`,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'PATCH' ? 'return=minimal' : 'return=representation',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null }); }
        catch { resolve({ status: res.statusCode, data: null }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`\n=== Enrichissement depuis Supabase (limit=${LIMIT}, offset=${OFFSET}) ===\n`);

  // Fetch non-enriched businesses with websites
  const { data: businesses } = await supabaseRequest('GET',
    `businesses?select=id,name,slug,website,city&ai_description=is.null&website=not.is.null&website=not.eq.&order=name&offset=${OFFSET}&limit=${LIMIT}`
  );

  if (!businesses || businesses.length === 0) {
    console.log('Aucune entreprise à enrichir!');
    return;
  }

  console.log(`${businesses.length} entreprises à traiter\n`);

  let success = 0, failed = 0;

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    console.log(`\n[${i + 1}/${businesses.length}] ${biz.name}`);
    console.log(`  URL: ${biz.website}`);

    // Fetch website
    console.log('  Fetching...');
    const html = await fetchWebsite(biz.website);
    if (!html) {
      console.log('  ❌ Site inaccessible — suppression');
      await supabaseRequest('DELETE', `businesses?id=eq.${biz.id}`);
      console.log('  🗑️ Supprimé');
      failed++;
      continue;
    }

    const text = extractText(html);
    if (text.length < 100) {
      console.log('  ❌ Pas assez de contenu — suppression');
      await supabaseRequest('DELETE', `businesses?id=eq.${biz.id}`);
      console.log('  🗑️ Supprimé');
      failed++;
      continue;
    }

    console.log(`  ${text.length} chars — OpenAI...`);
    const enriched = await callOpenAI(biz.name, text);

    if (!enriched?.description) {
      console.log('  ❌ OpenAI failed — suppression');
      await supabaseRequest('DELETE', `businesses?id=eq.${biz.id}`);
      console.log('  🗑️ Supprimé');
      failed++;
      await sleep(1000);
      continue;
    }

    // Update
    const updateObj = {
      ai_description: enriched.description,
      ai_services: enriched.services,
      ai_description_en: enriched.description_en,
      ai_services_en: enriched.services_en,
      ai_enriched_at: new Date().toISOString()
    };

    if (enriched.contact?.confidence === 'high' || enriched.contact?.confidence === 'medium') {
      if (enriched.contact.address) updateObj.verified_address = enriched.contact.address;
      if (enriched.contact.phone) updateObj.verified_phone = enriched.contact.phone;
      if (enriched.contact.email) updateObj.verified_email = enriched.contact.email;
      if (enriched.contact.city) updateObj.verified_city = enriched.contact.city;
      if (enriched.contact.postal_code) updateObj.verified_postal_code = enriched.contact.postal_code;
      updateObj.verified_at = new Date().toISOString();
      updateObj.verification_confidence = enriched.contact.confidence;
    }

    const { status } = await supabaseRequest('PATCH', `businesses?id=eq.${biz.id}`, updateObj);
    if (status === 204 || status === 200) {
      console.log('  ✓ Enrichie + vérifiée');
      success++;
    } else {
      console.log('  ❌ Update failed');
      failed++;
    }

    await sleep(1500);
  }

  console.log(`\n=== Terminé ===`);
  console.log(`✓ Enrichies: ${success}`);
  console.log(`✗ Supprimées/Failed: ${failed}`);
}

main().catch(console.error);
