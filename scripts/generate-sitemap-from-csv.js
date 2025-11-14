import fs from 'fs/promises';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

const MAX_URLS_PER_SITEMAP = 5000;
const baseUrl = 'https://registreduquebec.com';

function generateSlug(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateSitemap(urls, filename) {
  const urlEntries = urls.map(({ loc, lastmod, changefreq, priority }) =>
    `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  await fs.writeFile(`public/sitemaps/${filename}`, sitemap, 'utf-8');
}

async function generateFromCSV(csvPath) {
  console.log('\n🔄 Génération des sitemaps depuis CSV\n');
  console.log(`📄 Lecture: ${csvPath}\n`);

  const currentDate = new Date().toISOString().split('T')[0];
  const allUrls = [];

  return new Promise((resolve, reject) => {
    createReadStream(csvPath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
        escape: '"',
        quote: '"'
      }))
      .on('data', (row) => {
        // CRITICAL: Only include businesses with proper category (skip legacy /entreprise/ URLs)
        if (row.slug && row.city && row.main_category_slug) {
          const citySlug = generateSlug(row.city);
          // Use category-based URLs only
          const businessUrl = `${baseUrl}/${row.main_category_slug}/${citySlug}/${row.slug}`;

          // IMPROVED: Higher base priority (0.7) for better indexing
          let priority = 0.7;
          if (row.description && row.description.trim().length > 20) priority += 0.05;
          if (row.website && row.website.trim().length > 0) priority += 0.05;
          if (row.google_reviews_count && parseInt(row.google_reviews_count) > 0) priority += 0.05;
          if (row.google_rating && parseFloat(row.google_rating) >= 4.0) priority += 0.05;

          // Cap at 0.9 max
          priority = Math.min(priority, 0.9);

          allUrls.push({
            loc: businessUrl,
            lastmod: row.updated_at ? row.updated_at.split('T')[0] : currentDate,
            changefreq: 'monthly',
            priority: priority.toFixed(2)
          });

          if (allUrls.length % 10000 === 0) {
            console.log(`   📊 ${allUrls.length.toLocaleString()} URLs générées...`);
          }
        }
      })
      .on('end', async () => {
        console.log(`\n✅ ${allUrls.length.toLocaleString()} URLs générées\n`);
        console.log('📄 Création des fichiers sitemap...\n');

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

        console.log(`✅ sitemap-fr.xml créé avec ${sitemapFiles.length} fichiers\n`);
        console.log(`\n🎉 TERMINÉ!\n`);
        console.log(`   Fichiers: ${fileIndex}`);
        console.log(`   URLs: ${allUrls.length.toLocaleString()}\n`);

        resolve();
      })
      .on('error', reject);
  });
}

const csvPath = process.argv[2] || 'businesses-export.csv';

generateFromCSV(csvPath)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur:', err);
    console.error('\nUsage: node scripts/generate-sitemap-from-csv.js [csv-file-path]');
    console.error('\nPour obtenir le CSV:');
    console.error('1. Allez dans Supabase Dashboard > Table Editor > businesses');
    console.error('2. Cliquez sur Export > CSV');
    console.error('3. Téléchargez le fichier et placez-le à la racine du projet');
    console.error('4. Lancez: node scripts/generate-sitemap-from-csv.js businesses-export.csv\n');
    process.exit(1);
  });
