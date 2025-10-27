import express from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.SSR_PORT || 3000;

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Load HTML template
let htmlTemplate = '';
async function loadTemplate() {
  htmlTemplate = await fs.readFile(join(__dirname, 'dist/index.html'), 'utf-8');
}

// Serve static files from dist
app.use(express.static('dist'));

// Generate Schema.org JSON-LD for business
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

  if (business.phone) {
    schema.telephone = business.phone;
  }

  if (business.website) {
    schema.url = business.website;
  }

  if (business.email) {
    schema.email = business.email;
  }

  // Add aggregateRating if available
  if (business.rating && business.review_count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.review_count
    };
  }

  return schema;
}

// Helper to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Route handler for business pages
app.get('/:categorySlug/:citySlug/:businessSlug', async (req, res) => {
  try {
    const { businessSlug } = req.params;

    // Fetch business from Supabase
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', businessSlug)
      .single();

    if (error || !business) {
      return res.status(404).send('Entreprise non trouvée');
    }

    // Generate meta tags
    const title = `${business.name} - ${business.city} | Registre du Québec`;
    const description = business.description
      ? business.description.substring(0, 160)
      : `${business.name} à ${business.city}. Téléphone, adresse et informations complètes. ${business.phone || ''} ${business.website || ''}`;

    const canonical = `https://registreduquebec.com/${req.params.categorySlug}/${req.params.citySlug}/${businessSlug}`;

    // Generate Schema.org
    const schemaOrg = generateSchemaOrg(business);

    // Inject into HTML template
    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content=".*?">/,
        `<meta name="description" content="${escapeHtml(description)}">`
      )
      .replace(
        /<link rel="canonical" href=".*?">/,
        `<link rel="canonical" href="${canonical}">`
      );

    // Add Open Graph tags
    const ogTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="business.business">
    <meta property="og:locale" content="fr_CA">`;

    // Add Schema.org JSON-LD
    const schemaScript = `
    <script type="application/ld+json">
    ${JSON.stringify(schemaOrg, null, 2)}
    </script>`;

    // Inject before </head>
    html = html.replace('<!--app-head-->', `${ogTags}\n${schemaScript}`);

    // Inject initial data for client-side React
    const initialDataScript = `
    <script>
    window.__INITIAL_BUSINESS_DATA__ = ${JSON.stringify(business)};
    </script>`;

    // Inject before </body>
    html = html.replace('</body>', `${initialDataScript}\n</body>`);

    res.send(html);
  } catch (error) {
    console.error('Error rendering business page:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route handler for city pages
app.get('/ville/:citySlug', async (req, res) => {
  try {
    const { citySlug } = req.params;

    // Count businesses in this city
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .ilike('city', citySlug.replace(/-/g, ' '));

    const cityName = citySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const title = `Entreprises à ${cityName} | Registre du Québec`;
    const description = `Découvrez ${count || 'les'} entreprises à ${cityName}. Annuaire complet avec coordonnées, avis et informations détaillées.`;
    const canonical = `https://registreduquebec.com/ville/${citySlug}`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content=".*?">/,
        `<meta name="description" content="${escapeHtml(description)}">`
      )
      .replace(
        /<link rel="canonical" href=".*?">/,
        `<link rel="canonical" href="${canonical}">`
      );

    res.send(html);
  } catch (error) {
    console.error('Error rendering city page:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Route handler for category pages
app.get('/categorie/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;

    const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const title = `${categoryName} au Québec | Registre du Québec`;
    const description = `Trouvez les meilleures entreprises de ${categoryName} au Québec. Annuaire complet avec avis, coordonnées et informations.`;
    const canonical = `https://registreduquebec.com/categorie/${categorySlug}`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description" content=".*?">/,
        `<meta name="description" content="${escapeHtml(description)}">`
      )
      .replace(
        /<link rel="canonical" href=".*?">/,
        `<link rel="canonical" href="${canonical}">`
      );

    res.send(html);
  } catch (error) {
    console.error('Error rendering category page:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Fallback for all other routes - serve the SPA
app.get('*', async (req, res) => {
  res.send(htmlTemplate);
});

// Start server
async function startServer() {
  try {
    await loadTemplate();
    app.listen(PORT, () => {
      console.log(`\n✅ SEO Server running on http://localhost:${PORT}`);
      console.log(`📍 Dynamic SSR enabled for business pages`);
      console.log(`🔍 Google-ready with Schema.org structured data\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
