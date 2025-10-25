export default async function handler(req, res) {
  try {
    const baseUrl = 'https://registreduquebec.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Calculate number of business sitemaps needed (480,168 businesses / 10,000 per file = ~48 files)
    const totalBusinesses = 480168;
    const urlsPerSitemap = 10000;
    const numBusinessSitemaps = Math.ceil(totalBusinesses / urlsPerSitemap);

    let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages sitemap -->
  <sitemap>
    <loc>${baseUrl}/api/sitemap-static</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;

    // Add business sitemaps
    for (let i = 1; i <= numBusinessSitemaps; i++) {
      sitemapIndex += `  <sitemap>
    <loc>${baseUrl}/api/sitemap-businesses?page=${i}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
`;
    }

    sitemapIndex += `</sitemapindex>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 24 hours
    res.status(200).send(sitemapIndex);

  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).json({ error: 'Failed to generate sitemap index' });
  }
}
