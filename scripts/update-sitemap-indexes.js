/**
 * Met à jour les fichiers d'index sitemap avec la date actuelle
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🗺️  MISE À JOUR DES INDEX SITEMAPS');
console.log('═'.repeat(60));

const baseUrl = 'https://registreduquebec.com';
const currentDate = '2025-11-24';
const sitemapsDir = path.join(__dirname, '..', 'public', 'sitemaps');
const publicDir = path.join(__dirname, '..', 'public');

// Générer l'index FR
const frFiles = fs.readdirSync(sitemapsDir)
  .filter(f => f.startsWith('sitemap-businesses-') && !f.includes('-en-') && f.endsWith('.xml'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

frFiles.unshift('sitemap-static.xml'); // Ajouter le sitemap statique en premier

const frIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${frFiles.map(file => `  <sitemap>
    <loc>${baseUrl}/sitemaps/${file}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

fs.writeFileSync(path.join(publicDir, 'sitemap-fr.xml'), frIndexXML, 'utf-8');
console.log(`✅ sitemap-fr.xml mis à jour (${frFiles.length} sitemaps)`);

// Générer l'index EN
const enFiles = fs.readdirSync(sitemapsDir)
  .filter(f => f.startsWith('sitemap-businesses-en-') && f.endsWith('.xml'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

enFiles.unshift('sitemap-static-en.xml'); // Ajouter le sitemap statique en premier

const enIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${enFiles.map(file => `  <sitemap>
    <loc>${baseUrl}/sitemaps/${file}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

fs.writeFileSync(path.join(publicDir, 'sitemap-en.xml'), enIndexXML, 'utf-8');
console.log(`✅ sitemap-en.xml mis à jour (${enFiles.length} sitemaps)`);

// Générer l'index principal
const mainIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-fr.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-en.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), mainIndexXML, 'utf-8');
console.log(`✅ sitemap.xml mis à jour (index principal)`);

console.log('\n═'.repeat(60));
console.log('✅ TOUS LES INDEX SITEMAPS SONT À JOUR!');
console.log(`📅 Date: ${currentDate}`);
console.log('═'.repeat(60));
