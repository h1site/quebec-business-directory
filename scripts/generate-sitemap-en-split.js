/**
 * Génère un sitemap index anglais avec sous-sitemaps (5000 URLs max par fichier)
 * Structure: sitemap-en.xml → pointe vers sitemap-static-en.xml + sitemap-businesses-en-1.xml, etc.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'https://registreduquebec.com';
const currentDate = new Date().toISOString().split('T')[0];
const URLS_PER_FILE = 5000;

console.log('🗺️  GÉNÉRATION DES SITEMAPS ANGLAIS (SPLIT)');
console.log('═'.repeat(60));

// Helper function to generate slug
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

// Create sitemaps directory if it doesn't exist
const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

// ==========================================
// STEP 1: Generate sitemap-static-en.xml
// ==========================================
console.log('📄 Génération du sitemap statique anglais...');

let staticSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage English -->
  <url>
    <loc>${baseUrl}/en</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Search English -->
  <url>
    <loc>${baseUrl}/en/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Add business English -->
  <url>
    <loc>${baseUrl}/en/business/new</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

`;

// Main Categories
const { data: mainCategories } = await supabase
  .from('main_categories')
  .select('slug');

if (mainCategories) {
  console.log(`✅ ${mainCategories.length} catégories principales`);
  mainCategories.forEach(cat => {
    staticSitemap += `  <url>
    <loc>${baseUrl}/en/category/${cat.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });
}

// Sub Categories
const { data: subCategories } = await supabase
  .from('sub_categories')
  .select('slug, main_category:main_categories(slug)');

if (subCategories) {
  console.log(`✅ ${subCategories.length} sous-catégories`);
  subCategories.forEach(sub => {
    if (sub.main_category && sub.main_category.slug) {
      staticSitemap += `  <url>
    <loc>${baseUrl}/en/category/${sub.main_category.slug}/${sub.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  });
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
  staticSitemap += `  <url>
    <loc>${baseUrl}/en/region/${region}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
});

console.log(`✅ ${regions.length} régions ajoutées`);

staticSitemap += `</urlset>`;

// Write static sitemap
const staticPath = path.join(sitemapsDir, 'sitemap-static-en.xml');
fs.writeFileSync(staticPath, staticSitemap, 'utf-8');
console.log(`✅ Fichier statique créé: ${staticPath}`);

// ==========================================
// STEP 2: Generate business sitemaps (split by 5000)
// ==========================================
console.log('\n🏢 Génération des sitemaps entreprises (5000 par fichier)...');

const pageSize = 1000; // Fetch 1000 at a time from DB
let page = 0;
let totalBusinesses = 0;
let skippedBusinesses = 0;
let currentFileIndex = 1;
let currentFileUrls = [];
let businessSitemapFiles = [];

while (true) {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, updated_at, main_category_slug, city, categories')
    .order('id')
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error || !businesses || businesses.length === 0) {
    break;
  }

  businesses.forEach(biz => {
    // Skip if missing essential fields
    if (!biz.city || !biz.slug) {
      skippedBusinesses++;
      return;
    }

    // Use main_category_slug if available, otherwise use first category UUID as fallback
    let categoryPart = biz.main_category_slug;
    if (!categoryPart && biz.categories && biz.categories.length > 0) {
      categoryPart = biz.categories[0]; // Use UUID as fallback
    }

    const lastmod = biz.updated_at ?
      new Date(biz.updated_at).toISOString().split('T')[0] :
      currentDate;

    const citySlug = generateSlug(biz.city);

    // Format URLs:
    // - With category: /en/{category-slug}/{city}/{slug}
    // - Without category: /en/entreprise/{city}/{slug}
    const businessUrl = categoryPart
      ? `${baseUrl}/en/${categoryPart}/${citySlug}/${biz.slug}`
      : `${baseUrl}/en/entreprise/${citySlug}/${biz.slug}`;

    const urlEntry = `  <url>
    <loc>${businessUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;

    currentFileUrls.push(urlEntry);

    // If we reach 5000 URLs, write to file
    if (currentFileUrls.length >= URLS_PER_FILE) {
      const filename = `sitemap-businesses-en-${currentFileIndex}.xml`;
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${currentFileUrls.join('')}</urlset>`;

      const filepath = path.join(sitemapsDir, filename);
      fs.writeFileSync(filepath, sitemap, 'utf-8');

      businessSitemapFiles.push(filename);
      console.log(`   ✅ ${filename} créé (${currentFileUrls.length} URLs)`);

      currentFileIndex++;
      currentFileUrls = [];
    }
  });

  totalBusinesses += businesses.length;
  console.log(`   Page ${page + 1}: +${businesses.length} entreprises (Total: ${totalBusinesses})`);

  if (businesses.length < pageSize) {
    break;
  }

  page++;
}

// Write remaining URLs to final file
if (currentFileUrls.length > 0) {
  const filename = `sitemap-businesses-en-${currentFileIndex}.xml`;
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${currentFileUrls.join('')}</urlset>`;

  const filepath = path.join(sitemapsDir, filename);
  fs.writeFileSync(filepath, sitemap, 'utf-8');

  businessSitemapFiles.push(filename);
  console.log(`   ✅ ${filename} créé (${currentFileUrls.length} URLs)`);
}

if (skippedBusinesses > 0) {
  console.log(`⚠️  ${skippedBusinesses} entreprises ignorées (données manquantes)`);
}

console.log(`✅ ${totalBusinesses} entreprises ajoutées dans ${businessSitemapFiles.length} fichiers`);

// ==========================================
// STEP 3: Generate sitemap index (sitemap-en.xml)
// ==========================================
console.log('\n📋 Génération du sitemap index...');

let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemaps/sitemap-static-en.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;

businessSitemapFiles.forEach(filename => {
  sitemapIndex += `  <sitemap>
    <loc>${baseUrl}/sitemaps/${filename}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;
});

sitemapIndex += `</sitemapindex>`;

// Write sitemap index to public root
const indexPath = path.join(__dirname, '..', 'public', 'sitemap-en.xml');
fs.writeFileSync(indexPath, sitemapIndex, 'utf-8');

console.log('');
console.log('✅ Sitemaps anglais générés avec succès!');
console.log('═'.repeat(60));
console.log(`📁 Index: public/sitemap-en.xml`);
console.log(`📁 Fichiers: public/sitemaps/sitemap-*-en-*.xml`);
console.log(`📊 Total fichiers: ${businessSitemapFiles.length + 1}`);
console.log(`📊 Total URLs: ${(mainCategories?.length || 0) + (subCategories?.length || 0) + regions.length + totalBusinesses + 3}`);
console.log(`🌐 Base URL: ${baseUrl}/en`);
console.log('═'.repeat(60));
console.log('');
console.log('📤 Prochaines étapes:');
console.log('   1. Commit et push les fichiers sitemap');
console.log('   2. Soumettez https://registreduquebec.com/sitemap-en.xml à Google Search Console');
console.log('');
