/**
 * Category slug translations between French and English
 * Used for bilingual SEO URLs
 */

// French slug -> English slug mapping
export const frToEnCategorySlug = {
  'services-professionnels': 'professional-services',
  'finance-assurance-et-juridique': 'finance-insurance-and-legal',
  'technologie': 'technology',
  'education-et-formation': 'education-and-training',
  'commerce-de-detail': 'retail',
  'construction-et-renovation': 'construction-and-renovation',
  'organismes-publics-et-communautaires': 'public-and-community-organizations',
  'sante-et-bien-etre': 'health-and-wellness',
  'automobile-et-transport': 'automobile-and-transportation',
  'industrie-fabrication-et-logistique': 'manufacturing-and-logistics',
  'construction': 'construction',
  'agriculture-et-environnement': 'agriculture-and-environment',
  'immobilier': 'real-estate',
  'technologie-et-informatique': 'technology-and-it',
  'restauration-et-alimentation': 'food-and-dining',
  'sports-et-loisirs': 'sports-and-recreation',
  'arts-medias-et-divertissement': 'arts-media-and-entertainment',
  'restauration': 'restaurants',
  'soins-a-domicile': 'home-care',
  'transport-et-logistique': 'transportation-and-logistics',
  'hebergement-et-tourisme': 'accommodation-and-tourism',
  'services-aux-entreprises': 'business-services',
  'services-personnels': 'personal-services',
  'services-financiers': 'financial-services',
  'energie-et-ressources-naturelles': 'energy-and-natural-resources',
  'telecommunications': 'telecommunications',
  'agence-web': 'web-agency',
  'agence-immobiliere': 'real-estate-agency',
  'clinique-medicale': 'medical-clinic',
  'cabinet-dentaire': 'dental-office',
  'salon-de-coiffure': 'hair-salon',
  'garage-automobile': 'auto-garage',
  'epicerie': 'grocery-store',
  'pharmacie': 'pharmacy',
  'quincaillerie': 'hardware-store',
  'boutique-vetements': 'clothing-store',
  'restaurant': 'restaurant',
  'cafe': 'cafe',
  'bar': 'bar',
  'hotel': 'hotel',
  'motel': 'motel',
  'entreprise': 'business',
  // Add more as needed
};

// English slug -> French slug mapping (reverse)
export const enToFrCategorySlug = Object.fromEntries(
  Object.entries(frToEnCategorySlug).map(([fr, en]) => [en, fr])
);

/**
 * Translate a category slug from French to English
 * @param {string} frSlug - French category slug
 * @returns {string} - English category slug (or original if not found)
 */
export const translateCategorySlugToEn = (frSlug) => {
  return frToEnCategorySlug[frSlug] || frSlug;
};

/**
 * Translate a category slug from English to French
 * @param {string} enSlug - English category slug
 * @returns {string} - French category slug (or original if not found)
 */
export const translateCategorySlugToFr = (enSlug) => {
  return enToFrCategorySlug[enSlug] || enSlug;
};

/**
 * Check if a slug is a valid English category slug
 * @param {string} slug - Slug to check
 * @returns {boolean}
 */
export const isEnglishCategorySlug = (slug) => {
  return Object.values(frToEnCategorySlug).includes(slug);
};

/**
 * Check if a slug is a valid French category slug
 * @param {string} slug - Slug to check
 * @returns {boolean}
 */
export const isFrenchCategorySlug = (slug) => {
  return Object.keys(frToEnCategorySlug).includes(slug);
};

/**
 * Get the category slug in the specified language
 * @param {string} frSlug - French category slug (from database)
 * @param {string} lang - Target language ('en' or 'fr')
 * @returns {string} - Category slug in target language
 */
export const getCategorySlugForLang = (frSlug, lang) => {
  if (lang === 'en') {
    return translateCategorySlugToEn(frSlug);
  }
  return frSlug;
};
