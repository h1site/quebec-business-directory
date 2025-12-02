// Mapping between French slugs (database) and English slugs (URLs)
// French slug -> English slug
export const categorySlugsFrToEn: Record<string, string> = {
  'agriculture-et-environnement': 'agriculture-environment',
  'arts-medias-et-divertissement': 'arts-media-entertainment',
  'automobile-et-transport': 'automotive-transportation',
  'commerce-de-detail': 'retail',
  'construction-et-renovation': 'construction-renovation',
  'education-et-formation': 'education-training',
  'finance-assurance-et-juridique': 'finance-insurance-legal',
  'immobilier': 'real-estate',
  'industrie-fabrication-et-logistique': 'manufacturing-logistics',
  'maison-et-services-domestiques': 'home-domestic-services',
  'organismes-publics-et-communautaires': 'public-community-organizations',
  'restauration-et-alimentation': 'restaurants-food',
  'sante-et-bien-etre': 'health-wellness',
  'services-funeraires': 'funeral-services',
  'services-professionnels': 'professional-services',
  'soins-a-domicile': 'home-care',
  'sports-et-loisirs': 'sports-recreation',
  'technologie-et-informatique': 'technology-it',
  'tourisme-et-hebergement': 'tourism-lodging',
}

// English slug -> French slug (reverse mapping)
export const categorySlugEnToFr: Record<string, string> = Object.fromEntries(
  Object.entries(categorySlugsFrToEn).map(([fr, en]) => [en, fr])
)

// Category icons (same for both languages, keyed by French slug)
export const categoryIcons: Record<string, string> = {
  'agriculture-et-environnement': '🌾',
  'arts-medias-et-divertissement': '🎨',
  'automobile-et-transport': '🚗',
  'commerce-de-detail': '🛒',
  'construction-et-renovation': '🏗️',
  'education-et-formation': '📚',
  'finance-assurance-et-juridique': '💼',
  'immobilier': '🏠',
  'industrie-fabrication-et-logistique': '🏭',
  'maison-et-services-domestiques': '🏡',
  'organismes-publics-et-communautaires': '🏛️',
  'restauration-et-alimentation': '🍽️',
  'sante-et-bien-etre': '🏥',
  'services-funeraires': '⚱️',
  'services-professionnels': '👔',
  'soins-a-domicile': '🩺',
  'sports-et-loisirs': '⚽',
  'technologie-et-informatique': '💻',
  'tourisme-et-hebergement': '🏨',
}

// Get icon by French slug
export function getCategoryIcon(frenchSlug: string): string {
  return categoryIcons[frenchSlug] || '📁'
}

// Get icon by English slug
export function getCategoryIconByEnSlug(englishSlug: string): string {
  const frenchSlug = categorySlugEnToFr[englishSlug]
  return categoryIcons[frenchSlug] || '📁'
}

// Convert French slug to English
export function toEnglishSlug(frenchSlug: string): string {
  return categorySlugsFrToEn[frenchSlug] || frenchSlug
}

// Convert English slug to French
export function toFrenchSlug(englishSlug: string): string {
  return categorySlugEnToFr[englishSlug] || englishSlug
}
