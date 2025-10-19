import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all businesses
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }

    // Fetch all main categories
    const { data: mainCategories, error: catError } = await supabase
      .from('main_categories')
      .select('slug, updated_at');

    if (catError) {
      console.error('Error fetching categories:', catError);
      throw catError;
    }

    // Base URL - use the domain from the request or fallback
    const baseUrl = process.env.VITE_SITE_URL || 'https://registreduquebec.com';

    // Build sitemap XML
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
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
`;

    // Add category pages
    if (mainCategories && mainCategories.length > 0) {
      mainCategories.forEach(category => {
        sitemap += `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${category.updated_at || currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      });
    }

    // Add business pages
    if (businesses && businesses.length > 0) {
      businesses.forEach(business => {
        const lastmod = business.updated_at ? new Date(business.updated_at).toISOString() : currentDate;
        sitemap += `  <url>
    <loc>${baseUrl}/business/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      });
    }

    sitemap += `</urlset>`;

    // Set headers for XML response
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}
