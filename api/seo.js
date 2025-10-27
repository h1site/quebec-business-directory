import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Load fresh template each time (DO NOT CACHE - causes canonical URL bug)
async function loadTemplate() {
  const templatePath = path.join(process.cwd(), 'dist/index.html');
  const template = await fs.readFile(templatePath, 'utf-8');
  return template;
}

// Generate Schema.org JSON-LD
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

  if (business.rating && business.review_count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.review_count
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
    const { slug, categorySlug, citySlug } = req.query;

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

    // Generate SEO content
    const title = `${business.name} - ${business.city} | Registre du Québec`;

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
      // Generate description ensuring minimum 70 characters
      const baseDesc = `Une belle entreprise ${business.name} à ${business.city || 'Québec'} au Québec`;

      if (baseDesc.length >= 70) {
        // Already long enough
        description = baseDesc;
      } else {
        // Add info to reach 70 characters
        if (business.address) {
          description = `${baseDesc}. Adresse: ${business.address}`;
        } else if (business.phone) {
          description = `${baseDesc}. Téléphone: ${business.phone}`;
        } else {
          description = `${baseDesc}. Découvrez cette entreprise québécoise`;
        }
      }
    }

    // IMPORTANT: Use the URL slug from the request, not params
    const canonical = `https://registreduquebec.com/${categorySlug}/${citySlug}/${slug}`;
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

    const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="business.business">
    <meta property="og:locale" content="fr_CA">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">

    <script type="application/ld+json">
    ${JSON.stringify(schemaOrg, null, 2)}
    </script>`;

    html = html.replace('</head>', `${canonicalTag}\n${seoTags}\n</head>`);

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
