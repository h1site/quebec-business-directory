export const cityMappings: Record<string, string> = {
  'montreal': 'Montréal',
  'quebec': 'Québec',
  'laval': 'Laval',
  'gatineau': 'Gatineau',
  'longueuil': 'Longueuil',
  'sherbrooke': 'Sherbrooke',
  'saguenay': 'Saguenay',
  'levis': 'Lévis',
  'trois-rivieres': 'Trois-Rivières',
  'terrebonne': 'Terrebonne',
  'saint-jean-sur-richelieu': 'Saint-Jean-sur-Richelieu',
  'repentigny': 'Repentigny',
  'brossard': 'Brossard',
  'drummondville': 'Drummondville',
  'saint-jerome': 'Saint-Jérôme',
  'granby': 'Granby',
  'blainville': 'Blainville',
  'saint-hyacinthe': 'Saint-Hyacinthe',
  'shawinigan': 'Shawinigan',
  'dollard-des-ormeaux': 'Dollard-Des Ormeaux',
  'rimouski': 'Rimouski',
  'victoriaville': 'Victoriaville',
  'saint-eustache': 'Saint-Eustache',
  'mascouche': 'Mascouche',
  'chicoutimi': 'Chicoutimi',
  'vaudreuil-dorion': 'Vaudreuil-Dorion',
  'saint-laurent': 'Saint-Laurent',
  'sorel-tracy': 'Sorel-Tracy',
  'joliette': 'Joliette',
  'alma': 'Alma',
  'magog': 'Magog',
  'riviere-du-loup': 'Rivière-du-Loup',
  'thetford-mines': 'Thetford Mines',
  'val-d-or': "Val-d'Or",
  'rouyn-noranda': 'Rouyn-Noranda',
  'baie-comeau': 'Baie-Comeau',
  'sept-iles': 'Sept-Îles',
}

export function slugToCity(slug: string): string {
  if (cityMappings[slug]) return cityMappings[slug]
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const popularCities = [
  { name: 'Montréal', slug: 'montreal' },
  { name: 'Québec', slug: 'quebec' },
  { name: 'Laval', slug: 'laval' },
  { name: 'Gatineau', slug: 'gatineau' },
  { name: 'Longueuil', slug: 'longueuil' },
  { name: 'Sherbrooke', slug: 'sherbrooke' },
  { name: 'Trois-Rivières', slug: 'trois-rivieres' },
  { name: 'Saguenay', slug: 'saguenay' },
  { name: 'Lévis', slug: 'levis' },
  { name: 'Terrebonne', slug: 'terrebonne' },
  { name: 'Drummondville', slug: 'drummondville' },
  { name: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu' },
]
