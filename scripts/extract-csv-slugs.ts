import * as fs from 'fs';

// Extract all business slugs from the CSV (pages with traffic)
const csvPath = '/Users/sebastienross/quebec-business-next/registreduquebec.com_PageTrafficReport_2026-01-21 (1).csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

const slugs = new Set<string>();

for (const line of lines) {
  // Match /entreprise/[slug] pattern
  const entrepriseMatch = line.match(/\/entreprise\/([a-z0-9-]+)/);
  if (entrepriseMatch) {
    slugs.add(entrepriseMatch[1]);
  }

  // Match /category/city/slug pattern (last segment is the slug)
  const categoryMatch = line.match(/registreduquebec\.com\/[a-z-]+\/[a-z-]+\/([a-z0-9-]+)"/);
  if (categoryMatch && !line.includes('/en/') && !line.includes('/blogue/')) {
    slugs.add(categoryMatch[1]);
  }

  // Match EN /en/category/city/slug or /en/company/slug
  const enMatch = line.match(/\/en\/[a-z-]+\/[a-z-]+\/([a-z0-9-]+)"/);
  if (enMatch) {
    slugs.add(enMatch[1]);
  }

  const enCompanyMatch = line.match(/\/en\/company\/([a-z0-9-]+)/);
  if (enCompanyMatch) {
    slugs.add(enCompanyMatch[1]);
  }
}

// Save to JSON
const output = {
  description: "Slugs avec trafic - provenant du CSV Google Search Console (à garder même sans site web)",
  created_at: new Date().toISOString().split('T')[0],
  total: slugs.size,
  slugs: Array.from(slugs).sort()
};

fs.writeFileSync('data/traffic-slugs.json', JSON.stringify(output, null, 2));
console.log(`✅ ${slugs.size} slugs avec trafic exportés vers data/traffic-slugs.json`);
