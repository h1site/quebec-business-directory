import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BATCH_SIZE = 500; // Smaller batches to avoid timeout
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

  return fs.writeFile(`public/sitemaps/${filename}`, sitemap, 'utf-8');
}

async function generateSitemapsFR() {
  console.log('\n🔄 Génération COMPLÈTE des sitemaps français\n');
  console.log('Strategy: Pagination par offset avec petits batches\n');

  const currentDate = new Date().toISOString().split('T')[0];
  let allUrls = [];
  let totalProcessed = 0;
  let offset = 0;
  let hasMore = true;

  // Count total first
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total entreprises dans la DB: ${count?.toLocaleString()}\n`);

  while (hasMore) {
    try {
      console.log(`\n📦 Batch à partir de l'offset ${offset.toLocaleString()}...`);

      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('id, slug, updated_at, city, main_category_slug, description, website, google_reviews_count, google_rating')
        .order('id', { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        console.error(`❌ Erreur: ${error.message}`);
        // Continue même en cas d'erreur pour ne pas tout perdre
        offset += BATCH_SIZE;
        continue;
      }

      if (!businesses || businesses.length === 0) {
        hasMore = false;
        break;
      }

      businesses.forEach(biz => {
        if (biz.slug && biz.city && biz.main_category_slug) {
          const citySlug = generateSlug(biz.city);
          // CRITICAL: Use ONLY category-based URLs, skip legacy /entreprise/ pattern
          const businessUrl = `${baseUrl}/${biz.main_category_slug}/${citySlug}/${biz.slug}`;

          // IMPROVED: Higher base priority (0.7) for better indexing
          let priority = 0.7;
          if (biz.description && biz.description.trim().length > 20) priority += 0.05;
          if (biz.website && biz.website.trim().length > 0) priority += 0.05;
          if (biz.google_reviews_count && biz.google_reviews_count > 0) priority += 0.05;
          if (biz.google_rating && biz.google_rating >= 4.0) priority += 0.05;

          // Cap at 0.9 max
          priority = Math.min(priority, 0.9);

          allUrls.push({
            loc: businessUrl,
            lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : currentDate,
            changefreq: 'monthly',
            priority: priority.toFixed(2)
          });
        }
      });

      totalProcessed += businesses.length;
      console.log(`   ✅ ${businesses.length} entreprises traitées (Total: ${totalProcessed.toLocaleString()} / ${allUrls.length.toLocaleString()} URLs)`);

      offset += BATCH_SIZE;

      // Si on a moins que BATCH_SIZE, c'est qu'on a atteint la fin
      if (businesses.length < BATCH_SIZE) {
        hasMore = false;
      }

      // Pause pour éviter de surcharger Supabase
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Erreur batch offset ${offset}:`, error.message);
      offset += BATCH_SIZE; // Skip this batch and continue
    }
  }

  console.log(`\n✨ Total URLs générées: ${allUrls.length.toLocaleString()}\n`);

  // Generate sitemap files
  console.log('📝 Génération des fichiers XML...\n');

  const sitemapFiles = [];
  let fileIndex = 0;

  for (let i = 0; i < allUrls.length; i += MAX_URLS_PER_SITEMAP) {
    const chunk = allUrls.slice(i, i + MAX_URLS_PER_SITEMAP);
    const filename = `sitemap-businesses-${fileIndex + 1}.xml`;

    await generateSitemap(chunk, filename);
    sitemapFiles.push(filename);

    console.log(`   ✅ ${filename}: ${chunk.length.toLocaleString()} URLs`);
    fileIndex++;
  }

  // Update sitemap-fr.xml index
  console.log('\n📋 Mise à jour de sitemap-fr.xml...\n');

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://registreduquebec.com/sitemaps/sitemap-static.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
${sitemapFiles.map(file => `  <sitemap>
    <loc>https://registreduquebec.com/sitemaps/${file}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  await fs.writeFile('public/sitemap-fr.xml', sitemapIndex, 'utf-8');

  console.log(`✅ sitemap-fr.xml mis à jour avec ${sitemapFiles.length} fichiers\n`);
  console.log(`\n🎉 TERMINÉ!\n`);
  console.log(`   Fichiers générés: ${fileIndex}`);
  console.log(`   URLs totales: ${allUrls.length.toLocaleString()}`);
  console.log(`   Entreprises traitées: ${totalProcessed.toLocaleString()}\n`);
}

generateSitemapsFR()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
