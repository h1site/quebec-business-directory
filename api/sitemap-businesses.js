import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const URLS_PER_SITEMAP = 45000;

export default async function handler(req, res) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const baseUrl = 'https://registreduquebec.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Get page number from query (default to 1)
    const page = parseInt(req.query.page || '1');

    // Calculate offset
    const offset = (page - 1) * URLS_PER_SITEMAP;

    // Fetch businesses for this page using pagination with range
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .order('id')
      .range(offset, offset + URLS_PER_SITEMAP - 1);

    if (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }

    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ error: 'No businesses found for this page' });
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Add business pages
    businesses.forEach(business => {
      const lastmod = business.updated_at ? new Date(business.updated_at).toISOString().split('T')[0] : currentDate;
      sitemap += `  <url>
    <loc>${baseUrl}/entreprise/${business.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 24 hours
    res.status(200).send(sitemap);

  } catch (error) {
    console.error('Error generating business sitemap:', error);
    res.status(500).json({ error: 'Failed to generate business sitemap' });
  }
}
