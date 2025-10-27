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
      // Engaging fallback description (ensure min 70 characters for SEO)
      description = `Une belle entreprise ${business.name} à ${business.city || 'Québec'} au Québec`;

      // Ensure minimum 70 characters by adding contact info if needed
      if (description.length < 70) {
        if (business.phone) {
          description += `. Téléphone: ${business.phone}`;
        } else if (business.address) {
          description += `. ${business.address}`;
        } else {
          description += `. Découvrez cette entreprise québécoise dans notre répertoire complet`;
        }
      }
    }

    const canonical = `https://registreduquebec.com/${categorySlug}/${citySlug}/${slug}`;
    const schemaOrg = generateSchemaOrg(business);

    // Load and modify template
    const template = await loadTemplate();

    let html = template
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content=".*?"[^>]*>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
      );

    // Replace or inject canonical URL - IMPORTANT FIX!
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(
        /<link rel="canonical" href="[^"]*"[^>]*>/,
        `<link rel="canonical" href="${canonical}">`
      );
    } else {
      // Inject canonical if not present
      html = html.replace('</head>', `    <link rel="canonical" href="${canonical}">\n</head>`);
    }

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
