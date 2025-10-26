/**
 * Génère un sitemap SIMPLE avec seulement les pages statiques
 * Pour éviter les problèmes avec les 480K businesses
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

console.log('🗺️  GÉNÉRATION DU SITEMAP SIMPLE');
console.log('═'.repeat(60));

// Créer le dossier sitemaps s'il n'existe pas
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

// Sub Categories
const { data: subCategories } = await supabase.from('sub_categories').select('slug, main_category:main_categories(slug)');
if (subCategories) {
  console.log(`   ✅ ${subCategories.length} sous-catégories`);
  subCategories.forEach(sub => {
    if (sub.main_category && sub.main_category.slug) {
      staticUrls.push({
        loc: `${baseUrl}/categorie/${sub.main_category.slug}/${sub.slug}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '0.7'
      });
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

// 2. SITEMAP INDEX (juste static pour l'instant)
console.log('');
console.log('📇 Génération sitemap.xml (index)...');

let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemaps/sitemap-static.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

const indexPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(indexPath, sitemapIndex, 'utf-8');

console.log('');
console.log('✅ SITEMAP SIMPLE GÉNÉRÉ AVEC SUCCÈS!');
console.log('═'.repeat(60));
console.log(`📁 Index: public/sitemap.xml`);
console.log(`📂 Sitemap: public/sitemaps/sitemap-static.xml`);
console.log(`📊 Total URLs: ${staticUrls.length}`);
console.log(`🌐 URL: ${baseUrl}/sitemap.xml`);
console.log('═'.repeat(60));
console.log('');
console.log('⚠️  NOTE: Ce sitemap ne contient PAS les 480K entreprises.');
console.log('   Pour les ajouter, il faut d\'abord ajouter la colonne main_category_slug à la table businesses.');
console.log('');
