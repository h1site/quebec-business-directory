const fs = require('fs');
const https = require('https');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync('./scripts/enrichment-results-batch-1.json', 'utf8'));
console.log(`Updating ${results.length} businesses with ai_enriched_at timestamp...`);

let updated = 0;
let failed = 0;

async function updateBusiness(slug) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      ai_enriched_at: new Date().toISOString()
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

async function main() {
  for (let i = 0; i < results.length; i++) {
    const slug = results[i].slug;
    const success = await updateBusiness(slug);

    if (success) {
      updated++;
    } else {
      failed++;
      console.log(`Failed: ${slug}`);
    }

    if ((i + 1) % 100 === 0) {
      console.log(`Progress: ${i + 1}/${results.length} (${updated} updated, ${failed} failed)`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
}

main();
