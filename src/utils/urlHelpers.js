/**
 * URL Helpers for SEO-friendly business URLs
 *
 * New format: /category-slug/city-slug/business-slug
 * Example: /agence-web/vaudreuil-dorion/h1site-web-design-agence-marketing
 */

/**
 * Generate a slug from text (lowercase, no accents, hyphens)
 */
export const generateSlug = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
};

/**
 * Generate SEO-friendly URL for a business
 * @param {Object} business - Business object with category, city, and slug
 * @param {string} lang - Language code ('fr' or 'en'), auto-detected from URL if not provided
 * @returns {string} - SEO URL like /agence-web/vaudreuil-dorion/business-slug or /en/agence-web/vaudreuil-dorion/business-slug
 */
export const getBusinessUrl = (business, lang = null) => {
  if (!business) return '/';

  // Auto-detect language from current URL if not provided
  if (!lang) {
    const currentPath = window.location.pathname;
    lang = (currentPath === '/en' || currentPath.startsWith('/en/')) ? 'en' : 'fr';
  }

  // Get category slug (from main_category or first sub_category)
  let categorySlug = 'entreprise'; // Default fallback

  if (business.main_category_slug) {
    // CRITICAL: Ensure it's a valid slug (some old data has French names instead of slugs)
    // If it contains spaces or accents, slugify it
    categorySlug = business.main_category_slug.includes(' ') || /[À-ÿ]/.test(business.main_category_slug)
      ? generateSlug(business.main_category_slug)
      : business.main_category_slug;
  } else if (business.categories && business.categories.length > 0 && business.categories[0]) {
    // Use first category if available and not undefined
    categorySlug = generateSlug(business.categories[0]);
  }

  // Get city slug
  const citySlug = generateSlug(business.city || 'quebec');

  // Get business slug - ensure it's never undefined
  const businessSlug = business.slug || generateSlug(business.name) || 'unknown';

  const baseUrl = `/${categorySlug}/${citySlug}/${businessSlug}`;

  // Add language prefix for English
  return lang === 'en' ? `/en${baseUrl}` : baseUrl;
};

/**
 * Generate edit URL for a business
 * @param {Object} business - Business object
 * @param {string} lang - Language code ('fr' or 'en'), auto-detected from URL if not provided
 * @returns {string} - Edit URL with /modifier (FR) or /edit (EN) suffix
 */
export const getBusinessEditUrl = (business, lang = null) => {
  // Auto-detect language from current URL if not provided
  if (!lang) {
    const currentPath = window.location.pathname;
    lang = (currentPath === '/en' || currentPath.startsWith('/en/')) ? 'en' : 'fr';
  }

  const baseUrl = getBusinessUrl(business, lang);
  const editSuffix = lang === 'en' ? '/edit' : '/modifier';

  return `${baseUrl}${editSuffix}`;
};

/**
 * Parse SEO URL parameters
 * @param {Object} params - React Router params {categorySlug, citySlug, slug}
 * @returns {Object} - Parsed params
 */
export const parseSeoUrlParams = (params) => {
  return {
    categorySlug: params.categorySlug || null,
    citySlug: params.citySlug || null,
    businessSlug: params.slug
  };
};

/**
 * Check if URL is legacy format (/entreprise/slug)
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export const isLegacyUrl = (pathname) => {
  return pathname.startsWith('/entreprise/');
};

/**
 * Convert legacy URL to new SEO format
 * @param {string} legacyUrl - Legacy URL like /entreprise/slug
 * @param {Object} business - Business object with category and city
 * @returns {string} - New SEO URL
 */
export const convertLegacyToSeoUrl = (legacyUrl, business) => {
  if (!isLegacyUrl(legacyUrl) || !business) {
    return legacyUrl;
  }

  return getBusinessUrl(business);
};

/**
 * Generate breadcrumb data for SEO
 * @param {Object} business - Business object
 * @returns {Array} - Breadcrumb items
 */
export const getBusinessBreadcrumbs = (business) => {
  if (!business) return [];

  const categorySlug = business.main_category_slug ||
                       (business.categories && business.categories[0]) ||
                       'entreprise';
  const citySlug = generateSlug(business.city || 'quebec');

  return [
    { label: 'Accueil', url: '/' },
    { label: business.main_category_name || 'Entreprises', url: `/categorie/${categorySlug}` },
    { label: business.city || 'Québec', url: `/ville/${citySlug}` },
    { label: business.name, url: getBusinessUrl(business) }
  ];
};

/**
 * Format city name for URL (remove common suffixes)
 * Examples:
 * - "Vaudreuil-Dorion" -> "vaudreuil-dorion"
 * - "Montréal" -> "montreal"
 * - "Québec" -> "quebec"
 */
export const formatCityForUrl = (city) => {
  if (!city) return 'quebec';

  return generateSlug(city);
};

/**
 * Format category name for URL
 * Examples:
 * - "Agence Web & Marketing" -> "agence-web-marketing"
 * - "Services Professionnels" -> "services-professionnels"
 */
export const formatCategoryForUrl = (category) => {
  if (!category) return 'entreprise';

  return generateSlug(category);
};
