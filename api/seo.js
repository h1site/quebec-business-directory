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

    // CRITICAL: Load fresh template for each request
    const template = await loadTemplate();

    // Replace title and description
    let html = template
      .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content=".*?"[^>]*>/i,
        `<meta name="description" content="${escapeHtml(description)}" />`
      );

    // Replace or remove existing canonical, then inject the correct one
    // Remove any existing canonical first
    html = html.replace(/<link rel="canonical"[^>]*>/gi, '');

    // Inject new canonical before </head>
    const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
    html = html.replace('</head>', `${canonicalTag}\n</head>`);

    // Add Open Graph and Schema.org
    const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="business.business">
    <meta property="og:locale" content="fr_CA">

    <script type="application/ld+json">
    ${JSON.stringify(schemaOrg, null, 2)}
    </script>`;

    html = html.replace('</head>', `${seoTags}\n</head>`);

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
