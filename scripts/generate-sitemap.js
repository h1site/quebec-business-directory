/**
 * Génère un sitemap.xml complet avec TOUTES les pages du site
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

console.log('🗺️  GÉNÉRATION DU SITEMAP COMPLET');
console.log('═'.repeat(60));

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Search -->
  <url>
    <loc>${baseUrl}/recherche</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Add business -->
  <url>
    <loc>${baseUrl}/ajouter</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

`;

// Main Categories
console.log('📋 Récupération des catégories principales...');
const { data: mainCategories } = await supabase
  .from('main_categories')
  .select('slug');

if (mainCategories) {
  console.log(`✅ ${mainCategories.length} catégories principales`);
  mainCategories.forEach(cat => {
    sitemap += `  <url>
    <loc>${baseUrl}/categorie/${cat.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });
}

// Sub Categories
console.log('📑 Récupération des sous-catégories...');
const { data: subCategories } = await supabase
  .from('sub_categories')
  .select('slug, main_category:main_categories(slug)');

if (subCategories) {
  console.log(`✅ ${subCategories.length} sous-catégories`);
  subCategories.forEach(sub => {
    if (sub.main_category && sub.main_category.slug) {
      sitemap += `  <url>
    <loc>${baseUrl}/categorie/${sub.main_category.slug}/${sub.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    }
  });
}

// Regions
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
    <loc>${baseUrl}/region/${region}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
});

console.log(`✅ ${regions.length} régions ajoutées`);

// Businesses - Paginated to avoid memory issues
console.log('🏢 Récupération des entreprises (paginé)...');
const pageSize = 500;
let page = 0;
let totalBusinesses = 0;

while (true) {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('slug, updated_at')
    .order('id')
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error || !businesses || businesses.length === 0) {
    break;
  }

  businesses.forEach(biz => {
    const lastmod = biz.updated_at ?
      new Date(biz.updated_at).toISOString().split('T')[0] :
      currentDate;

    sitemap += `  <url>
    <loc>${baseUrl}/entreprise/${biz.slug}</loc>
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

console.log(`✅ ${totalBusinesses} entreprises ajoutées`);

sitemap += `</urlset>`;

// Write to public folder
const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf-8');

console.log('');
console.log('✅ Sitemap généré avec succès!');
console.log('═'.repeat(60));
console.log(`📁 Fichier: public/sitemap.xml`);
console.log(`📊 Total URLs: ${(mainCategories?.length || 0) + (subCategories?.length || 0) + regions.length + totalBusinesses + 3}`);
console.log(`🌐 Base URL: ${baseUrl}`);
console.log('═'.repeat(60));
console.log('');
console.log('📤 Prochaine étape:');
console.log('   1. Commit et push le sitemap.xml');
console.log('   2. Soumettez https://registreduquebec.com/sitemap.xml à Google Search Console');
console.log('');
