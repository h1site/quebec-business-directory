#!/bin/bash

echo "🚀 Génération complète des sitemaps français par tranches de 40k"
echo "Total attendu: ~480k entreprises"
echo ""

# Générer par tranches de 40k pour éviter les timeouts
node scripts/generate-sitemap-fr-batch.js 0 40000
node scripts/generate-sitemap-fr-batch.js 40000 80000
node scripts/generate-sitemap-fr-batch.js 80000 120000
node scripts/generate-sitemap-fr-batch.js 120000 160000
node scripts/generate-sitemap-fr-batch.js 160000 200000
node scripts/generate-sitemap-fr-batch.js 200000 240000
node scripts/generate-sitemap-fr-batch.js 240000 280000
node scripts/generate-sitemap-fr-batch.js 280000 320000
node scripts/generate-sitemap-fr-batch.js 320000 360000
node scripts/generate-sitemap-fr-batch.js 360000 400000
node scripts/generate-sitemap-fr-batch.js 400000 440000
node scripts/generate-sitemap-fr-batch.js 440000 480000
node scripts/generate-sitemap-fr-batch.js 480000 520000

echo ""
echo "✅ Toutes les tranches générées!"
echo ""
echo "Génération du fichier sitemap-fr.xml index..."

# Update sitemap index
node -e "
import fs from 'fs/promises';

const files = [];
for (let i = 1; i <= 97; i++) {
  files.push(\`sitemap-businesses-\${i}.xml\`);
}

const currentDate = new Date().toISOString().split('T')[0];
const sitemapIndex = \`<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">
  <sitemap>
    <loc>https://registreduquebec.com/sitemaps/sitemap-static.xml</loc>
    <lastmod>\${currentDate}</lastmod>
  </sitemap>
\${files.map(file => \`  <sitemap>
    <loc>https://registreduquebec.com/sitemaps/\${file}</loc>
    <lastmod>\${currentDate}</lastmod>
  </sitemap>\`).join('\n')}
</sitemapindex>\`;

await fs.writeFile('public/sitemap-fr.xml', sitemapIndex, 'utf-8');
console.log('✅ sitemap-fr.xml créé avec ' + files.length + ' fichiers');
"

echo ""
echo "🎉 Génération complète terminée!"
