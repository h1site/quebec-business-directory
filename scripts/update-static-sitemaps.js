/**
 * Met à jour UNIQUEMENT les sitemaps statiques (pages + blog) avec:
 * - Date: 2025-11-24
 * - Priorités élevées pour le blog (0.85)
 * - Priorités appropriées pour les pages principales
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗺️  MISE À JOUR DES SITEMAPS STATIQUES');
console.log('═'.repeat(60));

const baseUrl = 'https://registreduquebec.com';
const currentDate = '2025-11-24';
const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');

// Pages statiques avec priorités
const staticPagesFR = [
  { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
  { loc: `${baseUrl}/recherche`, priority: '0.9', changefreq: 'daily' },
  { loc: `${baseUrl}/blogue`, priority: '0.9', changefreq: 'daily' },
  { loc: `${baseUrl}/a-propos`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${baseUrl}/parcourir/categories`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${baseUrl}/parcourir/regions`, priority: '0.8', changefreq: 'weekly' },
];

const staticPagesEN = [
  { loc: `${baseUrl}/en`, priority: '1.0', changefreq: 'daily' },
  { loc: `${baseUrl}/en/search`, priority: '0.9', changefreq: 'daily' },
  { loc: `${baseUrl}/en/blog`, priority: '0.9', changefreq: 'daily' },
  { loc: `${baseUrl}/en/about`, priority: '0.6', changefreq: 'monthly' },
  { loc: `${baseUrl}/en/browse/categories`, priority: '0.8', changefreq: 'weekly' },
  { loc: `${baseUrl}/en/browse/regions`, priority: '0.8', changefreq: 'weekly' },
];

// Articles de blog - HAUTE PRIORITÉ
const blogArticlesFR = [
  { loc: `${baseUrl}/blogue/comment-reclamer-fiche-entreprise`, date: '2025-11-01', priority: '0.85' },
  { loc: `${baseUrl}/blogue/neq-quebec-tout-savoir-numero-entreprise`, date: '2025-11-01', priority: '0.85' },
  { loc: `${baseUrl}/blogue/top-10-restaurants-montreal`, date: '2025-11-01', priority: '0.85' },
];

const blogArticlesEN = [
  { loc: `${baseUrl}/en/blog/comment-reclamer-fiche-entreprise`, date: '2025-11-01', priority: '0.85' },
  { loc: `${baseUrl}/en/blog/neq-quebec-tout-savoir-numero-entreprise`, date: '2025-11-01', priority: '0.85' },
  { loc: `${baseUrl}/en/blog/top-10-restaurants-montreal`, date: '2025-11-01', priority: '0.85' },
];

function generateStaticSitemap(urls, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.date || currentDate}</lastmod>
    <changefreq>${url.changefreq || 'monthly'}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const filepath = path.join(sitemapsDir, filename);
  fs.writeFileSync(filepath, xml, 'utf-8');
  console.log(`✅ ${filename} créé (${urls.length} URLs)`);
}

// Générer les sitemaps statiques
const allStaticFR = [...staticPagesFR, ...blogArticlesFR];
const allStaticEN = [...staticPagesEN, ...blogArticlesEN];

generateStaticSitemap(allStaticFR, 'sitemap-static.xml');
generateStaticSitemap(allStaticEN, 'sitemap-static-en.xml');

console.log('\n═'.repeat(60));
console.log('✅ SITEMAPS STATIQUES MIS À JOUR!');
console.log(`📝 Articles de blog ajoutés avec priorité 0.85`);
console.log(`📅 Date: ${currentDate}`);
console.log('═'.repeat(60));
