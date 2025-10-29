/**
 * Génère un sitemap-en.xml complet avec TOUTES les pages du site EN ANGLAIS
 * Optimisé pour 2000+ entreprises avec pagination
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
const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

console.log('🗺️  GÉNÉRATION DU SITEMAP ANGLAIS (EN)');
console.log('═'.repeat(60));

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
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

// Main Categories (English URLs)
console.log('📋 Récupération des catégories principales...');
const { data: mainCategories } = await supabase
  .from('main_categories')
  .select('slug');

if (mainCategories) {
  console.log(`✅ ${mainCategories.length} catégories principales`);
  mainCategories.forEach(cat => {
    sitemap += `  <url>
    <loc>${baseUrl}/en/category/${cat.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });
}

// Sub Categories (English URLs)
console.log('📑 Récupération des sous-catégories...');
const { data: subCategories } = await supabase
  .from('sub_categories')
  .select('slug, main_category:main_categories(slug)');

if (subCategories) {
  console.log(`✅ ${subCategories.length} sous-catégories`);
  subCategories.forEach(sub => {
    if (sub.main_category && sub.main_category.slug) {
      sitemap += `  <url>
    <loc>${baseUrl}/en/category/${sub.main_category.slug}/${sub.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  });
}

// Regions (English URLs)
console.log('🗺️  Ajout des régions...');
const regions = [
  'monteregie', 'montreal', 'laval', 'laurentides', 'lanaudiere',
  'capitale-nationale', 'outaouais', 'estrie', 'mauricie',
  'saguenay-lac-saint-jean', 'abitibi-temiscamingue', 'cote-nord',
  'gaspesie-iles-de-la-madeleine', 'bas-saint-laurent',
  'chaudiere-appalaches', 'centre-du-quebec'
];

regions.forEach(region => {
  sitemap += `  <url>
    <loc>${baseUrl}/en/region/${region}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
});

console.log(`✅ ${regions.length} régions ajoutées`);

// Businesses - Paginated to avoid memory issues (English URLs)
console.log('🏢 Récupération des entreprises (paginé)...');
const pageSize = 500;
let page = 0;
let totalBusinesses = 0;
let skippedBusinesses = 0;

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

while (true) {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, updated_at, main_category_slug, city')
    .order('id')
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error || !businesses || businesses.length === 0) {
    break;
  }

  businesses.forEach(biz => {
    // Skip businesses without required data for new URL format
    if (!biz.main_category_slug || !biz.city || !biz.slug) {
      skippedBusinesses++;
      return;
    }

    const lastmod = biz.updated_at ?
      new Date(biz.updated_at).toISOString().split('T')[0] :
      currentDate;

    const citySlug = generateSlug(biz.city);
    const businessUrl = `${baseUrl}/en/${biz.main_category_slug}/${citySlug}/${biz.slug}`;

    sitemap += `  <url>
    <loc>${businessUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  totalBusinesses += businesses.length;
  console.log(`   Page ${page + 1}: +${businesses.length} entreprises (Total: ${totalBusinesses})`);

  if (businesses.length < pageSize) {
    break; // Last page
  }

  page++;
}

if (skippedBusinesses > 0) {
  console.log(`⚠️  ${skippedBusinesses} entreprises ignorées (données manquantes)`);
}

console.log(`✅ ${totalBusinesses} entreprises ajoutées`);

sitemap += `</urlset>`;

// Write to public folder
const outputPath = path.join(__dirname, '..', 'public', 'sitemap-en.xml');
fs.writeFileSync(outputPath, sitemap, 'utf-8');

console.log('');
console.log('✅ Sitemap anglais généré avec succès!');
console.log('═'.repeat(60));
console.log(`📁 Fichier: public/sitemap-en.xml`);
console.log(`📊 Total URLs: ${(mainCategories?.length || 0) + (subCategories?.length || 0) + regions.length + totalBusinesses + 3}`);
console.log(`🌐 Base URL: ${baseUrl}/en`);
console.log('═'.repeat(60));
console.log('');
console.log('📤 Prochaine étape:');
console.log('   1. Commit et push le sitemap-en.xml');
console.log('   2. Soumettez https://registreduquebec.com/sitemap-en.xml à Google Search Console');
console.log('');
