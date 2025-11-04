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

  // Question 6: Industry/Category
  const categoryName = isEnglish
    ? (business.main_category_name_en || business.primary_main_category_en)
    : (business.main_category_name_fr || business.primary_main_category_fr);

  if (categoryName && !categoryName.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
    const questionIndustry = isEnglish
      ? `What industry does ${business.name} operate in?`
      : `Dans quel domaine œuvre ${business.name} ?`;
    const answerIndustry = isEnglish
      ? `${business.name} operates in the industry: ${categoryName}.`
      : `${business.name} œuvre dans le domaine : ${categoryName}.`;

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
      .replace(/<meta name="ICBM"[^>]*>/gi, '');

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
  } catch (error) {
    console.error('SEO function error:', error);
    res.status(500).send('Erreur serveur');
  }
}
