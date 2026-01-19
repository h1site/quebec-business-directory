const fs = require('fs');
const https = require('https');

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Fetch enriched businesses from Supabase
async function fetchEnrichedBusinesses() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'tiaofyawimkckjgxdnbd.supabase.co',
      path: '/rest/v1/businesses?select=slug,updated_at&ai_description=not.is.null&order=updated_at.desc',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Generate sitemap XML
function generateSitemap(businesses) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const business of businesses) {
    const lastmod = business.updated_at
      ? new Date(business.updated_at).toISOString().split('T')[0]
      : today;

    xml += `  <url>
    <loc>https://registreduquebec.com/entreprise/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
  }

  xml += '</urlset>';
  return xml;
}

async function main() {
  console.log('Fetching enriched businesses from Supabase...');

  const businesses = await fetchEnrichedBusinesses();
  console.log(`Found ${businesses.length} enriched businesses`);

  const sitemap = generateSitemap(businesses);

  // Save to public folder for Next.js to serve
  const outputPath = './public/sitemap-enriched-priority.xml';
  fs.writeFileSync(outputPath, sitemap);

  console.log(`Sitemap saved to: ${outputPath}`);
  console.log(`Contains ${businesses.length} URLs with priority 0.9`);
}

main().catch(console.error);
