import fs from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser();

async function extractURLsFromSitemap(filepath) {
  const xml = await fs.readFile(filepath, 'utf-8');
  const result = parser.parse(xml);

  const urls = [];

  if (result.urlset && result.urlset.url) {
    const urlEntries = Array.isArray(result.urlset.url) ? result.urlset.url : [result.urlset.url];
    urlEntries.forEach(entry => {
      if (entry.loc) {
        urls.push(entry.loc);
      }
    });
  }

  return urls;
}

async function extractAllURLs() {
  console.log('\n📊 Extraction de toutes les URLs des sitemaps...\n');

  const allUrls = [];

  // Extract from static sitemap
  try {
    const staticUrls = await extractURLsFromSitemap('public/sitemaps/sitemap-static.xml');
    allUrls.push(...staticUrls);
    console.log(`✅ sitemap-static.xml: ${staticUrls.length} URLs`);
  } catch (e) {
    console.log(`⚠️  sitemap-static.xml: erreur`);
  }

  // Extract from business sitemaps
  for (let i = 1; i <= 97; i++) {
    try {
      const urls = await extractURLsFromSitemap(`public/sitemaps/sitemap-businesses-${i}.xml`);
      if (urls.length > 0) {
        allUrls.push(...urls);
        console.log(`✅ sitemap-businesses-${i}.xml: ${urls.length} URLs`);
      }
    } catch (e) {
      // File doesn't exist or is empty, skip
    }
  }

  console.log(`\n📝 Total: ${allUrls.length.toLocaleString()} URLs\n`);

  // Write to file
  await fs.writeFile('all-urls.txt', allUrls.join('\n'), 'utf-8');
  console.log('✅ Fichier créé: all-urls.txt');
  console.log('\n💡 Importez ce fichier dans Screaming Frog:');
  console.log('   Mode > List > Import all-urls.txt\n');
}

extractAllURLs().then(() => process.exit(0));
