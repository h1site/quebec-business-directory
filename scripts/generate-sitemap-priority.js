/**
 * Génère un sitemap spécifique pour les pages à haute performance (CSV)
 * avec des priorités basées sur le nombre de clics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗺️  GÉNÉRATION SITEMAP DES PAGES À HAUTE PERFORMANCE');
console.log('═'.repeat(60));

const baseUrl = 'https://registreduquebec.com';
const currentDate = '2025-11-24';
const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');

// Lire le fichier CSV
const csvPath = path.join(__dirname, '..', 'Pages.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parser le CSV (skip header)
const lines = csvContent.split('\n').slice(1).filter(line => line.trim());

const pages = lines.map(line => {
  const parts = line.split(',');
  const url = parts[0];
  const clicks = parseInt(parts[1]) || 0;
  const impressions = parseInt(parts[2]) || 0;

  return { url, clicks, impressions };
}).filter(page => page.url && page.url.startsWith('http'));

console.log(`📊 ${pages.length} pages trouvées dans le CSV`);

// Fonction pour calculer la priorité basée sur les clics
function calculatePriority(clicks) {
  if (clicks >= 50) return '0.95';
  if (clicks >= 20) return '0.90';
  if (clicks >= 10) return '0.85';
  if (clicks >= 5) return '0.80';
  if (clicks >= 3) return '0.75';
  if (clicks >= 2) return '0.70';
  return '0.65';
}

// Fonction pour déterminer changefreq basé sur les clics
function calculateChangefreq(clicks) {
  if (clicks >= 10) return 'weekly';
  if (clicks >= 5) return 'weekly';
  return 'monthly';
}

// Générer les entrées du sitemap
const urlEntries = pages.map(page => ({
  loc: page.url,
  lastmod: currentDate,
  changefreq: calculateChangefreq(page.clicks),
  priority: calculatePriority(page.clicks),
  clicks: page.clicks,
  impressions: page.impressions
}));

// Trier par nombre de clics (décroissant)
urlEntries.sort((a, b) => b.clicks - a.clicks);

// Générer le XML
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap des pages à haute performance -->
  <!-- Généré le ${currentDate} -->
  <!-- ${urlEntries.length} pages avec des données de clics -->
${urlEntries.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    <!-- Clics: ${url.clicks}, Impressions: ${url.impressions} -->
  </url>`).join('\n')}
</urlset>`;

// Écrire le fichier
const filepath = path.join(sitemapsDir, 'sitemap-high-performance.xml');
fs.writeFileSync(filepath, xml, 'utf-8');

console.log(`\n✅ Sitemap créé: sitemap-high-performance.xml`);
console.log(`📝 ${urlEntries.length} URLs avec priorités dynamiques`);
console.log(`\n📊 Répartition des priorités:`);

const priorityGroups = {
  '0.95': urlEntries.filter(u => u.priority === '0.95').length,
  '0.90': urlEntries.filter(u => u.priority === '0.90').length,
  '0.85': urlEntries.filter(u => u.priority === '0.85').length,
  '0.80': urlEntries.filter(u => u.priority === '0.80').length,
  '0.75': urlEntries.filter(u => u.priority === '0.75').length,
  '0.70': urlEntries.filter(u => u.priority === '0.70').length,
  '0.65': urlEntries.filter(u => u.priority === '0.65').length,
};

Object.entries(priorityGroups).forEach(([priority, count]) => {
  if (count > 0) {
    console.log(`   Priorité ${priority}: ${count} pages`);
  }
});

console.log('\n═'.repeat(60));
console.log('✅ SITEMAP DES PAGES À HAUTE PERFORMANCE GÉNÉRÉ!');
console.log(`📅 Date: ${currentDate}`);
console.log('═'.repeat(60));
