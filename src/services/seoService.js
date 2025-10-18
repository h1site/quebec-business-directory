/**
 * SEO Service - Handles meta tags, schema markup, and SEO optimization
 */

/**
 * Update document title and meta tags
 * @param {Object} options - SEO options
 */
export const updateMetaTags = ({ title, description, keywords, image, url }) => {
  // Update title
  if (title) {
    document.title = title;
    updateMetaTag('og:title', title);
    updateMetaTag('twitter:title', title);
  }

  // Update description
  if (description) {
    updateMetaTag('description', description);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:description', description);
  }

  // Update keywords
  if (keywords) {
    updateMetaTag('keywords', keywords);
  }

  // Update image
  if (image) {
    updateMetaTag('og:image', image);
    updateMetaTag('twitter:image', image);
  }

  // Update URL
  if (url) {
    updateMetaTag('og:url', url);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = url;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }
  }
};

/**
 * Helper to update or create meta tag
 */
const updateMetaTag = (name, content) => {
  const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

/**
 * Generate LocalBusiness schema markup
 * @param {Object} business - Business data
 * @returns {Object} - Schema markup object
 */
export const generateLocalBusinessSchema = (business) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    image: business.logo_url || business.gallery_images?.[0],
    '@id': window.location.href,
    url: window.location.href,
    telephone: business.phone,
    email: business.show_email ? business.email : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.province || 'QC',
      postalCode: business.postal_code,
      addressCountry: 'CA'
    }
  };

  // Add founding date if available
  if (business.established_year) {
    schema.foundingDate = business.established_year.toString();
  }

  // Add service area
  if (business.service_area) {
    schema.areaServed = {
      '@type': 'Place',
      name: business.service_area
    };
  }

  // Add opening hours if available
  if (business.opening_hours) {
    schema.openingHours = business.opening_hours;
  }

  // Add price range if available
  if (business.price_range) {
    schema.priceRange = business.price_range;
  }

  // Add additional images
  if (business.gallery_images && business.gallery_images.length > 0) {
    schema.image = business.gallery_images;
  }

  // Add same as (social media links)
  if (business.website) {
    schema.sameAs = [business.website];
  }

  return schema;
};

/**
 * Inject schema markup into page
 * @param {Object} schema - Schema markup object
 */
export const injectSchemaMarkup = (schema) => {
  // Remove existing schema if present
  const existingScript = document.getElementById('schema-markup');
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.id = 'schema-markup';
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema, null, 2);
  document.head.appendChild(script);
};

/**
 * Generate SEO-friendly URL slug
 * @param {string} category - Category name
 * @param {string} city - City name
 * @param {string} businessName - Business name
 * @returns {string} - SEO-optimized URL path
 */
export const generateSEOUrl = (category, city, businessName) => {
  const slugify = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100);
  };

  return `/${slugify(category)}/${slugify(city)}/${slugify(businessName)}`;
};

/**
 * Generate meta title for business page
 * @param {Object} business - Business data
 * @returns {string} - Optimized meta title
 */
export const generateBusinessMetaTitle = (business) => {
  const parts = [
    business.name,
    business.city,
    business.main_category_name || 'Services',
    '| Registre d\'entreprise du Québec'
  ];
  return parts.filter(Boolean).join(' - ');
};

/**
 * Generate meta description for business page
 * @param {Object} business - Business data
 * @returns {string} - Optimized meta description
 */
export const generateBusinessMetaDescription = (business) => {
  const description = business.description.substring(0, 140);
  const location = `${business.city}, ${business.province || 'QC'}`;
  return `${description}... Situé à ${location}. ${business.phone ? `Téléphone: ${business.phone}` : ''} | Registre d'entreprise du Québec`;
};

/**
 * Generate keywords for business page
 * @param {Object} business - Business data
 * @returns {string} - SEO keywords
 */
export const generateBusinessKeywords = (business) => {
  const keywords = [
    business.name,
    business.city,
    business.province || 'Québec',
    business.main_category_name,
    ...(business.sub_category_names || [])
  ];
  return keywords.filter(Boolean).join(', ');
};

/**
 * Generate BreadcrumbList schema
 * @param {Array} breadcrumbs - Array of breadcrumb items {name, url}
 * @returns {Object} - BreadcrumbList schema
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
};
