/**
 * URL Validator - Validates business URLs and generates 301 redirects
 * Fixes the issue where /anything/city/slug works even with invalid categories
 */

import { getCategorySlugForLang, translateCategorySlugToFr, translateCategorySlugToEn } from './categoryTranslations';

/**
 * Validate if a category slug is real
 * @param {string} categorySlug - Category slug to validate
 * @param {Array} validCategories - Array of valid category slugs from database
 * @returns {boolean}
 */
export const isValidCategorySlug = (categorySlug, validCategories = []) => {
  if (!categorySlug) return false;

  // 'entreprise' is always valid (default/fallback)
  if (categorySlug === 'entreprise') return true;

  // Check against valid categories list
  return validCategories.includes(categorySlug);
};

/**
 * Validate if a city slug matches the business city
 * @param {string} citySlug - City slug from URL
 * @param {string} businessCity - Actual business city name
 * @returns {boolean}
 */
export const isValidCitySlug = (citySlug, businessCity) => {
  if (!citySlug || !businessCity) return false;

  // Generate expected slug from business city
  const expectedSlug = businessCity
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return citySlug === expectedSlug;
};

/**
 * Validate business URL structure
 * @param {Object} params - URL params {categorySlug, citySlug, slug}
 * @param {Object} business - Business data from database
 * @param {Array} validCategories - Array of valid category slugs
 * @returns {Object} - {isValid, correctUrl, redirectNeeded}
 */
export const validateBusinessUrl = (params, business, validCategories = []) => {
  if (!business) {
    return { isValid: false, redirectNeeded: false, correctUrl: null };
  }

  const { categorySlug, citySlug, slug } = params;

  // Legacy format: /entreprise/:slug (no category or city)
  const isLegacyFormat = !categorySlug && !citySlug && slug;

  if (isLegacyFormat) {
    // This is a legacy URL, needs redirect
    return {
      isValid: false,
      redirectNeeded: true,
      correctUrl: getCorrectBusinessUrl(business),
      reason: 'legacy_format'
    };
  }

  // New format validation: /:categorySlug/:citySlug/:slug
  if (categorySlug && citySlug && slug) {
    // Check if business slug matches
    if (business.slug !== slug) {
      return {
        isValid: false,
        redirectNeeded: true,
        correctUrl: getCorrectBusinessUrl(business),
        reason: 'wrong_slug'
      };
    }

    // Check if category is valid (support both FR and EN slugs)
    const expectedCategorySlugFr = business.main_category_slug || 'entreprise';
    const expectedCategorySlugEn = translateCategorySlugToEn(expectedCategorySlugFr);

    // Accept either French or English category slug
    if (categorySlug !== expectedCategorySlugFr && categorySlug !== expectedCategorySlugEn) {
      return {
        isValid: false,
        redirectNeeded: true,
        correctUrl: getCorrectBusinessUrl(business),
        reason: 'wrong_category'
      };
    }

    // Check if city matches
    if (!isValidCitySlug(citySlug, business.city)) {
      return {
        isValid: false,
        redirectNeeded: true,
        correctUrl: getCorrectBusinessUrl(business),
        reason: 'wrong_city'
      };
    }

    // All checks passed
    return {
      isValid: true,
      redirectNeeded: false,
      correctUrl: null
    };
  }

  // Invalid format
  return {
    isValid: false,
    redirectNeeded: true,
    correctUrl: getCorrectBusinessUrl(business),
    reason: 'invalid_format'
  };
};

/**
 * Generate the correct business URL
 * @param {Object} business - Business object
 * @param {string} lang - Language (en/fr)
 * @returns {string}
 */
export const getCorrectBusinessUrl = (business, lang = 'fr') => {
  if (!business) return '/';

  const categorySlugFr = business.main_category_slug || 'entreprise';
  // Translate category slug to target language
  const categorySlug = getCategorySlugForLang(categorySlugFr, lang);

  const citySlug = business.city
    ? business.city.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : 'quebec';
  const businessSlug = business.slug || business.name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);

  const baseUrl = `/${categorySlug}/${citySlug}/${businessSlug}`;
  return lang === 'en' ? `/en${baseUrl}` : baseUrl;
};

/**
 * Check if URL needs canonical redirect
 * Used in BusinessDetails to redirect invalid URLs to correct ones
 * @param {string} currentPath - Current URL path
 * @param {Object} business - Business data
 * @returns {Object} - {needsRedirect, correctUrl}
 */
export const checkUrlRedirect = (currentPath, business) => {
  if (!business) return { needsRedirect: false };

  // Extract language
  const isEnglish = currentPath.startsWith('/en/');
  const lang = isEnglish ? 'en' : 'fr';

  // Get correct URL with language-specific category slug
  const correctUrl = getCorrectBusinessUrl(business, lang);

  // Remove trailing slash for comparison
  const normalizedCurrentPath = currentPath.replace(/\/$/, '');
  const normalizedCorrectPath = correctUrl.replace(/\/$/, '');

  if (normalizedCurrentPath !== normalizedCorrectPath) {
    return {
      needsRedirect: true,
      correctUrl: correctUrl
    };
  }

  return { needsRedirect: false };
};
