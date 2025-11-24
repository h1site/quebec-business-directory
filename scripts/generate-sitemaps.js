/**
 * Génère tous les sitemaps (FR et EN) avec support hreflang.
 *
 * Ce script unifié remplace les anciens scripts séparés.
 * 1. Récupère toutes les entités (pages statiques, catégories, entreprises).
 * 2. Pour chaque entité, génère l'URL française et anglaise.
 * 3. Crée des sitemaps paginés contenant les URLs avec les balises <xhtml:link> pour le hreflang.
 * 4. Crée les fichiers d'index de sitemap (sitemap-fr.xml, sitemap-en.xml).
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🗺️  DÉBUT DE LA GÉNÉRATION DES SITEMAPS UNIFIÉS (FR+EN) 🗺️');
console.log('═'.repeat(60));

// --- CONFIGURATION ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const baseUrl = 'https://registreduquebec.com';
const currentDate = '2025-11-24'; // Date fixe pour cohérence
const MAX_URLS_PER_SITEMAP = 40000; // Limite Google = 50k, on garde une marge.
const BATCH_SIZE = 5000; // Nombre d'items à récupérer de Supabase à la fois.

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) sont manquantes.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- HELPERS ---

const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');
if (!fs.existsSync(sitemapsDir)) {
  fs.mkdirSync(sitemapsDir, { recursive: true });
}

function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

const frToEnCategorySlug = {
  'services-professionnels': 'professional-services',
  'finance-assurance-et-juridique': 'finance-insurance-and-legal',
  'technologie': 'technology',
  'education-et-formation': 'education-and-training',
  'commerce-de-detail': 'retail',
  'construction-et-renovation': 'construction-and-renovation',
  'organismes-publics-et-communautaires': 'public-and-community-organizations',
  'sante-et-bien-etre': 'health-and-wellness',
  'automobile-et-transport': 'automobile-and-transportation',
  'industrie-fabrication-et-logistique': 'manufacturing-and-logistics',
  'construction': 'construction',
  'agriculture-et-environnement': 'agriculture-and-environment',
  'immobilier': 'real-estate',
  'technologie-et-informatique': 'technology-and-it',
  'restauration-et-alimentation': 'food-and-dining',
  'sports-et-loisirs': 'sports-and-recreation',
  'arts-medias-et-divertissement': 'arts-media-and-entertainment',
  'restauration': 'restaurants',
  'soins-a-domicile': 'home-care',
  'transport-et-logistique': 'transportation-and-logistics',
  'hebergement-et-tourisme': 'accommodation-and-tourism',
  'services-aux-entreprises': 'business-services',
  'services-personnels': 'personal-services',
  'services-financiers': 'financial-services',
  'energie-et-ressources-naturelles': 'energy-and-natural-resources',
  'telecommunications': 'telecommunications',
  'agence-web': 'web-agency',
  'agence-immobiliere': 'real-estate-agency',
  'clinique-medicale': 'medical-clinic',
  'cabinet-dentaire': 'dental-office',
  'salon-de-coiffure': 'hair-salon',
  'garage-automobile': 'auto-garage',
  'epicerie': 'grocery-store',
  'pharmacie': 'pharmacy',
  'quincaillerie': 'hardware-store',
  'boutique-vetements': 'clothing-store',
  'restaurant': 'restaurant',
  'cafe': 'cafe',
  'bar': 'bar',
  'hotel': 'hotel',
  'motel': 'motel',
  'entreprise': 'business',
};

const enToFrCategorySlug = Object.fromEntries(Object.entries(frToEnCategorySlug).map(([fr, en]) => [en, fr]));

const getSlug = (slug, lang) => {
  if (lang === 'en') return frToEnCategorySlug[slug] || slug;
  return enToFrCategorySlug[slug] || slug;
};

function generateSitemapFile(urlEntries, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.map(url => `  <url>
    <loc>${url.loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr-CA" href="${url.fr_loc}"/>
    <xhtml:link rel="alternate" hreflang="en-CA" href="${url.en_loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url.fr_loc}"/>
    <lastmod>${url.lastmod || currentDate}</lastmod>
    <changefreq>${url.changefreq || 'monthly'}</changefreq>
    <priority>${url.priority || '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

  const filepath = path.join(__dirname, '..', 'public', 'sitemaps', filename);
  fs.writeFileSync(filepath, xml, 'utf-8');
}

async function main() {
  const allUrlEntries = [];

  // 1. Pages Statiques
  console.log('\n[1/4] 📄 Génération des URLs statiques...');
  const staticPages = [
    { fr: '/', en: '/en', priority: '1.0', changefreq: 'daily' },
    { fr: '/recherche', en: '/en/search', priority: '0.9', changefreq: 'daily' },
    { fr: '/a-propos', en: '/en/about', priority: '0.6', changefreq: 'monthly' },
    { fr: '/blogue', en: '/en/blog', priority: '0.8', changefreq: 'weekly' },
  ];
  staticPages.forEach(page => {
    allUrlEntries.push({
      fr_loc: `${baseUrl}${page.fr}`,
      en_loc: `${baseUrl}${page.en}`,
      lastmod: currentDate,
      priority: page.priority,
      changefreq: page.changefreq,
      type: 'static'
    });
  });
  console.log(`   ✅ ${staticPages.length} pages statiques ajoutées.`);

  // Articles de blog - HAUTE PRIORITÉ
  const blogArticles = [
    { slug: 'comment-reclamer-fiche-entreprise', date: '2025-11-01' },
    { slug: 'neq-quebec-tout-savoir-numero-entreprise', date: '2025-11-01' },
    { slug: 'top-10-restaurants-montreal', date: '2025-11-01' },
  ];
  blogArticles.forEach(article => {
    allUrlEntries.push({
      fr_loc: `${baseUrl}/blogue/${article.slug}`,
      en_loc: `${baseUrl}/en/blog/${article.slug}`,
      lastmod: article.date,
      priority: '0.85', // Haute priorité pour le blog
      changefreq: 'monthly',
      type: 'static'
    });
  });
  console.log(`   ✅ ${blogArticles.length} articles de blog ajoutés avec priorité 0.85.`);

  // 2. Catégories & Régions
  console.log('\n[2/4] 🗂️ Génération des URLs de catégories et régions...');
  const { data: categories, error: catError } = await supabase.from('main_categories').select('slug');
  if (catError) throw catError;

  categories.forEach(cat => {
    allUrlEntries.push({
      fr_loc: `${baseUrl}/categorie/${cat.slug}`,
      en_loc: `${baseUrl}/en/category/${getSlug(cat.slug, 'en')}`,
      lastmod: currentDate,
      priority: '0.8',
      changefreq: 'weekly',
      type: 'static'
    });
  });
  console.log(`   ✅ ${categories.length} catégories principales ajoutées.`);

  const regions = ['monteregie', 'montreal', 'laval', 'laurentides', 'lanaudiere', 'capitale-nationale', 'outaouais', 'estrie', 'mauricie', 'saguenay-lac-saint-jean', 'abitibi-temiscamingue', 'cote-nord', 'gaspesie-iles-de-la-madeleine', 'bas-saint-laurent', 'chaudiere-appalaches', 'centre-du-quebec'];
  regions.forEach(region => {
    allUrlEntries.push({
      fr_loc: `${baseUrl}/region/${region}`,
      en_loc: `${baseUrl}/en/region/${region}`,
      lastmod: currentDate,
      priority: '0.7',
      changefreq: 'weekly',
      type: 'static'
    });
  });
  console.log(`   ✅ ${regions.length} régions ajoutées.`);


  // 3. Fiches Entreprises
  console.log('\n[3/4] 🏢 Génération des URLs d\'entreprises...');
  const { count: totalBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
  console.log(`   Total à traiter: ${totalBusinesses.toLocaleString()} entreprises.`);

  let offset = 0;
  while(offset < totalBusinesses) {
    process.stdout.write(`\r   Traitement de ${offset.toLocaleString()} / ${totalBusinesses.toLocaleString()}...`);
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, updated_at, city, main_category_slug')
      .not('slug', 'is', null)
      .not('city', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) throw error;
    
    businesses.forEach(biz => {
      const citySlug = generateSlug(biz.city);
      const frCatSlug = biz.main_category_slug || 'entreprise';
      const enCatSlug = getSlug(frCatSlug, 'en');

      allUrlEntries.push({
        fr_loc: `${baseUrl}/${frCatSlug}/${citySlug}/${biz.slug}`,
        en_loc: `${baseUrl}/en/${enCatSlug}/${citySlug}/${biz.slug}`,
        lastmod: biz.updated_at ? new Date(biz.updated_at).toISOString().split('T')[0] : currentDate,
        priority: '0.6',
        changefreq: 'monthly',
        type: 'business'
      });
    });

    offset += BATCH_SIZE;
  }
  console.log(`\r   Traitement de ${totalBusinesses.toLocaleString()} / ${totalBusinesses.toLocaleString()}... Terminé.`);


  // 4. Écriture des fichiers sitemap
  console.log('\n[4/4] ✍️  Écriture des fichiers sitemap...');
  const sitemapFilesFR = [];
  const sitemapFilesEN = [];

  // Sitemaps statiques
  const staticEntries = allUrlEntries.filter(e => e.type === 'static');
  const staticFrUrls = staticEntries.map(e => ({ ...e, loc: e.fr_loc }));
  const staticEnUrls = staticEntries.map(e => ({ ...e, loc: e.en_loc }));
  generateSitemapFile(staticFrUrls, 'sitemap-static.xml');
  sitemapFilesFR.push('sitemap-static.xml');
  generateSitemapFile(staticEnUrls, 'sitemap-static-en.xml');
  sitemapFilesEN.push('sitemap-static-en.xml');
  console.log(`   ✅ Sitemaps statiques (FR & EN) générés.`);

  // Sitemaps entreprises
  const businessEntries = allUrlEntries.filter(e => e.type === 'business');
  for (let i = 0; i * MAX_URLS_PER_SITEMAP < businessEntries.length; i++) {
    const chunk = businessEntries.slice(i * MAX_URLS_PER_SITEMAP, (i + 1) * MAX_URLS_PER_SITEMAP);
    
    const frChunk = chunk.map(e => ({ ...e, loc: e.fr_loc }));
    const enChunk = chunk.map(e => ({ ...e, loc: e.en_loc }));

    // FR
    const frFilename = `sitemap-businesses-${i + 1}.xml`;
    generateSitemapFile(frChunk, frFilename);
    sitemapFilesFR.push(frFilename);
    
    // EN
    const enFilename = `sitemap-businesses-en-${i + 1}.xml`;
    generateSitemapFile(enChunk, enFilename);
    sitemapFilesEN.push(enFilename);
  }
  console.log(`   ✅ ${Math.ceil(businessEntries.length / MAX_URLS_PER_SITEMAP)} sitemaps d'entreprises (FR & EN) générés.`);
  
  // Générer les fichiers d'index
  const generateIndexFile = (files, filename) => {
    const indexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map(file => `  <sitemap>
    <loc>${baseUrl}/sitemaps/${file}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
    const indexPath = path.join(__dirname, '..', 'public', filename);
    fs.writeFileSync(indexPath, indexXML, 'utf-8');
  };

  generateIndexFile(sitemapFilesFR, 'sitemap-fr.xml');
  generateIndexFile(sitemapFilesEN, 'sitemap-en.xml');
  console.log(`   ✅ Fichiers d'index sitemap-fr.xml et sitemap-en.xml générés.`);
  
  // Fichier d'index principal
  const mainIndexFiles = ['sitemap-fr.xml', 'sitemap-en.xml'];
  generateIndexFile(mainIndexFiles.map(f => f.replace('sitemaps/', '')), 'sitemap.xml');
  console.log(`   ✅ Fichier d'index principal sitemap.xml généré.`);

  console.log('═'.repeat(60));
  console.log('✅ SITEMAPS UNIFIÉS (FR+EN) GÉNÉRÉS AVEC SUCCÈS!');
  console.log('═'.repeat(60));
}

main().catch(error => {
  console.error('\n❌ Une erreur critique est survenue lors de la génération des sitemaps:', error);
  process.exit(1);
});
