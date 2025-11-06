import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Redirect short business URLs to full URLs with city
 *
 * Handles:
 * - /entreprise/slug → 301 → /entreprise/ville/slug
 * - /categorie/slug → 301 → /categorie/ville/slug
 * - /en/entreprise/slug → 301 → /en/entreprise/ville/slug
 * - /en/category/slug → 301 → /en/category/ville/slug
 */
export default async function handler(req, res) {
  try {
    const { slug, prefix, lang } = req.query;

    if (!slug) {
      return res.status(400).send('Missing slug parameter');
    }

    // Fetch business from database
    const { data: business, error } = await supabase
      .from('businesses')
      .select('slug, city, main_category_slug')
      .eq('slug', slug)
      .single();

    if (error || !business) {
      // Business not found - return 404
      return res.status(404).send('Entreprise non trouvée / Business not found');
    }

    // Normalize city to slug format
    const citySlug = business.city
      ? business.city.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
          .replace(/^-+|-+$/g, '')          // Remove leading/trailing hyphens
      : 'quebec';

    // Determine category slug (use main_category_slug or fallback to 'entreprise')
    const categorySlug = business.main_category_slug || 'entreprise';

    // Build redirect URL
    const isEnglish = lang === 'en';
    const langPrefix = isEnglish ? '/en' : '';

    // Determine the prefix to use
    let urlPrefix = prefix || categorySlug;

    // For English, translate 'entreprise' to 'entreprise' (keep same)
    // and 'categorie' stays as category slug
    if (isEnglish && urlPrefix === 'entreprise') {
      urlPrefix = 'entreprise';
    }

    const redirectUrl = `${langPrefix}/${urlPrefix}/${citySlug}/${slug}`;

    console.log(`Redirecting short URL: /${prefix || categorySlug}/${slug} → ${redirectUrl}`);

    // 301 Permanent Redirect
    res.setHeader('Location', redirectUrl);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache 1 year
    return res.status(301).send('');

  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).send('Server error');
  }
}
