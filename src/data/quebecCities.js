/**
 * Liste complète des villes du Québec
 * Organisée alphabétiquement pour faciliter la recherche
 */

export const quebecCities = [
  // A
  'Acton Vale',
  'Alma',
  'Amqui',
  'Amos',
  'Anjou',
  'Asbestos',

  // B
  'Baie-Comeau',
  'Baie-D\'Urfé',
  'Baie-Saint-Paul',
  'Barkmere',
  'Beaconsfield',
  'Beauharnois',
  'Beaupré',
  'Bedford',
  'Beloeil',
  'Berthierville',
  'Blainville',
  'Bois-des-Filion',
  'Boisbriand',
  'Bonaventure',
  'Boucherville',
  'Bromont',
  'Brossard',
  'Brownsburg-Chatham',
  'Bécancour',

  // C
  'Candiac',
  'Cap-Chat',
  'Cap-Santé',
  'Carignan',
  'Chambly',
  'Chandler',
  'Charlemagne',
  'Châteauguay',
  'Chibougamau',
  'Chicoutimi',
  'Clerval',
  'Coaticook',
  'Contrecœur',
  'Cookshire-Eaton',
  'Coteau-du-Lac',
  'Cowansville',

  // D
  'Danville',
  'Dégelis',
  'Delson',
  'Desbiens',
  'Deux-Montagnes',
  'Dolbeau-Mistassini',
  'Donnacona',
  'Drummondville',
  'Dunham',

  // F
  'Farnham',
  'Fermont',
  'Forestville',
  'Fort-Coulonge',

  // G
  'Gaspé',
  'Gatineau',
  'Gracefield',
  'Granby',
  'Grande-Rivière',
  'Grande-Vallée',
  'Greenfield Park',
  'Grenville-sur-la-Rouge',

  // H
  'Hampstead',
  'Hudson',
  'Huntingdon',

  // J
  'Joliette',

  // K
  'Kirkland',
  'Kuujjuaq',

  // L
  'L\'Assomption',
  'L\'Épiphanie',
  'L\'Île-Cadieux',
  'L\'Île-Dorval',
  'L\'Île-Perrot',
  'La Malbaie',
  'La Pocatière',
  'La Prairie',
  'La Sarre',
  'Lac-Brome',
  'Lac-Delage',
  'Lac-Mégantic',
  'Lac-Saint-Joseph',
  'Lachine',
  'Lachute',
  'Laval',
  'Lavaltrie',
  'Longueuil',
  'Lorrainville',
  'Louiseville',
  'Lévis',

  // M
  'Macamic',
  'Magog',
  'Malartic',
  'Maniwaki',
  'Marieville',
  'Mascouche',
  'Matagami',
  'Matane',
  'Mercier',
  'Mirabel',
  'Mont-Joli',
  'Mont-Laurier',
  'Mont-Saint-Hilaire',
  'Mont-Saint-Pierre',
  'Mont-Tremblant',
  'Montmagny',
  'Montréal',
  'Métabetchouan–Lac-à-la-Croix',

  // N
  'Nicolet',
  'Normandin',

  // O
  'Otterburn Park',

  // P
  'Paspébiac',
  'Percé',
  'Pincourt',
  'Plessisville',
  'Pointe-Claire',
  'Pont-Rouge',
  'Port-Cartier',
  'Portneuf',
  'Prévost',

  // R
  'Rawdon',
  'Repentigny',
  'Rimouski',
  'Rivière-du-Loup',
  'Roberval',
  'Rouyn-Noranda',

  // S
  'Saguenay',
  'Saint-Augustin-de-Desmaures',
  'Saint-Basile',
  'Saint-Bruno-de-Montarville',
  'Saint-Colomban',
  'Saint-Constant',
  'Saint-Césaire',
  'Saint-Eustache',
  'Saint-Félicien',
  'Saint-Gabriel',
  'Saint-Georges',
  'Saint-Hyacinthe',
  'Saint-Jean-sur-Richelieu',
  'Saint-Jérôme',
  'Saint-Lambert',
  'Saint-Lazare',
  'Saint-Lin–Laurentides',
  'Saint-Marc-des-Carrières',
  'Saint-Pascal',
  'Saint-Pie',
  'Saint-Raymond',
  'Saint-Sauveur',
  'Saint-Tite',
  'Sainte-Adèle',
  'Sainte-Agathe-des-Monts',
  'Sainte-Anne-de-Beaupré',
  'Sainte-Anne-de-Bellevue',
  'Sainte-Anne-des-Plaines',
  'Sainte-Catherine',
  'Sainte-Julie',
  'Sainte-Marguerite-du-Lac-Masson',
  'Sainte-Marie',
  'Sainte-Marthe-sur-le-Lac',
  'Sainte-Thérèse',
  'Salaberry-de-Valleyfield',
  'Senneterre',
  'Sept-Îles',
  'Shawinigan',
  'Sherbrooke',
  'Sorel-Tracy',

  // T
  'Terrebonne',
  'Thetford Mines',
  'Thurso',
  'Trois-Pistoles',
  'Trois-Rivières',
  'Témiscaming',

  // V
  'Val-d\'Or',
  'Val-des-Sources',
  'Valcourt',
  'Varennes',
  'Vaudreuil-Dorion',
  'Victoriaville',
  'Ville-Marie',

  // W
  'Warwick',
  'Waterloo',
  'Waterville',
  'Westmount'
];

/**
 * Fonction pour rechercher une ville
 * @param {string} query - Terme de recherche
 * @returns {Array} - Liste des villes correspondantes
 */
export const searchCities = (query) => {
  if (!query || query.trim() === '') {
    return quebecCities;
  }

  const normalizedQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return quebecCities.filter(city => {
    const normalizedCity = city
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return normalizedCity.includes(normalizedQuery);
  });
};

/**
 * Fonction pour valider si une ville existe
 * @param {string} city - Nom de la ville
 * @returns {boolean} - True si la ville existe
 */
export const isValidCity = (city) => {
  return quebecCities.includes(city);
};
