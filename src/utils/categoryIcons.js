// Mapping des icônes par slug de catégorie (fichiers SVG)
export const categoryIcons = {
  'agriculture-et-environnement': 'agriculture.svg',
  'arts-medias-et-divertissement': 'art.svg',
  'automobile-et-transport': 'automobile.svg',
  'commerce-de-detail': 'commerce.svg',
  'construction-et-renovation': 'construction.svg',
  'education-et-formation': 'education.svg',
  'finance-assurance-et-juridique': 'finance.svg',
  'immobilier': 'immobilier.svg',
  'industrie-fabrication-et-logistique': 'industrie.svg',
  'maison-et-services-domestiques': 'maison.svg',
  'organismes-publics-et-communautaires': 'organismes.svg',
  'restauration-et-alimentation': 'restauration.svg',
  'sante-et-bien-etre': 'sante.svg',
  'services-funeraires': 'funeraire.svg',
  'services-professionnels': 'services.svg',
  'soins-a-domicile': 'soins.svg',
  'sports-et-loisirs': 'sports.svg',
  'technologie-et-informatique': 'technologie.svg',
  'tourisme-et-hebergement': 'tourisme.svg'
};

export const getCategoryIcon = (slug) => {
  return categoryIcons[slug] || null;
};

export const getCategoryIconPath = (slug) => {
  const icon = getCategoryIcon(slug);
  return icon ? `/images/icons/${icon}` : null;
};
