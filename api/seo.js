import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Cache the HTML template (safe to cache - we modify a copy for each request)
let htmlTemplateCache = null;
async function loadTemplate() {
  if (!htmlTemplateCache) {
    const templatePath = path.join(process.cwd(), 'dist/index.html');
    htmlTemplateCache = await fs.readFile(templatePath, 'utf-8');
  }
  return htmlTemplateCache; // Return cached template (we modify a copy)
}

// Generate Schema.org JSON-LD with enhanced data
function generateSchemaOrg(business) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description || `${business.name} à ${business.city}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address || "",
      "addressLocality": business.city || "",
      "addressRegion": "QC",
      "postalCode": business.postal_code || "",
      "addressCountry": "CA"
    }
  };

  if (business.phone) schema.telephone = business.phone;
  if (business.website) schema.url = business.website;
  if (business.email) schema.email = business.email;
  if (business.logo_url) schema.image = business.logo_url;

  // Geographic coordinates for better local SEO
  if (business.latitude && business.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": business.latitude,
      "longitude": business.longitude
    };
  }

  // Ratings for rich snippets
  if (business.google_rating && business.google_reviews_count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": business.google_rating,
      "reviewCount": business.google_reviews_count,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  return schema;
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Main serverless function handler
export default async function handler(req, res) {
  // CRITICAL: Disable ALL caching - each business page MUST be unique!
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Vary', '*');

  try {
    const { slug, categorySlug, citySlug, lang } = req.query;

    // Detect language from query parameter or default to French
    const isEnglish = lang === 'en';
    const locale = isEnglish ? 'en_CA' : 'fr_CA';

    // If no slug, return default template
    if (!slug) {
      const template = await loadTemplate();
      return res.status(200).setHeader('Content-Type', 'text/html').send(template);
    }

    // Fetch business from Supabase
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !business) {
      return res.status(404).send('Entreprise non trouvée');
    }

    // Generate SEO content (bilingual)
    const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';
    const title = `${business.name} - ${business.city} | ${siteName}`;

    // Generate optimized meta description
    let description;
    if (business.description && business.description.length > 10) {
      // Use first 150 characters of description
      description = business.description.substring(0, 150);
      // Cut at last complete word to avoid cutting mid-word
      const lastSpace = description.lastIndexOf(' ');
      if (lastSpace > 100) {
        description = description.substring(0, lastSpace) + '...';
      }
    } else {
      // Generate SEO-optimized description with category info
      const category = isEnglish
        ? (business.primary_main_category_en || business.categories?.[0] || '')
        : (business.primary_main_category_fr || business.categories?.[0] || '');

      const locationText = isEnglish
        ? `in ${business.city || 'Quebec'}, Quebec`
        : `à ${business.city || 'Québec'}, Québec`;

      const baseDesc = category
        ? `${business.name} - ${category} ${locationText}`
        : `${business.name} ${locationText}`;

      if (baseDesc.length >= 70) {
        description = baseDesc;
      } else {
        // Add contact info to reach 70 characters
        const phoneLabel = isEnglish ? 'Phone' : 'Téléphone';
        const findMoreText = isEnglish
          ? `Find all contact details on ${siteName}`
          : `Trouvez toutes les coordonnées sur ${siteName}`;

        if (business.phone) {
          description = `${baseDesc}. ${phoneLabel}: ${business.phone}`;
        } else if (business.address) {
          description = `${baseDesc}. ${business.address}`;
        } else {
          description = `${baseDesc}. ${findMoreText}`;
        }
      }
    }

    // IMPORTANT: Generate correct canonical URL from business data (not URL params)
    // URL params (categorySlug/citySlug) can be wrong/missing, so we rebuild from business data
    const correctCategorySlug = business.main_category_slug || business.primary_main_category_slug || 'entreprise';
    const correctCitySlug = business.city
      ? business.city.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with hyphens
          .replace(/^-+|-+$/g, '')          // Remove leading/trailing hyphens
      : 'quebec';

    const langPrefix = isEnglish ? '/en' : '';
    const canonical = `https://registreduquebec.com${langPrefix}/${correctCategorySlug}/${correctCitySlug}/${slug}`;
    const schemaOrg = generateSchemaOrg(business);

    // Generate unique ETag for this specific business page
    const etag = `"${slug}-${business.id}-${Date.now()}"`;
    res.setHeader('ETag', etag);

    // CRITICAL: Load fresh template for each request
    let html = await loadTemplate();

    // STEP 1: Replace default meta tags with business-specific ones
    html = html
      .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content=".*?"[^>]*>/i,
        `<meta name="description" content="${escapeHtml(description)}" />`
      );

    // STEP 2: Remove ALL default Open Graph and Twitter tags
    html = html
      .replace(/<meta property="og:type" content="website"[^>]*>/gi, '')
      .replace(/<meta property="og:url" content="https:\/\/registreduquebec\.com\/"[^>]*>/gi, '')
      .replace(/<meta property="og:title" content="[^"]*Annuaire officiel"[^>]*>/gi, '')
      .replace(/<meta property="og:description" content="[^"]*Annuaire officiel[^"]*"[^>]*>/gi, '')
      .replace(/<meta name="twitter:title" content="[^"]*"[^>]*>/gi, '')
      .replace(/<meta name="twitter:description" content="[^"]*Annuaire officiel[^"]*"[^>]*>/gi, '');

    // STEP 3: Remove existing canonical
    html = html.replace(/<link rel="canonical"[^>]*>/gi, '');

    // STEP 4: Inject new canonical and business-specific SEO tags
    const canonicalTag = `    <link rel="canonical" href="${canonical}">`;

    // Use business logo if available, otherwise use default OG image
    const defaultOgImage = isEnglish
      ? 'https://registreduquebec.com/og-default-en.svg'
      : 'https://registreduquebec.com/og-default.svg';
    const ogImage = business.logo_url || defaultOgImage;

    const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="business.business">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="${business.logo_url ? 'image/jpeg' : 'image/svg+xml'}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${ogImage}">

    <script type="application/ld+json">
    ${JSON.stringify(schemaOrg, null, 2)}
    </script>`;

    // Add hreflang tags for bilingual support
    // IMPORTANT: Use correct slugs from business data (not URL params which might be wrong)
    const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/${correctCategorySlug}/${correctCitySlug}/${slug}" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/${correctCategorySlug}/${correctCitySlug}/${slug}" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/${correctCategorySlug}/${correctCitySlug}/${slug}" />`;

    html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n</head>`);

    // Add initial data for client
    const dataScript = `
    <script>
    window.__INITIAL_BUSINESS_DATA__ = ${JSON.stringify(business)};
    </script>`;

    html = html.replace('</body>', `${dataScript}\n</body>`);

    res.status(200).setHeader('Content-Type', 'text/html').send(html);
  } catch (error) {
    console.error('SEO function error:', error);
    res.status(500).send('Erreur serveur');
  }
}
