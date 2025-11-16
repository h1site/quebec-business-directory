import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BATCH_SIZE = 1000;
const MAX_URLS_PER_SITEMAP = 5000;
const baseUrl = 'https://registreduquebec.com';

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateSitemap(urls, filename) {
  const urlEntries = urls
    .map(
      ({ loc, lastmod, changefreq, priority }) =>
        `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  fs.writeFile(`public/sitemaps/${filename}`, sitemap, 'utf-8');
}

async function generateRecentSitemaps() {
  console.log('\n🔄 Génération sitemap pour entreprises récentes (depuis 2025-10-20)\n');

  const currentDate = new Date().toISOString().split('T')[0];
  const businessUrls = [];

  // Fetch recent businesses (created or updated since Oct 20, 2025)
  let page = 0;
  while (true) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, slug, updated_at, city, main_category_slug, description, website, google_reviews_count, google_rating')
      .or('created_at.gte.2025-10-20,updated_at.gte.2025-10-20')
      .order('id', { ascending: true })
      .range(page * BATCH_SIZE, (page + 1) * BATCH_SIZE - 1);

    if (error) {
      console.error('❌ Erreur:', error.message);
      break;
    }

    if (!businesses || businesses.length === 0) break;

    businesses.forEach(biz => {
      if (biz.slug && biz.city) {
        const citySlug = generateSlug(biz.city);
        const categoryPart = biz.main_category_slug || 'entreprise';
        const businessUrl = `${baseUrl}/${categoryPart}/${citySlug}/${biz.slug}`;

        let priority = 0.4;
        if (biz.description && biz.description.trim().length > 20) priority += 0.1;
        if (biz.website && biz.website.trim().length > 0) priority += 0.1;
        if (biz.google_reviews_count && biz.google_reviews_count > 0) priority += 0.1;
        if (biz.google_rating && biz.google_rating >= 4.0) priority += 0.1;

        businessUrls.push({
          loc: businessUrl,
          lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : currentDate,
          changefreq: 'weekly',
          priority: priority.toFixed(1)
        });
      }
    });

    console.log(`   Chargé ${businessUrls.length} URLs...`);

    page++;
    if (businesses.length < BATCH_SIZE) break;
  }

  console.log(`\n📊 Total: ${businessUrls.length} entreprises récentes\n`);

  // Generate sitemaps
  let fileIndex = 0;
  for (let i = 0; i < businessUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = businessUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const filename = `sitemap-businesses-recent-${fileIndex + 1}.xml`;
    generateSitemap(chunk, filename);
    console.log(`✅ ${filename}: ${chunk.length} URLs`);
    fileIndex++;
  }

  console.log(`\n✨ Terminé! ${fileIndex} fichiers générés.\n`);
  console.log('📝 N\'oubliez pas d\'ajouter ces sitemaps dans sitemap-fr.xml:\n');
  for (let i = 0; i < fileIndex; i++) {
    console.log(`  <sitemap><loc>https://registreduquebec.com/sitemaps/sitemap-businesses-recent-${i + 1}.xml</loc></sitemap>`);
  }
}

generateRecentSitemaps().then(() => process.exit(0));
