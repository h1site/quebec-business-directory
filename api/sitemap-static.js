import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const baseUrl = 'https://registreduquebec.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Fetch main categories
    const { data: mainCategories } = await supabase
      .from('main_categories')
      .select('slug, updated_at');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- About page -->
  <url>
    <loc>${baseUrl}/a-propos</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- Search page -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Browse categories page -->
  <url>
    <loc>${baseUrl}/browse/categories</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Browse regions page -->
  <url>
    <loc>${baseUrl}/browse/regions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Claim business page -->
  <url>
    <loc>${baseUrl}/claim</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Create business page -->
  <url>
    <loc>${baseUrl}/create-business</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

    // Add category pages
    if (mainCategories && mainCategories.length > 0) {
      mainCategories.forEach(category => {
        const lastmod = category.updated_at ? new Date(category.updated_at).toISOString().split('T')[0] : currentDate;
        sitemap += `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
    }

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 24 hours
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating static sitemap:', error);
    res.status(500).json({ error: 'Failed to generate static sitemap' });
  }
}
