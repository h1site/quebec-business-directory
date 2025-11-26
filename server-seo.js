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
  // Build step renames the SPA entry to spa.html (index.html is only used by SSR).
  // Load that file to ensure the SSR server keeps working after each deploy.
  htmlTemplate = await fs.readFile(join(__dirname, 'dist/spa.html'), 'utf-8');
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
    const { categorySlug, citySlug, businessSlug } = req.params;

    // Skip SSR for protected/special routes - let React handle them
    const skipSSRRoutes = ['nouvelle', 'modifier', 'supprimer', 'admin', 'dashboard', 'connexion', 'inscription'];
    if (skipSSRRoutes.includes(citySlug) || skipSSRRoutes.includes(businessSlug)) {
      // Serve the SPA for these routes
      return res.send(htmlTemplate);
    }

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
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /bot|google|bing|slurp|duckduckgo|yandex/i.test(userAgent);

    // Only perform SSR for bots to optimize crawl budget
    if (isBot) {
      const page = parseInt(req.query.page) || 1;
      const limit = 100;
      const offset = (page - 1) * limit;

      // 1. Fetch category name
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('name')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !category) {
        // Fallback to client-side rendering if category not found
        return res.send(htmlTemplate);
      }
      const categoryName = category.name;

      // 2. Fetch paginated businesses and total count
      const { data: businesses, error: businessesError, count } = await supabase
        .from('businesses')
        .select('name, slug, city', { count: 'exact' })
        .eq('category', categorySlug)
        .range(offset, offset + limit - 1);

      if (businessesError) {
        console.error('Error fetching businesses for SSR:', businessesError);
        // Fallback to basic meta tag rendering on error
        return res.send(htmlTemplate.replace(/<title>.*<\/title>/, `<title>${escapeHtml(categoryName)}</title>`));
      }

      // 3. Generate HTML for the list of businesses
      let businessListHtml = `<h1>${escapeHtml(categoryName)}</h1>`;
      businessListHtml += '<ul>';
      for (const business of businesses) {
        const citySlug = (business.city || '').toLowerCase().replace(/ /g, '-');
        const businessUrl = `/${categorySlug}/${citySlug}/${business.slug}`;
        businessListHtml += `<li><a href="${businessUrl}">${escapeHtml(business.name)}</a></li>`;
      }
      businessListHtml += '</ul>';

      // 4. Generate pagination links
      let paginationHtml = '<div class="pagination" style="text-align:center; padding: 20px;">';
      if (page > 1) {
        paginationHtml += `<a href="/categorie/${categorySlug}?page=${page - 1}" style="margin-right:20px;">&laquo; Page Précédente</a>`;
      }
      if (count > offset + limit) {
        paginationHtml += `<a href="/categorie/${categorySlug}?page=${page + 1}">Page Suivante &raquo;</a>`;
      }
      paginationHtml += '</div>';

      // 5. Inject SSR content into the template
      const ssrContent = businessListHtml + paginationHtml;
      // We replace the empty root div with our server-rendered content
      let html = htmlTemplate.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

      // 6. Update meta tags for the paginated page
      const title = `${categoryName} au Québec | Page ${page} | Registre du Québec`;
      const description = `Liste des entreprises de ${categoryName} au Québec. Page ${page} sur ${Math.ceil(count / limit)}.`;
      const canonical = `https://registreduquebec.com/categorie/${categorySlug}` + (page > 1 ? `?page=${page}` : '');

      html = html
        .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
        .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
        .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`);
        
      // 7. Add prev/next link tags for pagination SEO
      let paginationLinks = '';
      if (page > 1) {
          paginationLinks += `\n<link rel="prev" href="https://registreduquebec.com/categorie/${categorySlug}?page=${page - 1}">`;
      }
      if (count > offset + limit) {
          paginationLinks += `\n<link rel="next" href="https://registreduquebec.com/categorie/${categorySlug}?page=${page + 1}">`;
      }
      html = html.replace('<!--app-head-->', paginationLinks);


      return res.send(html);
    }

    // --- Fallback for non-bots (existing behavior) ---
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

// Homepage SSR - Critical for Google indexing
app.get('/', async (req, res) => {
  try {
    // Fetch stats
    const { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    // Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug')
      .limit(20);

    // Fetch popular cities
    const popularCities = [
      { name: 'Montréal', slug: 'montreal' },
      { name: 'Québec', slug: 'quebec' },
      { name: 'Laval', slug: 'laval' },
      { name: 'Gatineau', slug: 'gatineau' },
      { name: 'Longueuil', slug: 'longueuil' },
      { name: 'Sherbrooke', slug: 'sherbrooke' },
      { name: 'Saguenay', slug: 'saguenay' },
      { name: 'Lévis', slug: 'levis' },
      { name: 'Trois-Rivières', slug: 'trois-rivieres' },
      { name: 'Terrebonne', slug: 'terrebonne' }
    ];

    // Fetch some recent businesses for internal links
    const { data: recentBusinesses } = await supabase
      .from('businesses')
      .select('name, slug, city, main_category_slug')
      .not('main_category_slug', 'is', null)
      .limit(20);

    const title = 'Registre des entreprises du Québec - Annuaire de plus de 600 000 entreprises';
    const description = 'Trouvez facilement parmi plus de 600 000 entreprises québécoises. Annuaire complet avec coordonnées, avis et informations détaillées pour Montréal, Québec, Laval et toutes les régions.';
    const canonical = 'https://registreduquebec.com/';

    // Build SSR content
    let ssrContent = `
    <div class="ssr-homepage" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <header style="text-align: center; margin-bottom: 3rem;">
        <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 1rem;">Registre des entreprises du Québec</h1>
        <p style="font-size: 1.25rem; color: #4a5568;">Plus de ${(totalBusinesses || 600000).toLocaleString('fr-CA')} entreprises québécoises répertoriées</p>
      </header>

      <section style="margin-bottom: 3rem;">
        <h2 style="font-size: 1.75rem; color: #2d3748; margin-bottom: 1.5rem;">Parcourir par catégorie</h2>
        <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; list-style: none; padding: 0;">
          ${(categories || []).map(cat => `
            <li><a href="/categorie/${cat.slug}" style="color: #2563eb; text-decoration: none;">${escapeHtml(cat.name)}</a></li>
          `).join('')}
        </ul>
        <p style="margin-top: 1rem;"><a href="/parcourir/categories" style="color: #2563eb;">Voir toutes les catégories →</a></p>
      </section>

      <section style="margin-bottom: 3rem;">
        <h2 style="font-size: 1.75rem; color: #2d3748; margin-bottom: 1.5rem;">Entreprises par ville</h2>
        <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; list-style: none; padding: 0;">
          ${popularCities.map(city => `
            <li><a href="/ville/${city.slug}" style="color: #2563eb; text-decoration: none;">Entreprises à ${escapeHtml(city.name)}</a></li>
          `).join('')}
        </ul>
        <p style="margin-top: 1rem;"><a href="/parcourir/regions" style="color: #2563eb;">Voir toutes les régions →</a></p>
      </section>

      <section style="margin-bottom: 3rem;">
        <h2 style="font-size: 1.75rem; color: #2d3748; margin-bottom: 1.5rem;">Entreprises récentes</h2>
        <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; list-style: none; padding: 0;">
          ${(recentBusinesses || []).map(b => {
            const citySlug = (b.city || '').toLowerCase().replace(/ /g, '-');
            return `<li><a href="/${b.main_category_slug}/${citySlug}/${b.slug}" style="color: #2563eb; text-decoration: none;">${escapeHtml(b.name)} - ${escapeHtml(b.city || '')}</a></li>`;
          }).join('')}
        </ul>
      </section>

      <section style="margin-bottom: 3rem;">
        <h2 style="font-size: 1.75rem; color: #2d3748; margin-bottom: 1rem;">À propos du Registre du Québec</h2>
        <p style="color: #4a5568; line-height: 1.8;">
          Le Registre des entreprises du Québec est l'annuaire le plus complet des entreprises québécoises.
          Que vous cherchiez un restaurant à Montréal, un plombier à Québec, ou un notaire à Laval,
          notre répertoire vous permet de trouver rapidement les coordonnées et informations de plus de 600 000 entreprises.
          Chaque fiche entreprise inclut l'adresse, le numéro de téléphone, le site web et le numéro NEQ (Numéro d'entreprise du Québec).
        </p>
      </section>

      <nav style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; color: #2d3748; margin-bottom: 1rem;">Navigation</h2>
        <ul style="list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 1.5rem;">
          <li><a href="/recherche" style="color: #2563eb;">Recherche d'entreprises</a></li>
          <li><a href="/blogue" style="color: #2563eb;">Blogue</a></li>
          <li><a href="/a-propos" style="color: #2563eb;">À propos</a></li>
          <li><a href="/parcourir/categories" style="color: #2563eb;">Catégories</a></li>
          <li><a href="/parcourir/regions" style="color: #2563eb;">Régions</a></li>
        </ul>
      </nav>
    </div>`;

    // Schema.org for Organization
    const schemaOrg = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Registre des entreprises du Québec",
      "url": "https://registreduquebec.com",
      "description": description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://registreduquebec.com/recherche?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
      .replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    // Add Schema.org
    const schemaScript = `<script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>`;
    html = html.replace('<!--app-head-->', schemaScript);

    res.send(html);
  } catch (error) {
    console.error('Error rendering homepage:', error);
    res.send(htmlTemplate);
  }
});

// Blog listing page SSR
app.get('/blogue', async (req, res) => {
  try {
    const title = 'Blogue - Registre des entreprises du Québec';
    const description = 'Articles et guides pour les entrepreneurs québécois. Conseils sur le NEQ, comment réclamer votre fiche entreprise, et plus encore.';
    const canonical = 'https://registreduquebec.com/blogue';

    const blogArticles = [
      { title: 'Comment réclamer votre fiche entreprise', slug: 'comment-reclamer-fiche-entreprise', excerpt: 'Guide étape par étape pour réclamer et gérer votre fiche entreprise sur le Registre du Québec.' },
      { title: 'NEQ Québec : Tout savoir sur le numéro d\'entreprise', slug: 'neq-quebec-tout-savoir-numero-entreprise', excerpt: 'Qu\'est-ce que le NEQ? Comment l\'obtenir? Tout ce que vous devez savoir sur le Numéro d\'entreprise du Québec.' },
      { title: 'Top 10 des restaurants à Montréal', slug: 'top-10-restaurants-montreal', excerpt: 'Découvrez les meilleurs restaurants de Montréal selon les avis et recommandations.' }
    ];

    let ssrContent = `
    <div class="ssr-blog" style="max-width: 900px; margin: 0 auto; padding: 2rem;">
      <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 2rem;">Blogue</h1>
      <p style="font-size: 1.1rem; color: #4a5568; margin-bottom: 2rem;">Articles et guides pour les entrepreneurs québécois</p>

      <div style="display: flex; flex-direction: column; gap: 2rem;">
        ${blogArticles.map(article => `
          <article style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem;">
            <h2 style="font-size: 1.5rem; margin-bottom: 0.75rem;">
              <a href="/blogue/${article.slug}" style="color: #2563eb; text-decoration: none;">${escapeHtml(article.title)}</a>
            </h2>
            <p style="color: #4a5568;">${escapeHtml(article.excerpt)}</p>
          </article>
        `).join('')}
      </div>

      <nav style="margin-top: 3rem;">
        <a href="/" style="color: #2563eb;">← Retour à l'accueil</a>
      </nav>
    </div>`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
      .replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    res.send(html);
  } catch (error) {
    console.error('Error rendering blog page:', error);
    res.send(htmlTemplate);
  }
});

// Search page SSR
app.get('/recherche', async (req, res) => {
  try {
    const title = 'Recherche d\'entreprises au Québec | Registre du Québec';
    const description = 'Recherchez parmi plus de 600 000 entreprises québécoises. Trouvez rapidement les coordonnées, adresses et informations des entreprises au Québec.';
    const canonical = 'https://registreduquebec.com/recherche';

    let ssrContent = `
    <div class="ssr-search" style="max-width: 900px; margin: 0 auto; padding: 2rem;">
      <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 1rem;">Recherche d'entreprises</h1>
      <p style="font-size: 1.1rem; color: #4a5568; margin-bottom: 2rem;">
        Trouvez facilement parmi plus de 600 000 entreprises québécoises par nom, ville, catégorie ou numéro NEQ.
      </p>

      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; color: #2d3748; margin-bottom: 1rem;">Recherches populaires</h2>
        <ul style="list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 1rem;">
          <li><a href="/categorie/restaurants" style="color: #2563eb;">Restaurants</a></li>
          <li><a href="/categorie/construction-et-renovation" style="color: #2563eb;">Construction</a></li>
          <li><a href="/categorie/services-professionnels" style="color: #2563eb;">Services professionnels</a></li>
          <li><a href="/categorie/commerce-de-detail" style="color: #2563eb;">Commerce de détail</a></li>
          <li><a href="/ville/montreal" style="color: #2563eb;">Montréal</a></li>
          <li><a href="/ville/quebec" style="color: #2563eb;">Québec</a></li>
        </ul>
      </section>

      <nav style="margin-top: 2rem;">
        <a href="/" style="color: #2563eb;">← Retour à l'accueil</a>
      </nav>
    </div>`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
      .replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    res.send(html);
  } catch (error) {
    console.error('Error rendering search page:', error);
    res.send(htmlTemplate);
  }
});

// Browse categories page SSR
app.get('/parcourir/categories', async (req, res) => {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug')
      .order('name');

    const title = 'Toutes les catégories d\'entreprises | Registre du Québec';
    const description = 'Parcourez toutes les catégories d\'entreprises au Québec: restaurants, construction, services professionnels, commerce de détail et plus.';
    const canonical = 'https://registreduquebec.com/parcourir/categories';

    let ssrContent = `
    <div class="ssr-categories" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 2rem;">Catégories d'entreprises</h1>

      <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; list-style: none; padding: 0;">
        ${(categories || []).map(cat => `
          <li style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
            <a href="/categorie/${cat.slug}" style="color: #2563eb; text-decoration: none; font-size: 1.1rem;">${escapeHtml(cat.name)}</a>
          </li>
        `).join('')}
      </ul>

      <nav style="margin-top: 3rem;">
        <a href="/" style="color: #2563eb;">← Retour à l'accueil</a>
      </nav>
    </div>`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
      .replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    res.send(html);
  } catch (error) {
    console.error('Error rendering categories page:', error);
    res.send(htmlTemplate);
  }
});

// Browse regions page SSR
app.get('/parcourir/regions', async (req, res) => {
  try {
    const regions = [
      { name: 'Montréal', slug: 'montreal' },
      { name: 'Capitale-Nationale', slug: 'capitale-nationale' },
      { name: 'Montérégie', slug: 'monteregie' },
      { name: 'Laval', slug: 'laval' },
      { name: 'Lanaudière', slug: 'lanaudiere' },
      { name: 'Laurentides', slug: 'laurentides' },
      { name: 'Estrie', slug: 'estrie' },
      { name: 'Outaouais', slug: 'outaouais' },
      { name: 'Chaudière-Appalaches', slug: 'chaudiere-appalaches' },
      { name: 'Saguenay-Lac-Saint-Jean', slug: 'saguenay-lac-saint-jean' },
      { name: 'Mauricie', slug: 'mauricie' },
      { name: 'Centre-du-Québec', slug: 'centre-du-quebec' },
      { name: 'Bas-Saint-Laurent', slug: 'bas-saint-laurent' },
      { name: 'Abitibi-Témiscamingue', slug: 'abitibi-temiscamingue' },
      { name: 'Côte-Nord', slug: 'cote-nord' },
      { name: 'Gaspésie-Îles-de-la-Madeleine', slug: 'gaspesie-iles-de-la-madeleine' },
      { name: 'Nord-du-Québec', slug: 'nord-du-quebec' }
    ];

    const title = 'Entreprises par région | Registre du Québec';
    const description = 'Trouvez des entreprises dans toutes les régions du Québec: Montréal, Québec, Laval, Montérégie, Laurentides et plus.';
    const canonical = 'https://registreduquebec.com/parcourir/regions';

    let ssrContent = `
    <div class="ssr-regions" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 2rem;">Entreprises par région</h1>

      <ul style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; list-style: none; padding: 0;">
        ${regions.map(region => `
          <li style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
            <a href="/region/${region.slug}" style="color: #2563eb; text-decoration: none; font-size: 1.1rem;">${escapeHtml(region.name)}</a>
          </li>
        `).join('')}
      </ul>

      <nav style="margin-top: 3rem;">
        <a href="/" style="color: #2563eb;">← Retour à l'accueil</a>
      </nav>
    </div>`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
      .replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    res.send(html);
  } catch (error) {
    console.error('Error rendering regions page:', error);
    res.send(htmlTemplate);
  }
});

// About page SSR
app.get('/a-propos', async (req, res) => {
  try {
    const title = 'À propos | Registre des entreprises du Québec';
    const description = 'Le Registre des entreprises du Québec est l\'annuaire le plus complet des entreprises québécoises avec plus de 600 000 fiches.';
    const canonical = 'https://registreduquebec.com/a-propos';

    let ssrContent = `
    <div class="ssr-about" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
      <h1 style="font-size: 2.5rem; color: #1a202c; margin-bottom: 2rem;">À propos du Registre du Québec</h1>

      <section style="margin-bottom: 2rem;">
        <p style="color: #4a5568; line-height: 1.8; margin-bottom: 1rem;">
          Le Registre des entreprises du Québec est l'annuaire en ligne le plus complet des entreprises québécoises.
          Notre mission est de faciliter la découverte et la connexion entre les consommateurs et les entreprises locales.
        </p>
        <p style="color: #4a5568; line-height: 1.8; margin-bottom: 1rem;">
          Avec plus de 600 000 entreprises répertoriées, nous couvrons toutes les régions du Québec et tous les secteurs d'activité:
          restaurants, construction, services professionnels, commerce de détail, santé, et bien plus encore.
        </p>
        <p style="color: #4a5568; line-height: 1.8;">
          Chaque fiche entreprise inclut les informations essentielles: adresse, numéro de téléphone, site web,
          et le numéro NEQ (Numéro d'entreprise du Québec) pour une identification officielle.
        </p>
      </section>

      <nav style="margin-top: 3rem;">
        <a href="/" style="color: #2563eb;">← Retour à l'accueil</a>
      </nav>
    </div>`;

    let html = htmlTemplate
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${canonical}">`)
      .replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    res.send(html);
  } catch (error) {
    console.error('Error rendering about page:', error);
    res.send(htmlTemplate);
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
