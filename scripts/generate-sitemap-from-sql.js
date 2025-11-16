import pg from 'pg';
import fs from 'fs/promises';
import 'dotenv/config';

const { Client } = pg;

// Parse Supabase URL to get PostgreSQL connection details
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];

// Direct PostgreSQL connection (requires connection pooler details from Supabase)
const connectionString = `postgresql://postgres.${projectRef}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

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

async function generateAllSitemaps() {
  console.log('\n🔄 Génération des sitemaps via connexion PostgreSQL directe\n');

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    const currentDate = new Date().toISOString().split('T')[0];

    // Stream results using cursor
    const query = `
      SELECT
        id, slug, city, main_category_slug, updated_at,
        description, website, google_reviews_count, google_rating
      FROM businesses
      WHERE slug IS NOT NULL AND city IS NOT NULL
      ORDER BY id ASC
    `;

    console.log('📊 Récupération de toutes les entreprises...\n');

    const result = await client.query(query);
    const businesses = result.rows;

    console.log(`✅ ${businesses.length.toLocaleString()} entreprises récupérées\n`);
    console.log('📝 Génération des URLs...\n');

    const allUrls = businesses.map(biz => {
      const citySlug = generateSlug(biz.city);
      const categoryPart = biz.main_category_slug || 'entreprise';
      const businessUrl = `${baseUrl}/${categoryPart}/${citySlug}/${biz.slug}`;

      let priority = 0.4;
      if (biz.description && biz.description.trim().length > 20) priority += 0.1;
      if (biz.website && biz.website.trim().length > 0) priority += 0.1;
      if (biz.google_reviews_count && biz.google_reviews_count > 0) priority += 0.1;
      if (biz.google_rating && biz.google_rating >= 4.0) priority += 0.1;

      return {
        loc: businessUrl,
        lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : currentDate,
        changefreq: 'monthly',
        priority: priority.toFixed(1)
      };
    });

    console.log(`✅ ${allUrls.length.toLocaleString()} URLs générées\n`);
    console.log('📄 Création des fichiers sitemap...\n');

    // Generate sitemap files
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

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('\n💡 Assurez-vous d\'avoir:');
    console.error('   1. Installé pg: npm install pg');
    console.error('   2. SUPABASE_DB_PASSWORD dans .env');
    console.error('   3. Activé "Connection Pooling" dans Supabase\n');
  } finally {
    await client.end();
  }
}

generateAllSitemaps()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
