import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Arguments: node scripts/generate-sitemap-fr-batch.js START_OFFSET END_OFFSET
const startOffset = parseInt(process.argv[2]) || 0;
const endOffset = parseInt(process.argv[3]) || 50000;
const BATCH_SIZE = 1000;
const MAX_URLS_PER_SITEMAP = 5000;
const baseUrl = 'https://registreduquebec.com';

function generateSlug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function generateSitemap(urls, filename) {
  const urlEntries = urls.map(({ loc, lastmod, changefreq, priority }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
  return fs.writeFile(`public/sitemaps/${filename}`, sitemap, 'utf-8');
}

async function generateBatch() {
  console.log(`\n🔄 Génération sitemap français: offset ${startOffset.toLocaleString()} à ${endOffset.toLocaleString()}\n`);

  const currentDate = new Date().toISOString().split('T')[0];
  const allUrls = [];

  for (let offset = startOffset; offset < endOffset; offset += BATCH_SIZE) {
    const remaining = endOffset - offset;
    const batchSize = Math.min(BATCH_SIZE, remaining);

    console.log(`📦 Offset ${offset.toLocaleString()}...`);

    try {
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, slug, updated_at, city, main_category_slug, description, website, google_reviews_count, google_rating')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (error) throw error;
      if (!businesses || businesses.length === 0) break;

      businesses.forEach(biz => {
        if (biz.slug && biz.city) {
          const citySlug = generateSlug(biz.city);
          const categoryPart = biz.main_category_slug || 'entreprise';
          const businessUrl = `${baseUrl}/${categoryPart}/${citySlug}/${biz.slug}`;

          let priority = 0.4;
          if (biz.description?.trim().length > 20) priority += 0.1;
          if (biz.website?.trim().length > 0) priority += 0.1;
          if (biz.google_reviews_count > 0) priority += 0.1;
          if (biz.google_rating >= 4.0) priority += 0.1;

          allUrls.push({
            loc: businessUrl,
            lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : currentDate,
            changefreq: 'monthly',
            priority: priority.toFixed(1)
          });
        }
      });

      console.log(`   ✅ ${businesses.length} entreprises (Total: ${allUrls.length.toLocaleString()} URLs)`);

      if (businesses.length < batchSize) break;

    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      break;
    }
  }

  console.log(`\n✨ URLs générées: ${allUrls.length.toLocaleString()}\n`);

  // Calculate starting file index based on startOffset
  const startingFileIndex = Math.floor(startOffset / MAX_URLS_PER_SITEMAP);

  // Generate sitemap files
  for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = allUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const fileIndex = startingFileIndex + Math.floor(i / MAX_URLS_PER_SITEMAP) + 1;
    const filename = `sitemap-businesses-${fileIndex}.xml`;

    await generateSitemap(chunk, filename);
    console.log(`   ✅ ${filename}: ${chunk.length.toLocaleString()} URLs`);
  }

  console.log(`\n🎉 Batch terminé!\n`);
}

generateBatch().then(() => process.exit(0)).catch(err => {
  console.error('❌ Erreur fatale:', err);
  process.exit(1);
});
