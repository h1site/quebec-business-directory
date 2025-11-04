/**
 * Génère un sitemap avec TOUTES les businesses (français)
 * Format: /{category-slug}/{city}/{slug}
 * Utilise main_category_slug si disponible, sinon categories[0] UUID
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://registreduquebec.com';
const currentDate = new Date().toISOString().split('T')[0];
const MAX_URLS_PER_SITEMAP = 5000;
const BATCH_SIZE = 1000;

console.log('🗺️  GÉNÉRATION DU SITEMAP COMPLET (TOUTES LES BUSINESSES)');
console.log('═'.repeat(60));

// Helper function to generate slug
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Créer le dossier sitemaps
const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

// Fonction pour générer un sitemap
function generateSitemap(urls, filename) {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  urls.forEach(url => {
    sitemap += `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || currentDate}</lastmod>
    <changefreq>${url.changefreq || 'monthly'}</changefreq>
    <priority>${url.priority || '0.5'}</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  const filepath = path.join(sitemapsDir, filename);
  fs.writeFileSync(filepath, sitemap, 'utf-8');
  return filepath;
}

// 1. SITEMAP STATIC
console.log('📄 Génération sitemap-static.xml...');
const staticUrls = [];

staticUrls.push(
  { loc: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
  { loc: `${baseUrl}/recherche`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' },
  { loc: `${baseUrl}/ajouter`, lastmod: currentDate, changefreq: 'monthly', priority: '0.7' },
  { loc: `${baseUrl}/a-propos`, lastmod: currentDate, changefreq: 'monthly', priority: '0.6' }
);

// Blog Articles (French)
staticUrls.push(
  { loc: `${baseUrl}/blogue/comment-reclamer-fiche-entreprise`, lastmod: '2025-11-01', changefreq: 'monthly', priority: '0.8' },
  { loc: `${baseUrl}/blogue/neq-quebec-tout-savoir-numero-entreprise`, lastmod: '2025-11-01', changefreq: 'monthly', priority: '0.8' },
  { loc: `${baseUrl}/blogue/top-10-restaurants-montreal`, lastmod: '2025-11-01', changefreq: 'monthly', priority: '0.7' }
);

console.log('   ✅ 3 articles de blog (FR)');

// Main Categories
const { data: mainCategories } = await supabase.from('main_categories').select('slug');
if (mainCategories) {
  console.log(`   ✅ ${mainCategories.length} catégories principales`);
  mainCategories.forEach(cat => {
    staticUrls.push({
      loc: `${baseUrl}/categorie/${cat.slug}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });
}

// Sub Categories (only include if they have businesses)
const { data: subCategories } = await supabase.from('sub_categories').select('slug, main_category:main_categories(slug)');
if (subCategories) {
  console.log(`   📋 ${subCategories.length} sous-catégories totales, filtrage des vides...`);
  let nonEmptyCount = 0;

  for (const sub of subCategories) {
    if (sub.main_category && sub.main_category.slug) {
      // Check if subcategory has at least one business
      const { count } = await supabase
        .from('businesses_enriched')
        .select('*', { count: 'exact', head: true })
        .eq('primary_sub_category_slug', sub.slug);

      if (count && count > 0) {
        staticUrls.push({
          loc: `${baseUrl}/categorie/${sub.main_category.slug}/${sub.slug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: '0.7'
        });
        nonEmptyCount++;
      }
    }
  }
  console.log(`   ✅ ${nonEmptyCount} sous-catégories avec entreprises`);
}

// Regions
const regions = [
  'monteregie', 'montreal', 'laval', 'laurentides', 'lanaudiere',
  'capitale-nationale', 'outaouais', 'estrie', 'mauricie',
  'saguenay-lac-saint-jean', 'abitibi-temiscamingue', 'cote-nord',
  'gaspesie-iles-de-la-madeleine', 'bas-saint-laurent',
  'chaudiere-appalaches', 'centre-du-quebec'
];

regions.forEach(region => {
  staticUrls.push({
    loc: `${baseUrl}/region/${region}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: '0.7'
  });
});

console.log(`   ✅ ${regions.length} régions`);
generateSitemap(staticUrls, 'sitemap-static.xml');
console.log(`✅ sitemap-static.xml créé (${staticUrls.length} URLs)`);

// 2. SITEMAPS BUSINESSES
console.log('');
console.log('🏢 Génération sitemaps des entreprises...');

const { count: totalBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
console.log(`   📊 Total: ${totalBusinesses?.toLocaleString()} entreprises`);

const numBusinessSitemaps = Math.ceil(totalBusinesses / MAX_URLS_PER_SITEMAP);
console.log(`   📑 Nombre de fichiers: ${numBusinessSitemaps}`);

const sitemapFiles = ['sitemap-static.xml'];

// Générer chaque sitemap
for (let fileIndex = 0; fileIndex < numBusinessSitemaps; fileIndex++) {
  const filename = `sitemap-businesses-${fileIndex + 1}.xml`;
  console.log(`\n   📄 ${filename}...`);

  const businessUrls = [];
  const fileOffset = fileIndex * MAX_URLS_PER_SITEMAP;
  const numBatches = Math.ceil(MAX_URLS_PER_SITEMAP / BATCH_SIZE);

  // Charger par lots
  for (let batchIndex = 0; batchIndex < numBatches && businessUrls.length < MAX_URLS_PER_SITEMAP; batchIndex++) {
    const batchOffset = fileOffset + (batchIndex * BATCH_SIZE);

    try {
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('slug, updated_at, city, main_category_slug, categories, description, website, google_reviews_count, google_rating')
        .order('id')
        .range(batchOffset, batchOffset + BATCH_SIZE - 1);

      if (error) throw error;
      if (!businesses || businesses.length === 0) break;

      businesses.forEach(biz => {
        if (businessUrls.length < MAX_URLS_PER_SITEMAP && biz.slug && biz.city) {
          const citySlug = generateSlug(biz.city);

          // Use main_category_slug if available, otherwise use 'entreprise' as fallback
          // IMPORTANT: Don't use categories[0] as it contains UUIDs, not slugs
          const categoryPart = biz.main_category_slug || 'entreprise';

          // Format URLs: /{category-slug}/{city}/{slug}
          const businessUrl = `${baseUrl}/${categoryPart}/${citySlug}/${biz.slug}`;

          // Calculate priority based on content quality (0.4-0.8)
          let priority = 0.4; // Base priority for minimal content

          // +0.1 if has description
          if (biz.description && biz.description.trim().length > 20) priority += 0.1;

          // +0.1 if has website
          if (biz.website && biz.website.trim().length > 0) priority += 0.1;

          // +0.1 if has reviews
          if (biz.google_reviews_count && biz.google_reviews_count > 0) priority += 0.1;

          // +0.1 if has good rating (4.0+)
          if (biz.google_rating && biz.google_rating >= 4.0) priority += 0.1;

          businessUrls.push({
            loc: businessUrl,
            lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : currentDate,
            changefreq: 'monthly',
            priority: priority.toFixed(1)
          });
        }
      });

      process.stdout.write(`\r      Chargement: ${businessUrls.length.toLocaleString()}/${MAX_URLS_PER_SITEMAP.toLocaleString()}`);

      if (businesses.length < BATCH_SIZE) break;
    } catch (error) {
      console.error(`\n      ❌ Erreur batch ${batchIndex}:`, error.message);
      break;
    }
  }

  console.log('');
  generateSitemap(businessUrls, filename);
  sitemapFiles.push(filename);
  console.log(`   ✅ ${businessUrls.length.toLocaleString()} URLs`);
}

// 3. SITEMAP INDEX (FR)
console.log('');
console.log('📇 Génération sitemap-fr.xml (index français)...');

let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

sitemapFiles.forEach(file => {
  sitemapIndex += `  <sitemap>
    <loc>${baseUrl}/sitemaps/${file}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;
});

sitemapIndex += `</sitemapindex>`;

const indexPath = path.join(__dirname, '..', 'public', 'sitemap-fr.xml');
fs.writeFileSync(indexPath, sitemapIndex, 'utf-8');

console.log('');
console.log('✅ SITEMAP FRANÇAIS COMPLET GÉNÉRÉ AVEC SUCCÈS!');
console.log('═'.repeat(60));
console.log(`📁 Index: public/sitemap-fr.xml`);
console.log(`📂 Sitemaps: public/sitemaps/ (${sitemapFiles.length} fichiers)`);
console.log(`📊 Total URLs: ~${(totalBusinesses + staticUrls.length).toLocaleString()}`);
console.log(`🌐 URL: ${baseUrl}/sitemap-fr.xml`);
console.log('═'.repeat(60));
