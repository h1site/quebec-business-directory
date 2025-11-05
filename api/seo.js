import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { getArticleBySlug, getAllArticles } from './blog-data.js';

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Cache the HTML template (safe to cache - we modify a copy for each request)
let htmlTemplateCache = null;
async function loadTemplate() {
  if (!htmlTemplateCache) {
    const templatePath = path.join(process.cwd(), 'dist/spa.html');
    htmlTemplateCache = await fs.readFile(templatePath, 'utf-8');
  }
  return htmlTemplateCache; // Return cached template (we modify a copy)
}

// Generate Schema.org JSON-LD with enhanced data
function generateSchemaOrg(business, isEnglish = false) {
  const businessDescription = isEnglish ? business.description_en : business.description;
  const defaultDesc = isEnglish
    ? `${business.name} in ${business.city}`
    : `${business.name} à ${business.city}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": businessDescription || defaultDesc,
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

  // Image (logo or photo)
  if (business.logo_url) {
    schema.image = {
      "@type": "ImageObject",
      "url": business.logo_url,
      "caption": `Logo de ${business.name}`
    };
  }

  // Social media profiles (sameAs)
  const socialLinks = [];
  if (business.facebook_url) socialLinks.push(business.facebook_url);
  if (business.instagram_url) socialLinks.push(business.instagram_url);
  if (business.linkedin_url) socialLinks.push(business.linkedin_url);
  if (business.twitter_url) socialLinks.push(business.twitter_url);
  if (business.youtube_url) socialLinks.push(business.youtube_url);

  if (socialLinks.length > 0) {
    schema.sameAs = socialLinks;
  }

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

  // Opening hours for better local SEO
  if (business.opening_hours && typeof business.opening_hours === 'object') {
    const daysMap = {
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };

    const openingHours = [];
    for (const [day, hours] of Object.entries(business.opening_hours)) {
      const dayName = daysMap[day.toLowerCase()];
      if (dayName && hours && hours.open && hours.close) {
        openingHours.push({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": dayName,
          "opens": hours.open,
          "closes": hours.close
        });
      }
    }

    if (openingHours.length > 0) {
      schema.openingHoursSpecification = openingHours;
    }
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

// Generate FAQ Schema for SEO
function generateFAQSchema(business, isEnglish = false) {
  if (!business) return null;

  const faqItems = [];

  // Question 1: City
  if (business.city) {
    const questionCity = isEnglish
      ? `In which city is ${business.name} located?`
      : `Dans quelle ville se situe ${business.name} ?`;
    const answerCity = isEnglish
      ? `${business.name} is located in ${business.city}${business.region ? `, ${business.region}` : ''}.`
      : `${business.name} se situe à ${business.city}${business.region ? `, ${business.region}` : ''}.`;

    faqItems.push({
      "@type": "Question",
      "name": questionCity,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answerCity
      }
    });
  }

  // Question 2: Address
  if (business.address) {
    const questionAddress = isEnglish
      ? `What is the address of ${business.name}?`
      : `À quelle adresse se situe ${business.name} ?`;
    const answerAddress = `${business.address}${business.address_line2 ? `, ${business.address_line2}` : ''}, ${business.city}, ${business.province || 'QC'} ${business.postal_code || ''}`;

    faqItems.push({
      "@type": "Question",
      "name": questionAddress,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answerAddress
      }
    });
  }

  // Question 3: Phone
  const questionPhone = isEnglish
    ? `Does ${business.name} have a phone number?`
    : `Est-ce que ${business.name} a un numéro de téléphone ?`;
  const answerPhone = business.phone
    ? (isEnglish
        ? `Yes, you can contact ${business.name} at ${business.phone}.`
        : `Oui, vous pouvez contacter ${business.name} au ${business.phone}.`)
    : (isEnglish
        ? `Phone information for ${business.name} is not available on this listing. We invite you to visit their website or go directly to their establishment.`
        : `Les informations de téléphone pour ${business.name} ne sont pas disponibles sur cette fiche. Nous vous invitons à visiter leur site web ou à vous rendre directement à leur établissement.`);

  faqItems.push({
    "@type": "Question",
    "name": questionPhone,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": answerPhone
    }
  });

  // Question 4: Website
  const questionWebsite = isEnglish
    ? `Does ${business.name} have a website?`
    : `${business.name} a-t-il un site internet ?`;
  const answerWebsite = business.website
    ? (isEnglish
        ? `Yes, ${business.name} has a website. You can view it by clicking on the "Website" link in the contact information above.`
        : `Oui, ${business.name} a un site internet. Vous pouvez le consulter en cliquant sur le lien "Site web" dans les coordonnées ci-dessus.`)
    : (isEnglish
        ? `Website information for ${business.name} is not available on this listing. We invite you to contact them directly for more information.`
        : `Les informations de site internet pour ${business.name} ne sont pas disponibles sur cette fiche. Nous vous invitons à les contacter directement pour plus d'informations.`);

  faqItems.push({
    "@type": "Question",
    "name": questionWebsite,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": answerWebsite
    }
  });

  // Question 5: Opening hours
  const questionHours = isEnglish
    ? `What are the opening hours of ${business.name}?`
    : `Quels sont les heures d'ouverture de ${business.name} ?`;
  const answerHours = business.opening_hours && Object.keys(business.opening_hours).length > 0
    ? (isEnglish
        ? `The opening hours of ${business.name} are displayed in the "Opening Hours" section above. We recommend checking them or contacting the establishment directly to confirm.`
        : `Les heures d'ouverture de ${business.name} sont affichées dans la section "Heures d'ouverture" ci-dessus. Nous vous recommandons de les consulter ou de contacter directement l'établissement pour confirmer.`)
    : (isEnglish
        ? `Opening hours for ${business.name} are not available on this listing. We recommend contacting the establishment directly to obtain this information.`
        : `Les heures d'ouverture de ${business.name} ne sont pas disponibles sur cette fiche. Nous vous recommandons de contacter directement l'établissement pour obtenir cette information.`);

  faqItems.push({
    "@type": "Question",
    "name": questionHours,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": answerHours
    }
  });

  // Question 6: Industry/Category (with subcategory if available)
  const categoryName = isEnglish
    ? (business.main_category_name_en || business.primary_main_category_en)
    : (business.main_category_name_fr || business.primary_main_category_fr);

  const subCategoryName = isEnglish
    ? (business.primary_sub_category_en)
    : (business.primary_sub_category_fr);

  if (categoryName && !categoryName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
    const questionIndustry = isEnglish
      ? `What industry does ${business.name} operate in?`
      : `Dans quel domaine œuvre ${business.name} ?`;

    let answerIndustry;
    if (subCategoryName && !subCategoryName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
      answerIndustry = isEnglish
        ? `${business.name} operates in the industry: ${categoryName}, specializing in ${subCategoryName}.`
        : `${business.name} œuvre dans le domaine : ${categoryName}, spécialisé en ${subCategoryName}.`;
    } else {
      answerIndustry = isEnglish
        ? `${business.name} operates in the industry: ${categoryName}.`
        : `${business.name} œuvre dans le domaine : ${categoryName}.`;
    }

    faqItems.push({
      "@type": "Question",
      "name": questionIndustry,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": answerIndustry
      }
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems
  };
}

// Generate SSR HTML content for business page (for Google crawlers)
function generateSSRContent(business, isEnglish = false) {
  const businessDescription = isEnglish ? business.description_en : business.description;

  // Get category name (avoid UUIDs)
  let category = '';
  if (isEnglish) {
    category = business.main_category_name_en || business.primary_category_name_en || '';
  } else {
    category = business.main_category_name_fr || business.primary_category_name_fr || '';
  }

  // Fallback: check if primary_main_category_fr/en is NOT a UUID
  if (!category) {
    const primaryCat = isEnglish ? business.primary_main_category_en : business.primary_main_category_fr;
    if (primaryCat && !primaryCat.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
      category = primaryCat;
    }
  }

  // Translations
  const labels = isEnglish ? {
    phone: 'Phone',
    website: 'Website',
    email: 'Email',
    address: 'Address',
    neq: 'NEQ',
    about: 'About',
    reviews: 'Reviews',
    openingHours: 'Opening Hours'
  } : {
    phone: 'Téléphone',
    website: 'Site web',
    email: 'Courriel',
    address: 'Adresse',
    neq: 'NEQ',
    about: 'À propos',
    reviews: 'Avis',
    openingHours: 'Heures d\'ouverture'
  };

  // Build SSR HTML (semantic HTML for SEO)
  let html = `
  <article itemscope itemtype="https://schema.org/LocalBusiness" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
    <header style="margin-bottom: 2rem;">
      <h1 itemprop="name" style="font-size: 2.5rem; margin-bottom: 0.5rem; color: #1a202c;">${escapeHtml(business.name)}</h1>
      ${category ? `<p style="font-size: 1.1rem; color: #4a5568; margin-bottom: 0.5rem;">${escapeHtml(category)}</p>` : ''}
      ${business.city ? `<p itemprop="addressLocality" style="font-size: 1rem; color: #718096;">${escapeHtml(business.city)}, Québec</p>` : ''}
    </header>`;

  // Description
  if (businessDescription && businessDescription.length > 10) {
    html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">${labels.about}</h2>
      <div itemprop="description" style="line-height: 1.6; color: #4a5568;">
        ${escapeHtml(businessDescription)}
      </div>
    </section>`;
  }

  // Contact Information
  html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">Contact</h2>
      <div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress" style="display: flex; flex-direction: column; gap: 0.75rem;">`;

  if (business.phone) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.phone}:</strong>
          <a href="tel:${escapeHtml(business.phone)}" itemprop="telephone" style="color: #3182ce; text-decoration: none;">
            ${escapeHtml(business.phone)}
          </a>
        </p>`;
  }

  if (business.address) {
    const fullAddress = `${business.address}${business.city ? ', ' + business.city : ''}${business.postal_code ? ', ' + business.postal_code : ''}`;
    html += `
        <p style="margin: 0;" itemprop="streetAddress">
          <strong>${labels.address}:</strong> ${escapeHtml(fullAddress)}
        </p>`;
  }

  if (business.website) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.website}:</strong>
          <a href="${escapeHtml(business.website)}" target="_blank" rel="noopener noreferrer" itemprop="url" style="color: #3182ce; text-decoration: none;">
            ${escapeHtml(business.website)}
          </a>
        </p>`;
  }

  if (business.email) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.email}:</strong>
          <a href="mailto:${escapeHtml(business.email)}" itemprop="email" style="color: #3182ce; text-decoration: none;">
            ${escapeHtml(business.email)}
          </a>
        </p>`;
  }

  if (business.neq) {
    html += `
        <p style="margin: 0;">
          <strong>${labels.neq}:</strong> ${escapeHtml(business.neq)}
        </p>`;
  }

  html += `
      </div>
    </section>`;

  // Ratings (if available)
  if (business.google_rating && business.google_reviews_count) {
    html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">${labels.reviews}</h2>
      <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating" style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 2rem; font-weight: bold; color: #f6ad55;">${business.google_rating}</span>
        <span style="color: #f6ad55;">★</span>
        <span style="color: #718096;">
          (<span itemprop="ratingValue">${business.google_rating}</span>/5 -
          <span itemprop="reviewCount">${business.google_reviews_count}</span> ${labels.reviews.toLowerCase()})
        </span>
      </div>
    </section>`;
  }

  // FAQ Section - Generate FAQ HTML for SSR
  const faqTitle = isEnglish ? 'Frequently Asked Questions' : 'Questions fréquentes';
  html += `
    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: #2d3748;">${faqTitle}</h2>
      <div style="display: flex; flex-direction: column; gap: 1rem;">`;

  // Generate FAQ items from the schema
  const faqSchema = generateFAQSchema(business, isEnglish);
  if (faqSchema && faqSchema.mainEntity && faqSchema.mainEntity.length > 0) {
    faqSchema.mainEntity.forEach((item, index) => {
      html += `
        <details style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
          <summary style="font-weight: 600; cursor: pointer; color: #2d3748; list-style: none; display: flex; justify-content: space-between; align-items: center;">
            <span>${escapeHtml(item.name)}</span>
            <span style="color: #718096;">▼</span>
          </summary>
          <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #4a5568; line-height: 1.6;">
            ${escapeHtml(item.acceptedAnswer.text)}
          </div>
        </details>`;
    });
  }

  html += `
      </div>
    </section>`;

  html += `
  </article>
  <noscript>
    <style>
      #root > article { display: block !important; }
    </style>
  </noscript>`;

  return html;
}

// Main serverless function handler
export default async function handler(req, res) {
  // SEO-friendly cache headers: Allow Google to cache but revalidate
  // s-maxage=3600 = CDN caches for 1 hour
  // stale-while-revalidate=86400 = Serve stale content while revalidating for 24h
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  // DO NOT use Vary: * as it prevents all caching and confuses Google
  // Only vary on Accept-Encoding for compression
  res.setHeader('Vary', 'Accept-Encoding');

  try {
    const { slug, categorySlug, citySlug, subCategorySlug, regionSlug, lang, blogSlug, page } = req.query;

    // Detect language from query parameter or default to French
    const isEnglish = lang === 'en';
    const locale = isEnglish ? 'en_CA' : 'fr_CA';

    // ROUTE 0.1: Blog Article Pages (/blogue/:articleId)
    if (blogSlug) {
      return handleBlogArticlePage(req, res, { blogSlug, isEnglish, locale });
    }

    // ROUTE 0.2: Static Pages (About, FAQ, Homepage, Blog listing)
    if (page) {
      if (page === 'blog') {
        return handleBlogListingPage(req, res, { isEnglish, locale });
      }
      if (page === 'about') {
        return handleAboutPage(req, res, { isEnglish, locale });
      }
      if (page === 'faq') {
        return handleFAQPage(req, res, { isEnglish, locale });
      }
      if (page === 'home') {
        return handleHomePage(req, res, { isEnglish, locale });
      }
    }

    // ROUTE 1: Category Browse Pages (/categorie/sports-et-loisirs)
    if (categorySlug && !slug && !citySlug) {
      return handleCategoryPage(req, res, { categorySlug, subCategorySlug, isEnglish, locale });
    }

    // ROUTE 2: City Browse Pages (/ville/montreal)
    if (citySlug && !slug && !categorySlug) {
      return handleCityPage(req, res, { citySlug, isEnglish, locale });
    }

    // ROUTE 3: Region Browse Pages (/region/montreal)
    if (regionSlug && !slug) {
      // For now, return default template - can implement later
      const template = await loadTemplate();
      return res.status(200).setHeader('Content-Type', 'text/html').send(template);
    }

    // ROUTE 4: Business Detail Pages (/categorie/ville/slug)
    if (slug) {
      return handleBusinessPage(req, res, { slug, categorySlug, citySlug, isEnglish, locale });
    }

    // ROUTE 5: Default - Homepage or other pages
    const template = await loadTemplate();
    return res.status(200).setHeader('Content-Type', 'text/html').send(template);
  } catch (error) {
    console.error('SEO function error:', error);
    res.status(500).send('Erreur serveur');
  }
}

// Handle Business Detail Pages
async function handleBusinessPage(req, res, { slug, categorySlug, citySlug, isEnglish, locale }) {
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
    // Use correct language description
    const businessDescription = isEnglish ? business.description_en : business.description;

    if (businessDescription && businessDescription.length > 10) {
      // Use first 150 characters of description
      description = businessDescription.substring(0, 150);
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

    // Generate LocalBusiness schema
    const localBusinessSchema = generateSchemaOrg(business, isEnglish);

    // Generate FAQ schema for SEO
    const faqSchema = generateFAQSchema(business, isEnglish);

    // Generate BreadcrumbList schema for navigation
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": isEnglish ? "Home" : "Accueil",
          "item": `https://registreduquebec.com${isEnglish ? '/en' : ''}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": business.city || (isEnglish ? "Quebec" : "Québec"),
          "item": `https://registreduquebec.com${isEnglish ? '/en' : ''}/ville/${correctCitySlug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": business.name
        }
      ]
    };

    // Generate WebPage (ItemPage) schema
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      "name": title,
      "description": description,
      "url": canonical,
      "inLanguage": isEnglish ? "en-CA" : "fr-CA",
      "isPartOf": {
        "@type": "WebSite",
        "name": siteName,
        "url": "https://registreduquebec.com"
      },
      "breadcrumb": breadcrumbSchema,
      "mainEntity": localBusinessSchema
    };

    // Combine all schemas into a graph
    const schemaOrg = {
      "@context": "https://schema.org",
      "@graph": [
        localBusinessSchema,
        webPageSchema,
        breadcrumbSchema,
        faqSchema
      ]
    };

    // Generate STABLE ETag based on business data (not timestamp!)
    // Google needs consistent ETags to understand when content actually changes
    // Use business updated_at or a hash of key fields for proper cache validation
    const etag = `"${slug}-${business.id}"`;
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

    // STEP 2: Remove ALL default Open Graph, Twitter, and Geo tags
    html = html
      // Remove OG tags (with or without IDs)
      .replace(/<meta property="og:site_name"[^>]*>/gi, '')
      .replace(/<meta property="og:type"[^>]*>/gi, '')
      .replace(/<meta property="og:url"[^>]*>/gi, '')
      .replace(/<meta property="og:title"[^>]*>/gi, '')
      .replace(/<meta property="og:description"[^>]*>/gi, '')
      .replace(/<meta property="og:locale"[^>]*>/gi, '')
      .replace(/<meta property="og:locale:alternate"[^>]*>/gi, '')
      .replace(/<meta property="og:image"[^>]*>/gi, '')
      .replace(/<meta property="og:image:width"[^>]*>/gi, '')
      .replace(/<meta property="og:image:height"[^>]*>/gi, '')
      // Remove Twitter tags (with or without IDs)
      .replace(/<meta name="twitter:card"[^>]*>/gi, '')
      .replace(/<meta name="twitter:title"[^>]*>/gi, '')
      .replace(/<meta name="twitter:description"[^>]*>/gi, '')
      .replace(/<meta name="twitter:image"[^>]*>/gi, '')
      // Remove Geo tags (will be replaced with accurate business location)
      .replace(/<meta name="geo\.region"[^>]*>/gi, '')
      .replace(/<meta name="geo\.placename"[^>]*>/gi, '')
      .replace(/<meta name="geo\.position"[^>]*>/gi, '')
      .replace(/<meta name="ICBM"[^>]*>/gi, '')
      // Remove meta keywords tag (obsolete for SEO)
      .replace(/<meta name="keywords"[^>]*>/gi, '');

    // STEP 3: Remove existing canonical and hreflang tags
    html = html
      .replace(/<link rel="canonical"[^>]*>/gi, '')
      .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

    // STEP 4: Inject new canonical and business-specific SEO tags
    const canonicalTag = `    <link rel="canonical" href="${canonical}">`;

    // Use business logo if available, otherwise use default OG image
    const defaultOgImage = isEnglish
      ? 'https://registreduquebec.com/og-default-en.svg'
      : 'https://registreduquebec.com/og-default.svg';
    const ogImage = business.logo_url || defaultOgImage;

    // Build geo meta tags with accurate business coordinates (if available)
    let geoTags = '';
    if (business.latitude && business.longitude) {
      geoTags = `
    <meta name="geo.region" content="CA-QC">
    <meta name="geo.placename" content="${escapeHtml(business.city || 'Québec')}">
    <meta name="geo.position" content="${business.latitude};${business.longitude}">
    <meta name="ICBM" content="${business.latitude}, ${business.longitude}">`;
    }

    const seoTags = `
    ${geoTags}
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

    // Generate SSR content for Google (critical content only)
    const ssrContent = generateSSRContent(business, isEnglish);

    // Inject SSR content into <div id="root">
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${ssrContent}</div>`
    );

    // Add initial data for client
    const dataScript = `
    <script>
    window.__INITIAL_BUSINESS_DATA__ = ${JSON.stringify(business)};
    </script>`;

    html = html.replace('</body>', `${dataScript}\n</body>`);

    res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle Category Browse Pages
async function handleCategoryPage(req, res, { categorySlug, subCategorySlug, isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  // Fetch category info from Supabase
  const { data: mainCat, error: catError } = await supabase
    .from('main_categories')
    .select('id, label_fr, label_en, slug')
    .eq('slug', categorySlug)
    .single();

  if (catError || !mainCat) {
    const template = await loadTemplate();
    return res.status(404).setHeader('Content-Type', 'text/html').send(template);
  }

  const categoryName = isEnglish ? (mainCat.label_en || mainCat.label_fr) : mainCat.label_fr;
  let subCategoryName = '';
  let title, description, canonical;

  // Handle subcategory if present
  if (subCategorySlug) {
    const { data: subCat } = await supabase
      .from('sub_categories')
      .select('label_fr, label_en, slug')
      .eq('slug', subCategorySlug)
      .single();

    if (subCat) {
      subCategoryName = isEnglish ? (subCat.label_en || subCat.label_fr) : subCat.label_fr;
      const titlePrefix = isEnglish ? 'Businesses in' : 'Entreprises en';
      title = `${titlePrefix} ${subCategoryName} | ${siteName}`;
      description = isEnglish
        ? `Find businesses in ${subCategoryName} in Quebec. Complete directory with contact information and reviews.`
        : `Trouvez des entreprises en ${subCategoryName} au Québec. Annuaire complet avec coordonnées et avis.`;
      canonical = `https://registreduquebec.com${isEnglish ? '/en' : ''}/categorie/${categorySlug}/${subCategorySlug}`;
    }
  }

  if (!subCategorySlug) {
    const titlePrefix = isEnglish ? 'Businesses of' : 'Entreprises de';
    title = `${titlePrefix} ${categoryName} | ${siteName}`;
    description = isEnglish
      ? `Find all businesses in ${categoryName} category in Quebec. Complete directory with contact information.`
      : `Trouvez toutes les entreprises de catégorie ${categoryName} au Québec. Annuaire complet avec coordonnées.`;
    canonical = `https://registreduquebec.com${isEnglish ? '/en' : ''}/categorie/${categorySlug}`;
  }

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // Add new SEO tags
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/categorie/${categorySlug}${subCategorySlug ? '/' + subCategorySlug : ''}" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/categorie/${categorySlug}${subCategorySlug ? '/' + subCategorySlug : ''}" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/categorie/${categorySlug}${subCategorySlug ? '/' + subCategorySlug : ''}" />`;

  const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n</head>`);

  // Generate minimal SSR content for crawlers
  const displayName = subCategoryName || categoryName;
  const titlePrefix = subCategorySlug
    ? (isEnglish ? 'Businesses in' : 'Entreprises en')
    : (isEnglish ? 'Businesses of' : 'Entreprises de');

  const ssrContent = `
  <div class="container browse-page" style="padding: 2rem 0;">
    <header style="margin-bottom: 2rem; text-align: center;">
      <h1 style="font-size: 2.5rem; font-weight: 700; color: #0f4c81; margin-bottom: 0.5rem;">${titlePrefix} ${escapeHtml(displayName)}</h1>
      <p style="font-size: 1.1rem; color: #718096;">${escapeHtml(description)}</p>
    </header>
    <noscript>
      <p style="text-align: center; color: #718096;">${isEnglish ? 'Please enable JavaScript to view the full business directory.' : 'Veuillez activer JavaScript pour voir l\'annuaire complet des entreprises.'}</p>
    </noscript>
  </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle City Browse Pages
async function handleCityPage(req, res, { citySlug, isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  // Convert slug to city name (montreal -> Montreal, vaudreuil-dorion -> Vaudreuil-Dorion)
  const cityName = citySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');

  const title = isEnglish
    ? `Businesses in ${cityName} | ${siteName}`
    : `Entreprises à ${cityName} | ${siteName}`;

  const description = isEnglish
    ? `Find all businesses in ${cityName}, Quebec. Complete directory with contact information, reviews and detailed information.`
    : `Trouvez toutes les entreprises à ${cityName}, Québec. Annuaire complet avec coordonnées, avis et informations détaillées.`;

  const canonical = `https://registreduquebec.com${isEnglish ? '/en' : ''}/ville/${citySlug}`;

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // Add new SEO tags
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/ville/${citySlug}" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/city/${citySlug}" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/ville/${citySlug}" />`;

  const seoTags = `
    <meta name="geo.region" content="CA-QC">
    <meta name="geo.placename" content="${escapeHtml(cityName)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n</head>`);

  // Generate minimal SSR content for crawlers
  const ssrContent = `
  <div class="container browse-page" style="padding: 2rem 0;">
    <header style="margin-bottom: 2rem; text-align: center;">
      <h1 style="font-size: 2.5rem; font-weight: 700; color: #0f4c81; margin-bottom: 0.5rem;">${isEnglish ? 'Businesses in' : 'Entreprises à'} ${escapeHtml(cityName)}</h1>
      <p style="font-size: 1.1rem; color: #718096;">${escapeHtml(description)}</p>
    </header>
    <noscript>
      <p style="text-align: center; color: #718096;">${isEnglish ? 'Please enable JavaScript to view the full business directory.' : 'Veuillez activer JavaScript pour voir l\'annuaire complet des entreprises.'}</p>
    </noscript>
  </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle Blog Article Pages
async function handleBlogArticlePage(req, res, { blogSlug, isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  // Get article from blog data
  const article = getArticleBySlug(blogSlug);

  if (!article) {
    const template = await loadTemplate();
    return res.status(404).setHeader('Content-Type', 'text/html').send(template);
  }

  const lang = isEnglish ? 'en' : 'fr';
  const seo = article.seo[lang];
  const title = seo.title;
  const description = seo.description;
  const canonical = seo.canonical;

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // Add new SEO tags
  const articleDate = new Date(article.publishedDate).toISOString();
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/blogue/${blogSlug}" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/blog/${blogSlug}" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/blogue/${blogSlug}" />`;

  const seoTags = `
    <meta name="keywords" content="${escapeHtml(seo.keywords)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta property="og:image" content="${article.heroImage.url}?w=1200">
    <meta property="article:published_time" content="${articleDate}">
    <meta property="article:author" content="${escapeHtml(article.author)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${article.heroImage.url}?w=1200">`;

  // Article Schema.org
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title[lang],
    "description": description,
    "image": article.heroImage.url,
    "datePublished": article.publishedDate,
    "dateModified": article.publishedDate,
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://registreduquebec.com/images/logos/logoblue.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonical
    }
  };

  const schemaTag = `
    <script type="application/ld+json">
      ${JSON.stringify(articleSchema)}
    </script>`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n${schemaTag}\n</head>`);

  // Generate full SSR content for crawlers
  const articleTitle = article.title[lang];
  const articleIntro = article.intro[lang];

  // Generate sample content sections based on article type
  let contentSections = '';

  if (blogSlug.includes('neq-quebec')) {
    contentSections = isEnglish ? `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">What is the NEQ?</h2>
        <p style="margin-bottom: 1rem;">The NEQ (Numéro d'entreprise du Québec) is a unique 10-digit identifier assigned to every business registered in Quebec. This number is essential for all administrative dealings with the Quebec government and serves as the official identification for your business.</p>
        <p style="margin-bottom: 1rem;">The NEQ is assigned by the Quebec Enterprise Registrar (REQ) when you register your business. It remains attached to your business throughout its entire lifecycle, from creation to closure.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Who Needs a NEQ?</h2>
        <p style="margin-bottom: 1rem;">The following types of businesses must obtain a NEQ:</p>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
          <li>Corporations (Inc., Ltd., Ltée)</li>
          <li>Sole proprietorships operating under a name other than the owner's name</li>
          <li>Partnerships (general and limited)</li>
          <li>Non-profit organizations</li>
          <li>Cooperatives</li>
        </ul>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">How to Obtain Your NEQ</h2>
        <p style="margin-bottom: 1rem;">To obtain your NEQ, you must register your business with the Quebec Enterprise Registrar. The process can be completed online through the REQ website. You'll need to provide information about your business structure, activities, address, and management.</p>
        <p style="margin-bottom: 1rem;">The registration fee varies depending on your business type. Once completed, you'll receive your NEQ immediately, which you can then use for all your administrative procedures.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Searching for a NEQ</h2>
        <p style="margin-bottom: 1rem;">You can search for any Quebec business's NEQ using the Registre du Québec directory. Simply enter the business name, and you'll find their NEQ along with other public information such as address, registration date, and business status.</p>
      </section>
    ` : `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Qu'est-ce que le NEQ?</h2>
        <p style="margin-bottom: 1rem;">Le NEQ (Numéro d'entreprise du Québec) est un identifiant unique à 10 chiffres attribué à chaque entreprise immatriculée au Québec. Ce numéro est essentiel pour toutes les transactions administratives avec le gouvernement du Québec et sert d'identification officielle pour votre entreprise.</p>
        <p style="margin-bottom: 1rem;">Le NEQ est attribué par le Registraire des entreprises du Québec (REQ) lors de l'immatriculation de votre entreprise. Il reste attaché à votre entreprise durant tout son cycle de vie, de sa création à sa fermeture.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Qui a besoin d'un NEQ?</h2>
        <p style="margin-bottom: 1rem;">Les types d'entreprises suivants doivent obtenir un NEQ :</p>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
          <li>Sociétés par actions (Inc., Ltd., Ltée)</li>
          <li>Entreprises individuelles opérant sous un nom autre que celui du propriétaire</li>
          <li>Sociétés de personnes (générales et en commandite)</li>
          <li>Organismes à but non lucratif</li>
          <li>Coopératives</li>
        </ul>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Comment obtenir votre NEQ</h2>
        <p style="margin-bottom: 1rem;">Pour obtenir votre NEQ, vous devez immatriculer votre entreprise auprès du Registraire des entreprises du Québec. Le processus peut être complété en ligne via le site du REQ. Vous devrez fournir des informations sur la structure de votre entreprise, ses activités, son adresse et sa gestion.</p>
        <p style="margin-bottom: 1rem;">Les frais d'immatriculation varient selon le type d'entreprise. Une fois complétée, vous recevrez votre NEQ immédiatement, que vous pourrez ensuite utiliser pour toutes vos démarches administratives.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Rechercher un NEQ</h2>
        <p style="margin-bottom: 1rem;">Vous pouvez rechercher le NEQ de n'importe quelle entreprise québécoise en utilisant l'annuaire Registre du Québec. Entrez simplement le nom de l'entreprise et vous trouverez son NEQ ainsi que d'autres informations publiques telles que l'adresse, la date d'immatriculation et le statut de l'entreprise.</p>
      </section>
    `;
  } else if (blogSlug.includes('reclamer-fiche')) {
    contentSections = isEnglish ? `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Why Claim Your Business Listing?</h2>
        <p style="margin-bottom: 1rem;">Claiming your business listing on Registre du Québec gives you control over your business information and provides several key benefits:</p>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
          <li>Update and correct your business information</li>
          <li>Add photos, hours of operation, and services</li>
          <li>Respond to customer reviews</li>
          <li>Get a valuable dofollow backlink to your website</li>
          <li>Improve your local SEO rankings</li>
        </ul>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">How to Claim Your Listing</h2>
        <p style="margin-bottom: 1rem;">The claiming process is simple and free. Here are the steps:</p>
        <ol style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
          <li>Find your business using the search function</li>
          <li>Click on "Claim This Business" button</li>
          <li>Create a free account or log in</li>
          <li>Verify your identity as the business owner</li>
          <li>Complete your business profile</li>
        </ol>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">SEO Benefits of Claiming</h2>
        <p style="margin-bottom: 1rem;">When you claim your listing, you get a dofollow backlink to your website. This is valuable for your SEO because it helps improve your domain authority and can boost your rankings in search engines like Google.</p>
      </section>
    ` : `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Pourquoi réclamer votre fiche d'entreprise?</h2>
        <p style="margin-bottom: 1rem;">Réclamer votre fiche d'entreprise sur le Registre du Québec vous donne le contrôle sur vos informations et offre plusieurs avantages clés :</p>
        <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
          <li>Mettre à jour et corriger vos informations d'entreprise</li>
          <li>Ajouter des photos, heures d'ouverture et services</li>
          <li>Répondre aux avis clients</li>
          <li>Obtenir un backlink dofollow précieux vers votre site web</li>
          <li>Améliorer votre référencement local</li>
        </ul>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Comment réclamer votre fiche</h2>
        <p style="margin-bottom: 1rem;">Le processus de réclamation est simple et gratuit. Voici les étapes :</p>
        <ol style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
          <li>Trouvez votre entreprise avec la fonction de recherche</li>
          <li>Cliquez sur le bouton "Réclamer cette entreprise"</li>
          <li>Créez un compte gratuit ou connectez-vous</li>
          <li>Vérifiez votre identité en tant que propriétaire</li>
          <li>Complétez votre profil d'entreprise</li>
        </ol>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Avantages SEO de la réclamation</h2>
        <p style="margin-bottom: 1rem;">Quand vous réclamez votre fiche, vous obtenez un backlink dofollow vers votre site web. Ceci est précieux pour votre référencement car il aide à améliorer l'autorité de votre domaine et peut augmenter vos classements dans les moteurs de recherche comme Google.</p>
      </section>
    `;
  } else if (blogSlug.includes('restaurants-montreal')) {
    contentSections = isEnglish ? `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Montreal's Best Dining Experiences</h2>
        <p style="margin-bottom: 1rem;">Montreal is renowned for its exceptional culinary scene, blending French gastronomy with international influences. From cozy bistros to upscale dining establishments, the city offers unforgettable dining experiences.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Top Restaurants in Montreal 2025</h2>
        <p style="margin-bottom: 1rem;">Our selection includes iconic establishments like Joe Beef, Toqué!, and Au Pied de Cochon, known for their exceptional quality, innovative cuisine, and outstanding customer reviews.</p>
        <p style="margin-bottom: 1rem;">Each restaurant on this list has been selected based on customer reviews, culinary quality, ambiance, and overall dining experience.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Reservation Tips</h2>
        <p style="margin-bottom: 1rem;">Many of Montreal's top restaurants book up quickly, especially on weekends. We recommend making reservations at least 2-3 weeks in advance for the most popular establishments.</p>
      </section>
    ` : `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Les meilleures expériences culinaires de Montréal</h2>
        <p style="margin-bottom: 1rem;">Montréal est reconnue pour sa scène culinaire exceptionnelle, mêlant gastronomie française et influences internationales. Des bistrots chaleureux aux établissements haut de gamme, la ville offre des expériences culinaires inoubliables.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Top restaurants de Montréal 2025</h2>
        <p style="margin-bottom: 1rem;">Notre sélection inclut des établissements iconiques comme Joe Beef, Toqué! et Au Pied de Cochon, reconnus pour leur qualité exceptionnelle, leur cuisine innovante et leurs excellents avis clients.</p>
        <p style="margin-bottom: 1rem;">Chaque restaurant de cette liste a été sélectionné en fonction des avis clients, de la qualité culinaire, de l'ambiance et de l'expérience globale.</p>
      </section>
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">Conseils pour réserver</h2>
        <p style="margin-bottom: 1rem;">Plusieurs des meilleurs restaurants de Montréal sont rapidement complets, surtout les fins de semaine. Nous recommandons de réserver au moins 2-3 semaines à l'avance pour les établissements les plus populaires.</p>
      </section>
    `;
  }

  const ssrContent = `
  <article class="blog-article" style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2.5rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem; line-height: 1.2;">${escapeHtml(articleTitle)}</h1>
      <div style="display: flex; gap: 1rem; color: #718096; font-size: 0.95rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
        <span>${isEnglish ? 'By' : 'Par'} ${escapeHtml(article.author)}</span>
        <span>•</span>
        <time datetime="${article.publishedDate}">${new Date(article.publishedDate).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        <span>•</span>
        <span>${article.readTime}</span>
      </div>
      <img src="${article.heroImage.url}?w=1200&auto=format" alt="${escapeHtml(article.heroImage.alt[lang])}" style="width: 100%; height: auto; border-radius: 12px; margin-bottom: 1.5rem;" />
    </header>
    <div class="article-content" style="line-height: 1.8; color: #2d3748; font-size: 1.05rem;">
      <p style="font-size: 1.2rem; color: #4a5568; margin-bottom: 2rem; font-weight: 500;">${escapeHtml(articleIntro)}</p>
      ${contentSections}
      <div style="background: #f7fafc; border-left: 4px solid #0f4c81; padding: 1.5rem; margin: 2rem 0; border-radius: 4px;">
        <p style="margin: 0; font-style: italic; color: #2d3748;">
          ${isEnglish
            ? 'This article is part of our Quebec Business Guide series. For more information, visit the Registre du Québec.'
            : 'Cet article fait partie de notre série de guides pour les entreprises québécoises. Pour plus d\'informations, visitez le Registre du Québec.'}
        </p>
      </div>
      <noscript>
        <p style="text-align: center; color: #718096; padding: 2rem; background: #fff3cd; border-radius: 8px; border: 1px solid #ffc107;">
          ${isEnglish ? 'Please enable JavaScript to view the full article content and interactive features.' : 'Veuillez activer JavaScript pour voir le contenu complet de l\'article et les fonctionnalités interactives.'}
        </p>
      </noscript>
    </div>
  </article>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle Blog Listing Page
async function handleBlogListingPage(req, res, { isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';
  const lang = isEnglish ? 'en' : 'fr';

  const title = isEnglish
    ? `Blog - Business Tips & Quebec Guides | ${siteName}`
    : `Blogue - Conseils d'affaires & Guides Québec | ${siteName}`;

  const description = isEnglish
    ? 'Discover guides, tips and advice for Quebec businesses: NEQ registration, business listing optimization, local SEO and more.'
    : 'Découvrez des guides, conseils et astuces pour les entreprises du Québec : immatriculation NEQ, optimisation de fiche, référencement local et plus.';

  const canonical = `https://registreduquebec.com${isEnglish ? '/en/blog' : '/blogue'}`;

  // Get all articles
  const articles = getAllArticles();

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // Add new SEO tags
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/blogue" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/blog" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/blogue" />`;

  const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n</head>`);

  // Generate SSR content with article list
  const articlesHtml = articles.map(article => `
    <article style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
      <img src="${article.heroImage.url}?w=600&auto=format" alt="${escapeHtml(article.heroImage.alt[lang])}" style="width: 100%; height: 250px; object-fit: cover;" />
      <div style="padding: 1.5rem;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #1a202c; margin-bottom: 0.75rem;">
          <a href="${isEnglish ? '/en/blog' : '/blogue'}/${article.slug}" style="color: inherit; text-decoration: none;">
            ${escapeHtml(article.title[lang])}
          </a>
        </h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 1rem;">${escapeHtml(article.intro[lang].substring(0, 150))}...</p>
        <div style="display: flex; gap: 1rem; color: #718096; font-size: 0.9rem;">
          <span>${new Date(article.publishedDate).toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span>•</span>
          <span>${article.readTime}</span>
        </div>
      </div>
    </article>
  `).join('');

  const ssrContent = `
  <div class="blog-page" style="max-width: 1000px; margin: 0 auto; padding: 2rem;">
    <header style="text-align: center; margin-bottom: 3rem;">
      <h1 style="font-size: 3rem; font-weight: 700; color: #0f4c81; margin-bottom: 0.5rem;">
        ${isEnglish ? 'Blog' : 'Blogue'}
      </h1>
      <p style="font-size: 1.2rem; color: #718096;">${escapeHtml(description)}</p>
    </header>
    <div class="articles-list">
      ${articlesHtml}
    </div>
    <noscript>
      <p style="text-align: center; color: #718096;">${isEnglish ? 'Please enable JavaScript to view the full blog.' : 'Veuillez activer JavaScript pour voir le blogue complet.'}</p>
    </noscript>
  </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle About Page
async function handleAboutPage(req, res, { isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  const title = isEnglish
    ? `About Us - ${siteName}`
    : `À propos - ${siteName}`;

  const description = isEnglish
    ? 'Quebec Business Directory is an independent platform with over 600,000 businesses listed. Find local businesses and claim your free listing.'
    : 'Le Registre du Québec est une plateforme indépendante avec plus de 600 000 entreprises répertoriées. Trouvez des entreprises locales et réclamez votre fiche gratuite.';

  const canonical = `https://registreduquebec.com${isEnglish ? '/en/about' : '/a-propos'}`;

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // Add new SEO tags
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/a-propos" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/about" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/a-propos" />`;

  const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n</head>`);

  // Generate SSR content
  const ssrContent = `
  <div class="about-page" style="max-width: 1000px; margin: 0 auto; padding: 2rem;">
    <header style="text-align: center; margin-bottom: 3rem;">
      <img src="/images/logos/logoblue.webp" alt="${siteName}" style="max-width: 200px; margin-bottom: 1.5rem;" />
      <h1 style="font-size: 2.5rem; font-weight: 700; color: #0f4c81; margin-bottom: 0.5rem;">
        ${isEnglish ? 'About Quebec Business Directory' : 'À propos du Registre du Québec'}
      </h1>
    </header>
    <section style="margin-bottom: 2.5rem;">
      <h2 style="font-size: 1.8rem; font-weight: 600; color: #2d3748; margin-bottom: 1rem;">
        ${isEnglish ? 'Our Mission' : 'Notre mission'}
      </h2>
      <p style="line-height: 1.8; color: #4a5568; margin-bottom: 1rem;">
        ${isEnglish
          ? 'Quebec Business Directory is an independent private platform dedicated to making information about Quebec businesses more accessible and facilitating the visibility of local businesses throughout the province.'
          : 'Le Registre du Québec est une plateforme privée indépendante dédiée à rendre l\'information sur les entreprises québécoises plus accessible et à faciliter la visibilité des commerces locaux à travers la province.'
        }
      </p>
      <p style="line-height: 1.8; color: #4a5568;">
        ${isEnglish
          ? 'With over <strong>600,000 businesses listed</strong>, we offer the largest database of Quebec businesses, allowing consumers to easily find the services and products they need while helping businesses increase their online visibility.'
          : 'Avec plus de <strong>600 000 entreprises répertoriées</strong>, nous offrons la plus grande base de données d\'entreprises du Québec, permettant aux consommateurs de trouver facilement les services et produits dont ils ont besoin, tout en aidant les entreprises à accroître leur visibilité en ligne.'
        }
      </p>
    </section>
    <noscript>
      <p style="text-align: center; color: #718096;">${isEnglish ? 'Please enable JavaScript to view the full content.' : 'Veuillez activer JavaScript pour voir le contenu complet.'}</p>
    </noscript>
  </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle FAQ Page
async function handleFAQPage(req, res, { isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';
  const lang = isEnglish ? 'en' : 'fr';

  const title = isEnglish
    ? `Frequently Asked Questions (FAQ) - ${siteName}`
    : `Foire aux questions (FAQ) - ${siteName}`;

  const description = isEnglish
    ? 'Quickly find answers to your questions about Quebec Business Directory: search, claiming listings, NEQ, account management and more.'
    : 'Trouvez rapidement les réponses à vos questions sur le Registre du Québec : recherche, réclamation de fiche, NEQ, gestion de compte et plus.';

  const canonical = `https://registreduquebec.com${isEnglish ? '/en/faq' : '/faq'}`;

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // FAQ Schema
  const faqItems = isEnglish ? [
    {
      q: 'How do I find a business in Quebec?',
      a: 'Use our search engine at the top of the page. You can search by business name, city, region, category, or Quebec Enterprise Number (NEQ). Our directory contains over 600,000 Quebec businesses with complete contact information and detailed data.'
    },
    {
      q: 'What is a NEQ?',
      a: 'The NEQ (Quebec Enterprise Number) is a unique 10-digit identifier assigned by the Enterprise Registrar to each business registered in Quebec.'
    },
    {
      q: 'How do I claim my business listing?',
      a: 'Create a free account, log in, find your business via search, then click the "Claim This Listing" button on your business page. Our team will contact you by email or phone to verify your identity.'
    }
  ] : [
    {
      q: 'Comment trouver une entreprise au Québec?',
      a: 'Utilisez notre moteur de recherche en haut de la page. Vous pouvez rechercher par nom d\'entreprise, ville, région, catégorie ou numéro d\'entreprise du Québec (NEQ). Notre annuaire contient plus de 600 000 entreprises québécoises avec coordonnées complètes et informations détaillées.'
    },
    {
      q: 'Qu\'est-ce que le NEQ?',
      a: 'Le NEQ (Numéro d\'entreprise du Québec) est un identifiant unique à 10 chiffres attribué par le Registraire des entreprises à chaque entreprise enregistrée au Québec.'
    },
    {
      q: 'Comment réclamer la fiche de mon entreprise?',
      a: 'Créez un compte gratuit, connectez-vous, trouvez votre entreprise via la recherche, puis cliquez sur le bouton "Réclamer cette fiche" sur la page de votre entreprise. Notre équipe vous contactera par email ou téléphone pour vérifier votre identité.'
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  // Add new SEO tags
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/faq" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/en/faq" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/faq" />`;

  const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">`;

  const schemaTag = `
    <script type="application/ld+json">
      ${JSON.stringify(faqSchema)}
    </script>`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n${schemaTag}\n</head>`);

  // Generate SSR content
  const faqHtml = faqItems.map((item, index) => `
    <div style="background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a202c; margin-bottom: 0.75rem;">${escapeHtml(item.q)}</h3>
      <p style="line-height: 1.6; color: #4a5568;">${escapeHtml(item.a)}</p>
    </div>
  `).join('');

  const ssrContent = `
  <div class="faq-page" style="max-width: 1000px; margin: 0 auto; padding: 2rem;">
    <header style="text-align: center; margin-bottom: 3rem;">
      <h1 style="font-size: 2.5rem; font-weight: 700; color: #0f4c81; margin-bottom: 0.5rem;">
        ${isEnglish ? 'Frequently Asked Questions (FAQ)' : 'Foire aux questions (FAQ)'}
      </h1>
      <p style="font-size: 1.1rem; color: #718096;">${escapeHtml(description)}</p>
    </header>
    <div class="faq-list">
      ${faqHtml}
    </div>
    <noscript>
      <p style="text-align: center; color: #718096; margin-top: 2rem;">${isEnglish ? 'Please enable JavaScript to view all FAQ questions.' : 'Veuillez activer JavaScript pour voir toutes les questions.'}</p>
    </noscript>
  </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}

// Handle Homepage
async function handleHomePage(req, res, { isEnglish, locale }) {
  const siteName = isEnglish ? 'Quebec Business Registry' : 'Registre du Québec';

  const title = isEnglish
    ? `${siteName} - Find the best local businesses`
    : `${siteName} - Trouvez les meilleurs entreprises locales`;

  const description = isEnglish
    ? 'Discover the best businesses in Quebec. Complete directory with reviews, contact information and detailed data. Over 600,000 Quebec businesses.'
    : 'Découvrez les meilleures entreprises du Québec. Annuaire complet avec avis, coordonnées et informations détaillées. Plus de 600 000 entreprises québécoises.';

  const canonical = `https://registreduquebec.com${isEnglish ? '/?lang=en' : '/'}`;

  // Load template and inject meta tags
  let html = await loadTemplate();

  // Replace title and description
  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content=".*?"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(description)}" />`
    );

  // Remove default OG/Twitter/Geo tags
  html = html
    .replace(/<meta property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="geo\.[^"]*"[^>]*>/gi, '')
    .replace(/<meta name="ICBM"[^>]*>/gi, '')
    .replace(/<meta name="keywords"[^>]*>/gi, '')
    .replace(/<link rel="canonical"[^>]*>/gi, '')
    .replace(/<link rel="alternate" hreflang="[^"]*"[^>]*>/gi, '');

  // Organization & WebSite Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": siteName,
    "url": "https://registreduquebec.com",
    "logo": "https://registreduquebec.com/images/logos/logoblue.webp",
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "QC",
      "addressCountry": "CA"
    }
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "url": "https://registreduquebec.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://registreduquebec.com/recherche?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Add new SEO tags
  const canonicalTag = `    <link rel="canonical" href="${canonical}">`;
  const hreflangTags = `
    <link rel="alternate" hreflang="fr-CA" href="https://registreduquebec.com/" />
    <link rel="alternate" hreflang="en-CA" href="https://registreduquebec.com/?lang=en" />
    <link rel="alternate" hreflang="x-default" href="https://registreduquebec.com/" />`;

  const seoTags = `
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${locale}">
    <meta property="og:site_name" content="${siteName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">`;

  const schemaTag = `
    <script type="application/ld+json">
      ${JSON.stringify(organizationSchema)}
    </script>
    <script type="application/ld+json">
      ${JSON.stringify(webSiteSchema)}
    </script>`;

  html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n${seoTags}\n${schemaTag}\n</head>`);

  // Top cities and categories for SEO
  const topCities = [
    { name: 'Montréal', slug: 'montreal', nameEn: 'Montreal' },
    { name: 'Québec', slug: 'quebec', nameEn: 'Quebec City' },
    { name: 'Laval', slug: 'laval', nameEn: 'Laval' },
    { name: 'Gatineau', slug: 'gatineau', nameEn: 'Gatineau' },
    { name: 'Longueuil', slug: 'longueuil', nameEn: 'Longueuil' },
    { name: 'Sherbrooke', slug: 'sherbrooke', nameEn: 'Sherbrooke' },
    { name: 'Saguenay', slug: 'saguenay', nameEn: 'Saguenay' },
    { name: 'Lévis', slug: 'levis', nameEn: 'Levis' },
    { name: 'Trois-Rivières', slug: 'trois-rivieres', nameEn: 'Trois-Rivieres' },
    { name: 'Terrebonne', slug: 'terrebonne', nameEn: 'Terrebonne' },
    { name: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu', nameEn: 'Saint-Jean-sur-Richelieu' },
    { name: 'Repentigny', slug: 'repentigny', nameEn: 'Repentigny' }
  ];

  const topCategories = [
    { name: 'Restauration et alimentation', slug: 'restauration-et-alimentation', nameEn: 'Food & Dining' },
    { name: 'Construction et rénovation', slug: 'construction-et-renovation', nameEn: 'Construction & Renovation' },
    { name: 'Services professionnels', slug: 'services-professionnels', nameEn: 'Professional Services' },
    { name: 'Commerce de détail', slug: 'commerce-de-detail', nameEn: 'Retail' },
    { name: 'Immobilier', slug: 'immobilier', nameEn: 'Real Estate' },
    { name: 'Santé et bien-être', slug: 'sante-et-bien-etre', nameEn: 'Health & Wellness' },
    { name: 'Finance, assurance et juridique', slug: 'finance-assurance-et-juridique', nameEn: 'Finance, Insurance & Legal' },
    { name: 'Technologie et informatique', slug: 'technologie-et-informatique', nameEn: 'Technology & IT' },
    { name: 'Automobile et transport', slug: 'automobile-et-transport', nameEn: 'Automotive & Transportation' },
    { name: 'Tourisme et hébergement', slug: 'tourisme-et-hebergement', nameEn: 'Tourism & Accommodation' },
    { name: 'Arts, médias et divertissement', slug: 'arts-medias-et-divertissement', nameEn: 'Arts, Media & Entertainment' },
    { name: 'Éducation et formation', slug: 'education-et-formation', nameEn: 'Education & Training' }
  ];

  // Generate SSR content for homepage with full internal linking
  const ssrContent = `
  <div class="home-page" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
    <!-- Hero Section -->
    <div class="hero" style="text-align: center; padding: 4rem 2rem; background: linear-gradient(135deg, #0f4c81 0%, #1e88e5 100%); color: white;">
      <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2;">
        ${isEnglish ? 'Find Quebec Businesses' : 'Trouvez des entreprises au Québec'}
      </h1>
      <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.95;">
        ${isEnglish
          ? 'Over 600,000 businesses with complete information'
          : 'Plus de 600 000 entreprises avec informations complètes'
        }
      </p>
      <div style="max-width: 600px; margin: 0 auto;">
        <p style="font-size: 0.95rem; opacity: 0.9;">
          ${isEnglish
            ? 'Search by business name, category, city or NEQ number'
            : 'Recherchez par nom d\'entreprise, catégorie, ville ou numéro NEQ'
          }
        </p>
      </div>
    </div>

    <!-- Popular Cities Section -->
    <div style="max-width: 1200px; margin: 3rem auto; padding: 0 2rem;">
      <h2 style="font-size: 2rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; text-align: center;">
        ${isEnglish ? 'Browse by City' : 'Parcourir par ville'}
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 3rem;">
        ${topCities.map(city => `
          <a href="${isEnglish ? '/en' : ''}/ville/${city.slug}"
             style="display: block; padding: 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f4c81; font-weight: 500; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
             onmouseover="this.style.borderColor='#0f4c81'; this.style.boxShadow='0 4px 12px rgba(15,76,129,0.15)'"
             onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'">
            <span style="font-size: 1.1rem;">${isEnglish ? city.nameEn : city.name}</span>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Popular Categories Section -->
    <div style="max-width: 1200px; margin: 3rem auto; padding: 0 2rem; background: #f7fafc; padding: 3rem 2rem; border-radius: 12px;">
      <h2 style="font-size: 2rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; text-align: center;">
        ${isEnglish ? 'Browse by Category' : 'Parcourir par catégorie'}
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
        ${topCategories.map(cat => `
          <a href="${isEnglish ? '/en' : ''}/categorie/${cat.slug}"
             style="display: block; padding: 1.25rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f4c81; font-weight: 500; transition: all 0.2s;"
             onmouseover="this.style.borderColor='#0f4c81'; this.style.boxShadow='0 4px 12px rgba(15,76,129,0.15)'"
             onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
            <span style="font-size: 1.05rem;">${isEnglish ? cat.nameEn : cat.name}</span>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- About Section -->
    <div style="max-width: 1000px; margin: 3rem auto; padding: 0 2rem;">
      <h2 style="font-size: 2rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; text-align: center;">
        ${isEnglish ? 'About Quebec Business Registry' : 'À propos du Registre du Québec'}
      </h2>
      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); line-height: 1.7; color: #4a5568;">
        <p style="margin-bottom: 1rem; font-size: 1.05rem;">
          ${isEnglish
            ? 'The Quebec Business Registry is the most comprehensive directory of Quebec businesses. Our database contains over 600,000 companies with detailed information including contact details, addresses, NEQ numbers, and business descriptions.'
            : 'Le Registre du Québec est l\'annuaire le plus complet des entreprises québécoises. Notre base de données contient plus de 600 000 entreprises avec des informations détaillées incluant les coordonnées, adresses, numéros NEQ et descriptions d\'entreprise.'
          }
        </p>
        <p style="margin-bottom: 1rem; font-size: 1.05rem;">
          ${isEnglish
            ? 'Whether you\'re looking for a local restaurant in Montreal, a construction company in Quebec City, or professional services in Laval, our platform makes it easy to find and connect with businesses across Quebec.'
            : 'Que vous recherchiez un restaurant local à Montréal, une entreprise de construction à Québec ou des services professionnels à Laval, notre plateforme facilite la recherche et la connexion avec les entreprises à travers le Québec.'
          }
        </p>
        <div style="margin-top: 2rem; text-align: center;">
          <a href="${isEnglish ? '/en/about' : '/a-propos'}"
             style="display: inline-block; padding: 0.75rem 2rem; background: #0f4c81; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; transition: all 0.2s;"
             onmouseover="this.style.background='#1e88e5'"
             onmouseout="this.style.background='#0f4c81'">
            ${isEnglish ? 'Learn More' : 'En savoir plus'}
          </a>
        </div>
      </div>
    </div>

    <!-- Blog Section -->
    <div style="max-width: 1200px; margin: 3rem auto; padding: 0 2rem;">
      <h2 style="font-size: 2rem; font-weight: 700; color: #1a202c; margin-bottom: 1.5rem; text-align: center;">
        ${isEnglish ? 'Latest Articles' : 'Derniers articles'}
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        <a href="${isEnglish ? '/en/blog' : '/blogue'}/neq-quebec-tout-savoir-numero-entreprise"
           style="display: block; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none; transition: all 0.2s;"
           onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.transform='translateY(-4px)'"
           onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)'">
          <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a202c; margin-bottom: 0.75rem;">
              ${isEnglish ? 'Quebec NEQ: Everything About the Quebec Enterprise Number' : 'NEQ Québec : tout savoir sur le numéro d\'entreprise du Québec'}
            </h3>
            <p style="color: #718096; line-height: 1.6; font-size: 0.95rem;">
              ${isEnglish
                ? 'Complete guide to understand and obtain your NEQ number in Quebec.'
                : 'Guide complet pour comprendre et obtenir votre numéro NEQ au Québec.'
              }
            </p>
          </div>
        </a>
        <a href="${isEnglish ? '/en/blog' : '/blogue'}/comment-reclamer-fiche-entreprise-registre-quebec"
           style="display: block; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none; transition: all 0.2s;"
           onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.transform='translateY(-4px)'"
           onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)'">
          <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a202c; margin-bottom: 0.75rem;">
              ${isEnglish ? 'How to Claim Your Business Listing' : 'Comment réclamer votre fiche d\'entreprise'}
            </h3>
            <p style="color: #718096; line-height: 1.6; font-size: 0.95rem;">
              ${isEnglish
                ? 'Learn how to claim and optimize your business listing for better visibility.'
                : 'Apprenez à réclamer et optimiser votre fiche d\'entreprise pour une meilleure visibilité.'
              }
            </p>
          </div>
        </a>
        <a href="${isEnglish ? '/en/blog' : '/blogue'}/top-10-restaurants-montreal-2025"
           style="display: block; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none; transition: all 0.2s;"
           onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'; this.style.transform='translateY(-4px)'"
           onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)'">
          <div style="padding: 1.5rem;">
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #1a202c; margin-bottom: 0.75rem;">
              ${isEnglish ? 'Top 10 Best Restaurants in Montreal 2025' : 'Top 10 des meilleurs restaurants à Montréal 2025'}
            </h3>
            <p style="color: #718096; line-height: 1.6; font-size: 0.95rem;">
              ${isEnglish
                ? 'Discover the best dining experiences in Montreal this year.'
                : 'Découvrez les meilleures expériences culinaires à Montréal cette année.'
              }
            </p>
          </div>
        </a>
      </div>
      <div style="text-align: center; margin-top: 2rem;">
        <a href="${isEnglish ? '/en/blog' : '/blogue'}"
           style="display: inline-block; padding: 0.75rem 2rem; background: #f7fafc; color: #0f4c81; text-decoration: none; border-radius: 6px; font-weight: 600; border: 2px solid #0f4c81; transition: all 0.2s;"
           onmouseover="this.style.background='#0f4c81'; this.style.color='white'"
           onmouseout="this.style.background='#f7fafc'; this.style.color='#0f4c81'">
          ${isEnglish ? 'View All Articles' : 'Voir tous les articles'}
        </a>
      </div>
    </div>

    <!-- FAQ Quick Links -->
    <div style="max-width: 1000px; margin: 3rem auto; padding: 0 2rem; margin-bottom: 4rem;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3rem 2rem; border-radius: 12px; text-align: center; color: white;">
        <h2 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1rem;">
          ${isEnglish ? 'Questions?' : 'Des questions?'}
        </h2>
        <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.95;">
          ${isEnglish
            ? 'Visit our FAQ for answers to common questions about Quebec businesses.'
            : 'Consultez notre FAQ pour obtenir des réponses aux questions courantes sur les entreprises québécoises.'
          }
        </p>
        <a href="${isEnglish ? '/en/faq' : '/faq'}"
           style="display: inline-block; padding: 0.875rem 2.5rem; background: white; color: #667eea; text-decoration: none; border-radius: 6px; font-weight: 700; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">
          ${isEnglish ? 'View FAQ' : 'Voir la FAQ'}
        </a>
      </div>
    </div>

    <noscript>
      <div style="text-align: center; padding: 2rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; margin: 2rem auto; max-width: 800px;">
        <p style="color: #856404; font-weight: 500;">
          ${isEnglish
            ? 'Please enable JavaScript to search and browse businesses interactively.'
            : 'Veuillez activer JavaScript pour rechercher et parcourir les entreprises de manière interactive.'
          }
        </p>
      </div>
    </noscript>
  </div>`;

  html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

  res.status(200).setHeader('Content-Type', 'text/html').send(html);
}
