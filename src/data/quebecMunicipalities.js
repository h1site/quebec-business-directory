/**
 * Complete Quebec Municipalities Data Structure
 * Organized by Administrative Region > MRC > Municipalities
 *
 * This allows intelligent searching where:
 * - User types "Vaudreuil-Dorion" → finds it in Vaudreuil-Soulanges (MRC) → Montérégie (Region)
 * - Search includes region, MRC, and city names
 * - Autocomplete provides context (City, MRC, Region)
 */

export const quebecMunicipalities = {
  '01-bas-saint-laurent': {
    name: 'Bas-Saint-Laurent',
    code: '01',
    slug: 'bas-saint-laurent',
    mrcs: {
      kamouraska: {
        name: 'Kamouraska',
        cities: ['Kamouraska', 'Saint-Pascal', 'La Pocatière', 'Saint-Alexandre-de-Kamouraska', 'Saint-André', 'Saint-Bruno-de-Kamouraska', 'Saint-Denis-De La Bouteillerie', 'Saint-Germain', 'Saint-Joseph-de-Kamouraska', 'Sainte-Anne-de-la-Pocatière', 'Sainte-Hélène-de-Kamouraska', 'Mont-Carmel', 'Notre-Dame-du-Portage', 'Rivière-Ouelle', 'Saint-Onésime-d\'Ixworth', 'Saint-Pacôme']
      },
      'riviere-du-loup': {
        name: 'Rivière-du-Loup',
        cities: ['Rivière-du-Loup', 'Cacouna', 'L\'Isle-Verte', 'Notre-Dame-des-Sept-Douleurs', 'Notre-Dame-du-Portage', 'Saint-Antonin', 'Saint-Arsène', 'Saint-Épiphane', 'Saint-François-Xavier-de-Viger', 'Saint-Hubert-Rivière-du-Loup', 'Saint-Modeste']
      },
      temiscouata: {
        name: 'Témiscouata',
        cities: ['Témiscouata-sur-le-Lac', 'Cabano', 'Dégelis', 'Notre-Dame-du-Lac', 'Pohénégamook', 'Auclair', 'Biencourt', 'Lac-des-Aigles', 'Lejeune', 'Packington', 'Saint-Athanase', 'Saint-Eusèbe', 'Saint-Honoré-de-Témiscouata', 'Saint-Juste-du-Lac', 'Saint-Louis-du-Ha! Ha!', 'Saint-Marc-du-Lac-Long', 'Saint-Michel-du-Squatec', 'Saint-Pierre-de-Lamy', 'Squatec', 'Trinité-des-Monts']
      },
      'les-basques': {
        name: 'Les Basques',
        cities: ['Trois-Pistoles', 'Notre-Dame-des-Neiges', 'Saint-Clément', 'Saint-Éloi', 'Saint-Francois-Xavier-de-Viger', 'Saint-Guy', 'Saint-Jean-de-Dieu', 'Saint-Mathieu-de-Rioux', 'Saint-Médard', 'Saint-Simon']
      },
      'rimouski-neigette': {
        name: 'Rimouski-Neigette',
        cities: ['Rimouski', 'Esprit-Saint', 'La Trinité-des-Monts', 'Le Bic', 'Rimouski-Est', 'Sainte-Blandine', 'Sainte-Odile-sur-Rimouski', 'Saint-Anaclet-de-Lessard', 'Saint-Eugène-de-Ladrière', 'Saint-Fabien', 'Saint-Marcellin', 'Saint-Narcisse-de-Rimouski', 'Saint-Valérien']
      },
      'la-mitis': {
        name: 'La Mitis',
        cities: ['Mont-Joli', 'Price', 'Métis-sur-Mer', 'Grand-Métis', 'Les Hauteurs', 'Padoue', 'Saint-Charles-Garnier', 'Sainte-Angèle-de-Mérici', 'Sainte-Flavie', 'Sainte-Jeanne-d\'Arc', 'Sainte-Luce', 'Saint-Donat', 'Saint-Gabriel-de-Rimouski', 'Saint-Joseph-de-Lepage', 'Saint-Octave-de-Métis']
      },
      'la-matapedia': {
        name: 'La Matapédia',
        cities: ['Amqui', 'Causapscal', 'Lac-au-Saumon', 'Sayabec', 'Val-Brillant', 'Albertville', 'L\'Ascension-de-Patapédia', 'Matapédia', 'Saint-Alexandre-des-Lacs', 'Saint-Alexis-de-Matapédia', 'Saint-André-de-Restigouche', 'Saint-Benoît-Labre', 'Saint-Cléophas', 'Saint-Damase', 'Sainte-Florence', 'Sainte-Irène', 'Sainte-Marguerite', 'Saint-François-d\'Assise', 'Saint-Léon-le-Grand', 'Saint-Moïse', 'Saint-Noël', 'Saint-René-de-Matane', 'Saint-Tharcisius', 'Saint-Vianney', 'Saint-Zénon-du-Lac-Humqui']
      },
      'la-matanie': {
        name: 'La Matanie',
        cities: ['Matane', 'Baie-des-Sables', 'Les Méchins', 'Grosses-Roches', 'Saint-Jean-de-Cherbourg', 'Sainte-Félicité', 'Saint-Léandre', 'Saint-René-de-Matane', 'Saint-Ulric']
      }
    }
  },

  '02-saguenay-lac-saint-jean': {
    name: 'Saguenay–Lac-Saint-Jean',
    code: '02',
    slug: 'saguenay-lac-saint-jean',
    mrcs: {
      'le-fjord-du-saguenay': {
        name: 'Le Fjord-du-Saguenay',
        cities: ['Saguenay', 'Chicoutimi', 'Jonquière', 'La Baie', 'L\'Anse-Saint-Jean', 'Ferland-et-Boilleau', 'Larouche', 'Mont-Valin', 'Petit-Saguenay', 'Rivière-Éternité', 'Saint-Ambroise', 'Saint-Charles-de-Bourget', 'Saint-David-de-Falardeau', 'Saint-Félix-d\'Otis', 'Saint-Fulgence', 'Saint-Honoré', 'Sainte-Rose-du-Nord', 'Shipshaw']
      },
      'le-domaine-du-roy': {
        name: 'Le Domaine-du-Roy',
        cities: ['Roberval', 'Saint-Félicien', 'Chambord', 'Lac-Bouchette', 'La Doré', 'Sainte-Hedwidge', 'Saint-André-du-Lac-Saint-Jean', 'Saint-François-de-Sales', 'Saint-Prime']
      },
      'maria-chapdelaine': {
        name: 'Maria-Chapdelaine',
        cities: ['Dolbeau-Mistassini', 'Albanel', 'Girardville', 'Notre-Dame-de-Lorette', 'Péribonka', 'Saint-Augustin', 'Sainte-Jeanne-d\'Arc', 'Saint-Eugène-d\'Argentenay', 'Saint-Stanislas', 'Saint-Thomas-Didyme']
      },
      'lac-saint-jean-est': {
        name: 'Lac-Saint-Jean-Est',
        cities: ['Alma', 'Desbiens', 'Hébertville', 'Hébertville-Station', 'L\'Ascension-de-Notre-Seigneur', 'Labrecque', 'Lamarche', 'Larouche', 'Métabetchouan–Lac-à-la-Croix', 'Saint-Bruno', 'Saint-Gédéon', 'Saint-Henri-de-Taillon', 'Saint-Ludger-de-Milot', 'Saint-Nazaire']
      }
    }
  },

  '03-capitale-nationale': {
    name: 'Capitale-Nationale',
    code: '03',
    slug: 'capitale-nationale',
    mrcs: {
      'la-cote-de-beaupre': {
        name: 'La Côte-de-Beaupré',
        cities: ['Beaupré', 'Boischatel', 'Château-Richer', 'L\'Ange-Gardien', 'Sainte-Anne-de-Beaupré', 'Saint-Ferréol-les-Neiges', 'Saint-Joachim', 'Saint-Louis-de-Gonzague-du-Cap-Tourmente', 'Saint-Tite-des-Caps']
      },
      charlevoix: {
        name: 'Charlevoix',
        cities: ['La Malbaie', 'Baie-Saint-Paul', 'Clermont', 'Les Éboulements', 'Notre-Dame-des-Monts', 'Petite-Rivière-Saint-François', 'Saint-Aimé-des-Lacs', 'Saint-Hilarion', 'Saint-Irénée', 'Saint-Siméon', 'Saint-Urbain']
      },
      'charlevoix-est': {
        name: 'Charlevoix-Est',
        cities: ['La Malbaie', 'Clermont', 'Notre-Dame-des-Monts', 'Saint-Aimé-des-Lacs', 'Saint-Fidèle', 'Saint-Siméon']
      },
      'ile-dorleans': {
        name: 'L\'Île-d\'Orléans',
        cities: ['Saint-Pierre-de-l\'Île-d\'Orléans', 'Sainte-Famille-de-l\'Île-d\'Orléans', 'Saint-François-de-l\'Île-d\'Orléans', 'Saint-Jean-de-l\'Île-d\'Orléans', 'Saint-Laurent-de-l\'Île-d\'Orléans', 'Sainte-Pétronille']
      },
      portneuf: {
        name: 'Portneuf',
        cities: ['Cap-Santé', 'Deschambault-Grondines', 'Donnacona', 'Neuville', 'Pont-Rouge', 'Portneuf', 'Saint-Alban', 'Saint-Basile', 'Saint-Casimir', 'Saint-Gilbert', 'Saint-Laurent-de-l\'Île-d\'Orléans', 'Saint-Léonard-de-Portneuf', 'Saint-Marc-des-Carrières', 'Saint-Raymond', 'Saint-Thuribe', 'Saint-Ubalde', 'Rivière-à-Pierre', 'Sainte-Catherine-de-la-Jacques-Cartier', 'Sainte-Christine-d\'Auvergne']
      },
      'la-jacques-cartier': {
        name: 'La Jacques-Cartier',
        cities: ['Lac-Beauport', 'Lac-Delage', 'Fossambault-sur-le-Lac', 'Lac-Saint-Joseph', 'Sainte-Brigitte-de-Laval', 'Stoneham-et-Tewkesbury', 'Saint-Gabriel-de-Valcartier', 'Shannon']
      },
      quebec: {
        name: 'Québec',
        cities: ['Québec', 'L\'Ancienne-Lorette', 'Saint-Augustin-de-Desmaures']
      }
    }
  },

  '04-mauricie': {
    name: 'Mauricie',
    code: '04',
    slug: 'mauricie',
    mrcs: {
      'les-chenaux': {
        name: 'Les Chenaux',
        cities: ['Saint-Luc-de-Vincennes', 'Saint-Maurice', 'Saint-Narcisse', 'Saint-Prosper-de-Champlain', 'Saint-Stanislas', 'Sainte-Anne-de-la-Pérade', 'Sainte-Geneviève-de-Batiscan', 'Batiscan', 'Champlain', 'Notre-Dame-du-Mont-Carmel']
      },
      maskinonge: {
        name: 'Maskinongé',
        cities: ['Louiseville', 'Maskinongé', 'Saint-Alexis-des-Monts', 'Saint-Barnabé', 'Saint-Boniface', 'Saint-Didace', 'Saint-Édouard-de-Maskinongé', 'Sainte-Angèle-de-Prémont', 'Sainte-Ursule', 'Saint-Justin', 'Saint-Léon-le-Grand', 'Saint-Mathieu-du-Parc', 'Saint-Paulin', 'Saint-Sévère', 'Saint-Séverin', 'Yamachiche']
      },
      mekinac: {
        name: 'Mékinac',
        cities: ['La Tuque', 'Trois-Rives', 'Grandes-Piles', 'Hérouxville', 'Notre-Dame-de-Montauban', 'Saint-Adelphe', 'Saint-Roch-de-Mékinac', 'Saint-Séverin', 'Saint-Tite', 'Sainte-Thècle']
      },
      shawinigan: {
        name: 'Shawinigan',
        cities: ['Shawinigan', 'Saint-Georges-de-Champlain', 'Saint-Gérard-des-Laurentides', 'Saint-Mathieu-du-Parc', 'Saint-Boniface-de-Shawinigan']
      },
      'trois-rivieres': {
        name: 'Trois-Rivières',
        cities: ['Trois-Rivières', 'Bécancour', 'Champlain', 'Notre-Dame-du-Mont-Carmel', 'Pointe-du-Lac', 'Saint-Étienne-des-Grès', 'Saint-Louis-de-France', 'Saint-Maurice', 'Sainte-Marthe-du-Cap-de-la-Madeleine']
      }
    }
  },

  '05-estrie': {
    name: 'Estrie',
    code: '05',
    slug: 'estrie',
    mrcs: {
      'le-granit': {
        name: 'Le Granit',
        cities: ['Lac-Mégantic', 'Frontenac', 'Marston', 'Milan', 'Nantes', 'Piopolis', 'Saint-Augustin-de-Woburn', 'Sainte-Cécile-de-Whitton', 'Saint-Ludger', 'Saint-Robert-Bellarmin', 'Saint-Romain', 'Saint-Sébastien', 'Stornoway', 'Stratford', 'Val-Racine', 'Audet', 'Courcelles', 'Lac-Drolet']
      },
      'le-haut-saint-francois': {
        name: 'Le Haut-Saint-François',
        cities: ['Cookshire-Eaton', 'East Angus', 'Bury', 'Chartierville', 'Dudswell', 'La Patrie', 'Lingwick', 'Saint-Isidore-de-Clifton', 'Sawyerville', 'Scotstown', 'Weedon']
      },
      'le-val-saint-francois': {
        name: 'Le Val-Saint-François',
        cities: ['Richmond', 'Valcourt', 'Cleveland', 'Kingsbury', 'Lawrenceville', 'Maricourt', 'Melbourne', 'Racine', 'Saint-Claude', 'Saint-Denis-de-Brompton', 'Saint-François-Xavier-de-Brompton', 'Sainte-Anne-de-la-Rochelle', 'Saint-Lucien', 'Ulverton', 'Windsor']
      },
      memphremagog: {
        name: 'Memphrémagog',
        cities: ['Magog', 'Ayer\'s Cliff', 'Austin', 'Eastman', 'Hatley', 'North Hatley', 'Ogden', 'Orford', 'Potton', 'Saint-Benoît-du-Lac', 'Sainte-Catherine-de-Hatley', 'Stanstead', 'Stanstead-Est']
      },
      coaticook: {
        name: 'Coaticook',
        cities: ['Coaticook', 'Barnston-Ouest', 'Compton', 'Dixville', 'East Hereford', 'Martinville', 'Saint-Herménégilde', 'Saint-Malo', 'Saint-Venant-de-Paquette', 'Sainte-Edwidge-de-Clifton', 'Waterville']
      },
      sherbrooke: {
        name: 'Sherbrooke',
        cities: ['Sherbrooke', 'Ascot Corner', 'Deauville', 'Fleurimont', 'Lennoxville', 'Rock Forest', 'Saint-Élie-d\'Orford', 'Stoke']
      },
      'les-sources': {
        name: 'Les Sources',
        cities: ['Asbestos', 'Danville', 'Ham-Sud', 'Saint-Adrien', 'Saint-Camille', 'Saint-Georges-de-Windsor', 'Saints-Martyrs-Canadiens', 'Sainte-Clothilde-de-Horton', 'Wotton']
      }
    }
  },

  '06-montreal': {
    name: 'Montréal',
    code: '06',
    slug: 'montreal',
    mrcs: {
      montreal: {
        name: 'Montréal',
        cities: ['Montréal', 'Westmount', 'Mont-Royal', 'Côte-Saint-Luc', 'Hampstead', 'Montréal-Est', 'Montréal-Ouest', 'Dollard-des-Ormeaux', 'Dorval', 'Pointe-Claire', 'Kirkland', 'Beaconsfield', 'Baie-d\'Urfé', 'Sainte-Anne-de-Bellevue', 'Senneville']
      }
    }
  },

  '07-outaouais': {
    name: 'Outaouais',
    code: '07',
    slug: 'outaouais',
    mrcs: {
      papineau: {
        name: 'Papineau',
        cities: ['Papineauville', 'Bowman', 'Chénéville', 'Duhamel', 'Fassett', 'Lac-des-Plages', 'Lac-Simon', 'Lochaber', 'Lochaber-Partie-Ouest', 'Mayo', 'Montebello', 'Montpellier', 'Mulgrave-et-Derry', 'Namur', 'Notre-Dame-de-Bonsecours', 'Notre-Dame-de-la-Paix', 'Plaisance', 'Ripon', 'Saint-André-Avellin', 'Saint-Émile-de-Suffolk', 'Sainte-Angélique', 'Thurso']
      },
      'les-collines-de-loutaouais': {
        name: 'Les Collines-de-l\'Outaouais',
        cities: ['Chelsea', 'Cantley', 'La Pêche', 'L\'Ange-Gardien', 'Notre-Dame-de-la-Salette', 'Pontiac', 'Val-des-Monts']
      },
      gatineau: {
        name: 'Gatineau',
        cities: ['Gatineau', 'Hull', 'Aylmer', 'Buckingham', 'Masson-Angers']
      },
      pontiac: {
        name: 'Pontiac',
        cities: ['Campbell\'s Bay', 'Fort-Coulonge', 'Mansfield-et-Pontefract', 'Shawville', 'Bristol', 'Bryson', 'Chichester', 'Clarendon', 'Grand-Calumet-du-Lac', 'L\'Isle-aux-Allumettes', 'L\'Île-du-Grand-Calumet', 'Litchfield', 'Otter Lake', 'Portage-du-Fort', 'Rapides-des-Joachims', 'Sheenboro', 'Thorne', 'Waltham']
      },
      'la-vallee-de-la-gatineau': {
        name: 'La Vallée-de-la-Gatineau',
        cities: ['Gracefield', 'Maniwaki', 'Bois-Franc', 'Bouchette', 'Cayamant', 'Déléage', 'Egan-Sud', 'Grand-Remous', 'Kazabazua', 'Lac-Sainte-Marie', 'Low', 'Messines', 'Montcerf-Lytton', 'Northfield', 'Blue Sea', 'Denholm', 'Aumond']
      },
      temiscamingue: {
        name: 'Témiscamingue',
        cities: ['Ville-Marie', 'Angliers', 'Béarn', 'Belleterre', 'Duhamel-Ouest', 'Fugèreville', 'Guérin', 'Kipawa', 'Latulipe-et-Gaboury', 'Laverlochere', 'Laverlochère-Angliers', 'Lorrainville', 'Moffet', 'Notre-Dame-du-Nord', 'Rémigny', 'Saint-Bruno-de-Guigues', 'Saint-Édouard-de-Fabre', 'Saint-Eugène-de-Guigues', 'Témiscaming']
      }
    }
  },

  '08-abitibi-temiscamingue': {
    name: 'Abitibi-Témiscamingue',
    code: '08',
    slug: 'abitibi-temiscamingue',
    mrcs: {
      abitibi: {
        name: 'Abitibi',
        cities: ['Amos', 'La Sarre', 'Lebel-sur-Quévillon', 'Matagami', 'Barraute', 'Berry', 'Champneuf', 'Launay', 'Palmarolle', 'Poularies', 'Preissac', 'Rochebaucourt', 'Sainte-Germaine-Boulé', 'Saint-Dominique-du-Rosaire', 'Saint-Félix-de-Dalquier', 'Saint-Lambert', 'Saint-Marc-de-Figuery', 'Trécesson']
      },
      'abitibi-ouest': {
        name: 'Abitibi-Ouest',
        cities: ['La Sarre', 'Macamic', 'Authier', 'Authier-Nord', 'Dupuy', 'Clerval', 'Clermont', 'Gallichan', 'Launay', 'Normétal', 'Palmarolle', 'Poularies', 'Roquemaure', 'Saint-Lambert', 'Taschereau']
      },
      'rouyn-noranda': {
        name: 'Rouyn-Noranda',
        cities: ['Rouyn-Noranda', 'Arntfield', 'Beaudry', 'Bellecombe', 'Cadillac', 'Cléricy', 'D\'Alembert', 'Destor', 'Duparquet', 'Évain', 'Granada', 'La Morandière', 'McWatters', 'Montbeillard', 'Rollet']
      },
      temiscamingue: {
        name: 'Témiscamingue',
        cities: ['Ville-Marie', 'Angliers', 'Béarn', 'Belleterre', 'Duhamel-Ouest', 'Fugèreville', 'Guérin', 'Kipawa', 'Latulipe-et-Gaboury', 'Laverlochere', 'Lorrainville', 'Moffet', 'Notre-Dame-du-Nord', 'Rémigny', 'Saint-Bruno-de-Guigues', 'Saint-Édouard-de-Fabre', 'Saint-Eugène-de-Guigues', 'Témiscaming']
      },
      'vallee-de-lor': {
        name: 'Vallée-de-l\'Or',
        cities: ['Val-d\'Or', 'Malartic', 'Senneterre', 'Barraute', 'Belcourt', 'Dubuisson', 'Lac-Simon', 'Louvicourt', 'Rivière-Héva', 'Val-Senneville']
      }
    }
  },

  '09-cote-nord': {
    name: 'Côte-Nord',
    code: '09',
    slug: 'cote-nord',
    mrcs: {
      'la-haute-cote-nord': {
        name: 'La Haute-Côte-Nord',
        cities: ['Les Escoumins', 'Forestville', 'Portneuf-sur-Mer', 'Sacré-Coeur', 'Tadoussac', 'Bergeronnes', 'Colombier', 'Longue-Rive', 'Ragueneau', 'Essipit']
      },
      manicouagan: {
        name: 'Manicouagan',
        cities: ['Baie-Comeau', 'Baie-Trinité', 'Chute-aux-Outardes', 'Franquelin', 'Godbout', 'Pessamit', 'Pointe-aux-Outardes', 'Pointe-Lebel', 'Ragueneau']
      },
      'sept-rivieres-caniapiscau': {
        name: 'Sept-Rivières-Caniapiscau',
        cities: ['Sept-Îles', 'Port-Cartier', 'Fermont', 'Schefferville', 'Aguanish', 'Baie-Johan-Beetz', 'Havre-Saint-Pierre', 'Gros-Mécatina', 'Kegaska', 'La Romaine', 'Longue-Pointe-de-Mingan', 'Natashquan', 'Rivière-Saint-Jean']
      },
      minganie: {
        name: 'Minganie',
        cities: ['Havre-Saint-Pierre', 'Baie-Johan-Beetz', 'Longue-Pointe-de-Mingan', 'Rivière-au-Tonnerre', 'Rivière-Saint-Jean', 'Aguanish']
      }
    }
  },

  '10-nord-du-quebec': {
    name: 'Nord-du-Québec',
    code: '10',
    slug: 'nord-du-quebec',
    mrcs: {
      'eeyou-istchee': {
        name: 'Eeyou Istchee (Baie-James)',
        cities: ['Chapais', 'Chibougamau', 'Lebel-sur-Quévillon', 'Matagami', 'Mistissini', 'Waskaganish', 'Waswanipi', 'Wemindji', 'Chisasibi', 'Eastmain', 'Nemaska', 'Oujé-Bougoumou', 'Whapmagoostui']
      },
      nunavik: {
        name: 'Nunavik',
        cities: ['Kuujjuaq', 'Kuujjuarapik', 'Inukjuak', 'Puvirnituq', 'Salluit', 'Kangiqsujuaq', 'Quaqtaq', 'Kangirsuk', 'Aupaluk', 'Tasiujaq', 'Kangiqsualujjuaq', 'Ivujivik', 'Akulivik', 'Umiujaq']
      }
    }
  },

  '11-gaspesie-iles-de-la-madeleine': {
    name: 'Gaspésie–Îles-de-la-Madeleine',
    code: '11',
    slug: 'gaspesie-iles-de-la-madeleine',
    mrcs: {
      avignon: {
        name: 'Avignon',
        cities: ['Carleton-sur-Mer', 'Maria', 'Nouvelle', 'Pointe-à-la-Croix', 'Escuminac', 'Gesgapegiag', 'Listuguj', 'Matapédia', 'Ristigouche-Partie-Sud-Est', 'Saint-Alexis-de-Matapédia', 'Saint-André-de-Restigouche', 'Saint-Fidèle']
      },
      bonaventure: {
        name: 'Bonaventure',
        cities: ['Bonaventure', 'Caplan', 'Cascapédia-Saint-Jules', 'Chandler', 'Grande-Rivière', 'New Carlisle', 'New Richmond', 'Paspébiac', 'Hope', 'Hope Town', 'Port-Daniel–Gascons', 'Saint-Alphonse', 'Saint-Elzéar', 'Saint-Godefroi', 'Saint-Siméon', 'Shigawake']
      },
      'la-cote-de-gaspe': {
        name: 'La Côte-de-Gaspé',
        cities: ['Gaspé', 'Percé', 'Cloridorme', 'Grande-Vallée', 'Murdochville', 'Petite-Vallée', 'Saint-Maurice-de-l\'Échourie']
      },
      'la-haute-gaspesie': {
        name: 'La Haute-Gaspésie',
        cities: ['Sainte-Anne-des-Monts', 'Cap-Chat', 'La Martre', 'Les Méchins', 'Mont-Saint-Pierre', 'Murdochville', 'Saint-Maxime-du-Mont-Louis']
      },
      'rocher-perce': {
        name: 'Rocher-Percé',
        cities: ['Chandler', 'Grande-Rivière', 'Percé', 'Port-Daniel-Gascons', 'Sainte-Thérèse-de-Gaspé']
      },
      'iles-de-la-madeleine': {
        name: 'Îles-de-la-Madeleine',
        cities: ['Les Îles-de-la-Madeleine', 'Cap-aux-Meules', 'Fatima', 'Grande-Entrée', 'Grosse-Île', 'Havre-Aubert', 'Havre-aux-Maisons', 'L\'Étang-du-Nord', 'L\'Île-d\'Entrée']
      }
    }
  },

  '12-chaudiere-appalaches': {
    name: 'Chaudière-Appalaches',
    code: '12',
    slug: 'chaudiere-appalaches',
    mrcs: {
      'lislet': {
        name: 'L\'Islet',
        cities: ['L\'Islet', 'Montmagny', 'Saint-Jean-Port-Joli', 'Saint-Pamphile', 'Notre-Dame-du-Rosaire', 'Saint-Adalbert', 'Saint-Aubert', 'Saint-Cyrille-de-Lessard', 'Saint-Damase-de-L\'Islet', 'Sainte-Euphémie-sur-Rivière-du-Sud', 'Sainte-Félicité', 'Sainte-Louise', 'Sainte-Perpétue', 'Saint-François-de-la-Rivière-du-Sud', 'Saint-Just-de-Bretenières', 'Saint-Marcel', 'Saint-Omer', 'Saint-Pierre-de-la-Rivière-du-Sud', 'Tourville']
      },
      montmagny: {
        name: 'Montmagny',
        cities: ['Montmagny', 'Berthier-sur-Mer', 'Cap-Saint-Ignace', 'La Pocatière', 'L\'Islet', 'Notre-Dame-Auxiliatrice-de-Buckland', 'Notre-Dame-du-Rosaire', 'Saint-Antoine-de-l\'Isle-aux-Grues', 'Saint-Apollinaire', 'Saint-Fabien-de-Panet', 'Saint-François-de-la-Rivière-du-Sud', 'Saint-Just-de-Bretenières', 'Saint-Paul-de-Montminy', 'Saint-Pierre-de-la-Rivière-du-Sud']
      },
      bellechasse: {
        name: 'Bellechasse',
        cities: ['Saint-Raphaël', 'Armagh', 'Beaumont', 'Saint-Charles-de-Bellechasse', 'Saint-Damien-de-Buckland', 'Saint-Gervais', 'Saint-Lazare-de-Bellechasse', 'Saint-Léon-de-Standon', 'Saint-Malachie', 'Saint-Michel-de-Bellechasse', 'Saint-Nazaire-de-Dorchester', 'Saint-Nérée-de-Bellechasse', 'Sainte-Claire', 'Sainte-Sabine', 'Saint-Vallier', 'Honfleur']
      },
      lotbiniere: {
        name: 'Lotbinière',
        cities: ['Laurier-Station', 'Leclercville', 'Lotbinière', 'Notre-Dame-du-Sacré-Coeur-d\'Issoudun', 'Sainte-Agathe-de-Lotbinière', 'Sainte-Croix', 'Saint-Agapit', 'Saint-Antoine-de-Tilly', 'Saint-Apollinaire', 'Saint-Édouard-de-Lotbinière', 'Sainte-Emmélie', 'Sainte-Françoise', 'Saint-Flavien', 'Saint-Gilles', 'Saint-Jacques-de-Leeds', 'Saint-Janvier-de-Joly', 'Saint-Narcisse-de-Beaurivage', 'Saint-Octave-de-Dosquet', 'Saint-Patrice-de-Beaurivage', 'Saint-Sylvestre', 'Val-Alain', 'Dosquet']
      },
      'lerable': {
        name: 'L\'Érable',
        cities: ['Plessisville', 'Princeville', 'Inverness', 'Laurierville', 'Lyster', 'Notre-Dame-de-Lourdes', 'Saint-Ferdinand', 'Sainte-Sophie-d\'Halifax', 'Saint-Jacques-de-Leeds', 'Saint-Julien', 'Saint-Pierre-Baptiste', 'Villeroy']
      },
      'les-appalaches': {
        name: 'Les Appalaches',
        cities: ['Thetford Mines', 'Disraeli', 'East Broughton', 'Adstock', 'Beaulac-Garthby', 'Irlande', 'Kinnear\'s Mills', 'Sacré-Coeur-de-Jésus', 'Saint-Adrien-d\'Irlande', 'Sainte-Clotilde-de-Beauce', 'Saint-Jacques-le-Majeur-de-Wolfestown', 'Saint-Jean-de-Brébeuf', 'Saint-Joseph-de-Coleraine', 'Saint-Julien', 'Saint-Pierre-de-Broughton', 'Thetford-Partie-Sud']
      },
      'beauce-sartigan': {
        name: 'Beauce-Sartigan',
        cities: ['Saint-Georges', 'Beauceville', 'Lac-Etchemin', 'La Guadeloupe', 'Saint-Benoît-Labre', 'Saint-Côme–Linière', 'Saint-Éphrem-de-Beauce', 'Sainte-Aurélie', 'Sainte-Rose-de-Watford', 'Saint-Évariste-de-Forsyth', 'Saint-Gédéon-de-Beauce', 'Saint-Hilaire-de-Dorset', 'Saint-Honoré-de-Shenley', 'Saint-Louis-de-Gonzague', 'Saint-Martin', 'Saint-Philibert', 'Saint-René', 'Saint-Robert-Bellarmin', 'Saint-Simon-les-Mines', 'Saint-Théophile', 'Saint-Zacharie']
      },
      'la-nouvelle-beauce': {
        name: 'La Nouvelle-Beauce',
        cities: ['Sainte-Marie', 'Saint-Joseph-de-Beauce', 'Beauceville', 'Frampton', 'Saint-Bernard', 'Saint-Charles-de-Bellechasse', 'Sainte-Hénédine', 'Saint-Elzéar', 'Saint-Isidore', 'Saint-Lambert-de-Lauzon', 'Saints-Anges', 'Saint-Séverin', 'Vallée-Jonction']
      },
      'robert-cliche': {
        name: 'Robert-Cliche',
        cities: ['Saint-Joseph-de-Beauce', 'Beauceville', 'Saint-Jules', 'Notre-Dame-des-Pins', 'Saint-Alfred', 'Saint-Benjamin', 'Saint-Frédéric', 'Sainte-Marguerite', 'Saint-Séverin', 'Saint-Victor', 'Tring-Jonction']
      },
      'les-etchemins': {
        name: 'Les Etchemins',
        cities: ['Lac-Etchemin', 'Saint-Prosper', 'Sainte-Justine', 'La Guadeloupe', 'Notre-Dame-Auxiliatrice-de-Buckland', 'Saint-Camille-de-Lellis', 'Saint-Cyprien', 'Saint-Luc-de-Bellechasse', 'Sainte-Aurélie', 'Sainte-Rose-de-Watford', 'Saint-Louis-de-Gonzague', 'Saint-Magloire', 'Saint-Nazaire-de-Dorchester', 'Sainte-Sabine']
      }
    }
  },

  '13-laval': {
    name: 'Laval',
    code: '13',
    slug: 'laval',
    mrcs: {
      laval: {
        name: 'Laval',
        cities: ['Laval', 'Auteuil', 'Chomedey', 'Duvernay', 'Fabreville', 'Îles-Laval', 'Laval-des-Rapides', 'Laval-Ouest', 'Laval-sur-le-Lac', 'Pont-Viau', 'Sainte-Dorothée', 'Sainte-Rose', 'Saint-François', 'Saint-Vincent-de-Paul', 'Vimont']
      }
    }
  },

  '14-lanaudiere': {
    name: 'Lanaudière',
    code: '14',
    slug: 'lanaudiere',
    mrcs: {
      'dautray': {
        name: 'D\'Autray',
        cities: ['Berthierville', 'Lavaltrie', 'Lanoraie', 'Mandeville', 'Saint-Barthélemy', 'Saint-Cléophas-de-Brandon', 'Saint-Cuthbert', 'Saint-Didace', 'Sainte-Élisabeth', 'Sainte-Geneviève-de-Berthier', 'Saint-Gabriel', 'Saint-Gabriel-de-Brandon', 'Saint-Ignace-de-Loyola', 'Saint-Norbert', 'Saint-Thomas']
      },
      joliette: {
        name: 'Joliette',
        cities: ['Joliette', 'Notre-Dame-de-Lourdes', 'Notre-Dame-des-Prairies', 'Crabtree', 'Saint-Ambroise-de-Kildare', 'Saint-Charles-Borromée', 'Sainte-Mélanie', 'Saint-Félix-de-Valois', 'Saint-Jean-de-Matha', 'Saint-Paul', 'Saint-Pierre', 'Saint-Thomas']
      },
      matawinie: {
        name: 'Matawinie',
        cities: ['Saint-Michel-des-Saints', 'Rawdon', 'Chertsey', 'Entrelacs', 'Notre-Dame-de-la-Merci', 'Saint-Alphonse-Rodriguez', 'Saint-Côme', 'Saint-Damien', 'Sainte-Béatrix', 'Sainte-Émélie-de-l\'Énergie', 'Saint-Donat', 'Saint-Félix-de-Valois', 'Saint-Guillaume-Nord', 'Saint-Jean-de-Matha', 'Saint-Zénon']
      },
      'les-moulins': {
        name: 'Les Moulins',
        cities: ['Terrebonne', 'Mascouche']
      },
      'lassomption': {
        name: 'L\'Assomption',
        cities: ['L\'Assomption', 'Repentigny', 'L\'Épiphanie', 'Charlemagne', 'Saint-Sulpice']
      },
      montcalm: {
        name: 'Montcalm',
        cities: ['Saint-Esprit', 'Saint-Jacques', 'Saint-Alexis', 'Sainte-Julienne', 'Saint-Liguori', 'Sainte-Marie-Salomé', 'Saint-Roch-de-l\'Achigan', 'Saint-Roch-Ouest']
      }
    }
  },

  '15-laurentides': {
    name: 'Laurentides',
    code: '15',
    slug: 'laurentides',
    mrcs: {
      'antoine-labelle': {
        name: 'Antoine-Labelle',
        cities: ['Mont-Laurier', 'L\'Annonciation', 'Mont-Saint-Michel', 'Ferme-Neuve', 'Nominingue', 'Rivière-Rouge', 'Kiamika', 'Lac-des-Écorces', 'Lac-du-Cerf', 'Lac-Saint-Paul', 'La Macaza', 'Marchand', 'Notre-Dame-de-Pontmain', 'Notre-Dame-du-Laus', 'Sainte-Anne-du-Lac', 'Val-Barrette']
      },
      argenteuil: {
        name: 'Argenteuil',
        cities: ['Lachute', 'Brownsburg-Chatham', 'Gore', 'Grenville', 'Grenville-sur-la-Rouge', 'Harrington', 'Mille-Isles', 'Saint-André-d\'Argenteuil', 'Wentworth', 'Wentworth-Nord']
      },
      'les-laurentides': {
        name: 'Les Laurentides',
        cities: ['Mont-Tremblant', 'Sainte-Agathe-des-Monts', 'Arundel', 'Barkmere', 'Brébeuf', 'Ivry-sur-le-Lac', 'Lantier', 'La Conception', 'La Minerve', 'Lac-Supérieur', 'Lac-Tremblant-Nord', 'Labelle', 'Mont-Blanc', 'Montcalm', 'Saint-Faustin–Lac-Carré', 'Val-David', 'Val-Morin']
      },
      'les-pays-den-haut': {
        name: 'Les Pays-d\'en-Haut',
        cities: ['Saint-Sauveur', 'Morin-Heights', 'Piedmont', 'Sainte-Adèle', 'Sainte-Anne-des-Lacs', 'Estérel', 'Ivry-sur-le-Lac', 'Lac-des-Seize-Îles', 'Wentworth-Nord']
      },
      'deux-montagnes': {
        name: 'Deux-Montagnes',
        cities: ['Deux-Montagnes', 'Oka', 'Pointe-Calumet', 'Saint-Eustache', 'Saint-Joseph-du-Lac', 'Saint-Placide', 'Sainte-Marthe-sur-le-Lac']
      },
      'therese-de-blainville': {
        name: 'Thérèse-De Blainville',
        cities: ['Boisbriand', 'Blainville', 'Bois-des-Filion', 'Lorraine', 'Rosemère', 'Sainte-Anne-des-Plaines', 'Sainte-Thérèse']
      },
      mirabel: {
        name: 'Mirabel',
        cities: ['Mirabel']
      }
    }
  },

  '16-monteregie': {
    name: 'Montérégie',
    code: '16',
    slug: 'monteregie',
    mrcs: {
      'le-haut-richelieu': {
        name: 'Le Haut-Richelieu',
        cities: ['Saint-Jean-sur-Richelieu', 'Chambly', 'Marieville', 'Mont-Saint-Grégoire', 'Mont-Saint-Hilaire', 'Saint-Basile-le-Grand', 'Carignan', 'Henryville', 'Lacolle', 'Noyan', 'Saint-Alexandre', 'Saint-Blaise-sur-Richelieu', 'Saint-Georges-de-Clarenceville', 'Saint-Paul-de-l\'Île-aux-Noix', 'Saint-Sébastien', 'Saint-Valentin', 'Sainte-Anne-de-Sabrevois', 'Sainte-Brigide-d\'Iberville', 'Venise-en-Québec']
      },
      'la-vallee-du-richelieu': {
        name: 'La Vallée-du-Richelieu',
        cities: ['Beloeil', 'McMasterville', 'Mont-Saint-Hilaire', 'Otterburn Park', 'Saint-Antoine-sur-Richelieu', 'Saint-Basile-le-Grand', 'Saint-Charles-sur-Richelieu', 'Saint-Denis-sur-Richelieu', 'Saint-Jean-Baptiste', 'Saint-Marc-sur-Richelieu', 'Saint-Mathieu-de-Beloeil', 'Sainte-Madeleine']
      },
      'marguerite-dyouville': {
        name: 'Marguerite-D\'Youville',
        cities: ['Calixa-Lavallée', 'Contrecoeur', 'Sainte-Julie', 'Saint-Amable', 'Varennes', 'Verchères']
      },
      acton: {
        name: 'Acton',
        cities: ['Acton Vale', 'Béthanie', 'Roxton', 'Roxton Falls', 'Sainte-Christine', 'Upton']
      },
      'pierre-de-saurel': {
        name: 'Pierre-De Saurel',
        cities: ['Sorel-Tracy', 'Massueville', 'Saint-Aimé', 'Saint-David', 'Saint-Joseph-de-Sorel', 'Saint-Ours', 'Saint-Robert', 'Saint-Roch-de-Richelieu', 'Sainte-Anne-de-Sorel', 'Sainte-Victoire-de-Sorel', 'Yamaska']
      },
      'le-bas-richelieu': {
        name: 'Le Bas-Richelieu',
        cities: ['Beloeil', 'McMasterville', 'Mont-Saint-Hilaire', 'Otterburn Park', 'Saint-Antoine-sur-Richelieu', 'Saint-Basile-le-Grand', 'Saint-Charles-sur-Richelieu', 'Saint-Denis-sur-Richelieu', 'Saint-Hyacinthe', 'Saint-Jean-Baptiste', 'Saint-Marc-sur-Richelieu', 'Saint-Mathieu-de-Beloeil']
      },
      'les-maskoutains': {
        name: 'Les Maskoutains',
        cities: ['Saint-Hyacinthe', 'Saint-Dominique', 'Saint-Damase', 'Saint-Pie', 'Saint-Simon', 'Sainte-Madeleine', 'Sainte-Marie-Madeleine', 'Saint-Barnabé-Sud', 'Saint-Bernard-de-Michaudville', 'Saint-Hugues', 'Saint-Jude', 'Saint-Liboire', 'Saint-Louis', 'Saint-Marcel-de-Richelieu', 'Saint-Valérien-de-Milton', 'Sainte-Hélène-de-Bagot', 'La Présentation']
      },
      rouville: {
        name: 'Rouville',
        cities: ['Marieville', 'Richelieu', 'Ange-Gardien', 'Saint-Césaire', 'Saint-Mathias-sur-Richelieu', 'Saint-Paul-d\'Abbotsford', 'Sainte-Angèle-de-Monnoir']
      },
      'brome-missisquoi': {
        name: 'Brome-Missisquoi',
        cities: ['Cowansville', 'Bedford', 'Bromont', 'Farnham', 'Lac-Brome', 'Sutton', 'Abercorn', 'Bolton-Est', 'Brigham', 'Brome', 'Dunham', 'East Farnham', 'Frelighsburg', 'Notre-Dame-de-Stanbridge', 'Pike River', 'Saint-Armand', 'Sainte-Sabine', 'Saint-Ignace-de-Stanbridge', 'Stanbridge East', 'Stanbridge Station']
      },
      'la-haute-yamaska': {
        name: 'La Haute-Yamaska',
        cities: ['Granby', 'Bromont', 'Roxton Pond', 'Saint-Alphonse-de-Granby', 'Sainte-Cécile-de-Milton', 'Shefford', 'Warden', 'Waterloo']
      },
      roussillon: {
        name: 'Roussillon',
        cities: ['Candiac', 'Châteauguay', 'Delson', 'La Prairie', 'Léry', 'Mercier', 'Saint-Constant', 'Saint-Isidore', 'Saint-Mathieu', 'Saint-Philippe', 'Sainte-Catherine']
      },
      'les-jardins-de-napierville': {
        name: 'Les Jardins-de-Napierville',
        cities: ['Saint-Rémi', 'Napierville', 'Hemmingford', 'Saint-Bernard-de-Lacolle', 'Saint-Cyprien-de-Napierville', 'Saint-Édouard', 'Saint-Jacques-le-Mineur', 'Saint-Michel', 'Saint-Patrice-de-Sherrington', 'Sainte-Clotilde']
      },
      'le-haut-saint-laurent': {
        name: 'Le Haut-Saint-Laurent',
        cities: ['Huntingdon', 'Ormstown', 'Godmanchester', 'Havelock', 'Hinchinbrooke', 'Howick', 'Saint-Anicet', 'Sainte-Barbe', 'Saint-Chrysostome', 'Très-Saint-Rédempteur']
      },
      'beauharnois-salaberry': {
        name: 'Beauharnois-Salaberry',
        cities: ['Beauharnois', 'Salaberry-de-Valleyfield', 'Saint-Étienne-de-Beauharnois', 'Saint-Louis-de-Gonzague', 'Saint-Stanislas-de-Kostka', 'Saint-Urbain-Premier']
      },
      'vaudreuil-soulanges': {
        name: 'Vaudreuil-Soulanges',
        cities: ['Vaudreuil-Dorion', 'Hudson', 'L\'Île-Cadieux', 'L\'Île-Perrot', 'Notre-Dame-de-l\'Île-Perrot', 'Pincourt', 'Pointe-des-Cascades', 'Pointe-Fortune', 'Rigaud', 'Rivière-Beaudette', 'Saint-Clet', 'Saint-Lazare', 'Saint-Polycarpe', 'Saint-Télesphore', 'Saint-Zotique', 'Sainte-Justine-de-Newton', 'Sainte-Marthe', 'Terrasse-Vaudreuil', 'Les Cèdres', 'Les Coteaux', 'Coteau-du-Lac']
      }
    }
  },

  '17-centre-du-quebec': {
    name: 'Centre-du-Québec',
    code: '17',
    slug: 'centre-du-quebec',
    mrcs: {
      arthabaska: {
        name: 'Arthabaska',
        cities: ['Victoriaville', 'Kingsey Falls', 'Warwick', 'Arthabaska', 'Chesterville', 'Daveluyville', 'Ham-Nord', 'Maddington Falls', 'Norbertville', 'Notre-Dame-de-Ham', 'Saint-Albert', 'Saint-Christophe-d\'Arthabaska', 'Sainte-Anne-du-Sault', 'Sainte-Clotilde-de-Horton', 'Sainte-Élisabeth-de-Warwick', 'Sainte-Hélène-de-Chester', 'Sainte-Séraphine', 'Saint-Louis-de-Blandford', 'Saint-Norbert-d\'Arthabaska', 'Saint-Rémi-de-Tingwick', 'Saint-Rosaire', 'Saint-Samuel', 'Saints-Martyrs-Canadiens', 'Saint-Valère', 'Tingwick']
      },
      drummond: {
        name: 'Drummond',
        cities: ['Drummondville', 'Saint-Bonaventure', 'Saint-Cyrille-de-Wendover', 'Saint-Edmond-de-Grantham', 'Saint-Eugène', 'Saint-Félix-de-Kingsey', 'Saint-Germain-de-Grantham', 'Saint-Guillaume', 'Saint-Lucien', 'Saint-Majorique-de-Grantham', 'Saint-Pie-de-Guire', 'Sainte-Brigitte-des-Saults', 'Wickham', 'L\'Avenir', 'Notre-Dame-du-Bon-Conseil']
      },
      becancour: {
        name: 'Bécancour',
        cities: ['Bécancour', 'Lemieux', 'Manseau', 'Sainte-Cécile-de-Lévrard', 'Sainte-Françoise', 'Sainte-Marie-de-Blandford', 'Sainte-Sophie-de-Lévrard', 'Saint-Pierre-les-Becquets', 'Saint-Sylvère', 'Fortierville', 'Parisville']
      },
      'nicolet-yamaska': {
        name: 'Nicolet-Yamaska',
        cities: ['Nicolet', 'Aston-Jonction', 'Baie-du-Febvre', 'Grand-Saint-Esprit', 'La Visitation-de-Yamaska', 'Pierreville', 'Saint-Célestin', 'Saint-Elphège', 'Saint-François-du-Lac', 'Saint-Léonard-d\'Aston', 'Sainte-Eulalie', 'Sainte-Monique', 'Sainte-Perpétue', 'Saint-Wenceslas', 'Saint-Zéphirin-de-Courval']
      },
      'lerable': {
        name: 'L\'Érable',
        cities: ['Plessisville', 'Princeville', 'Inverness', 'Laurierville', 'Lyster', 'Notre-Dame-de-Lourdes', 'Saint-Ferdinand', 'Sainte-Sophie-d\'Halifax', 'Saint-Jacques-de-Leeds', 'Saint-Julien', 'Saint-Pierre-Baptiste', 'Villeroy']
      }
    }
  }
};

/**
 * Create a flat searchable index of all cities
 * Each entry includes: city name, MRC, region, and normalized search terms
 */
export const createCitySearchIndex = () => {
  const index = [];

  Object.entries(quebecMunicipalities).forEach(([regionSlug, region]) => {
    Object.entries(region.mrcs).forEach(([mrcSlug, mrc]) => {
      mrc.cities.forEach(city => {
        index.push({
          city: city,
          cityNormalized: normalizeString(city),
          mrc: mrc.name,
          mrcNormalized: normalizeString(mrc.name),
          region: region.name,
          regionCode: region.code,
          regionSlug: regionSlug,
          mrcSlug: mrcSlug,
          // For display: "Vaudreuil-Dorion (Vaudreuil-Soulanges, Montérégie)"
          displayName: `${city} (${mrc.name}, ${region.name})`
        });
      });
    });
  });

  return index;
};

/**
 * Normalize string for comparison (remove accents, lowercase, trim)
 */
export const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim();
};

/**
 * Intelligent city search
 * Returns matches for city name, MRC, or region
 */
export const searchCities = (query, limit = 10) => {
  if (!query || query.length < 1) return [];

  const normalized = normalizeString(query);
  const index = createCitySearchIndex();

  // Score matches: exact > starts with > contains
  const scored = index.map(entry => {
    let score = 0;

    // City name matches (highest priority)
    if (entry.cityNormalized === normalized) score += 100;
    else if (entry.cityNormalized.startsWith(normalized)) score += 50;
    else if (entry.cityNormalized.includes(normalized)) score += 25;

    // MRC matches (medium priority)
    if (entry.mrcNormalized === normalized) score += 30;
    else if (entry.mrcNormalized.startsWith(normalized)) score += 15;
    else if (entry.mrcNormalized.includes(normalized)) score += 10;

    // Region matches (lower priority)
    if (entry.regionNormalized === normalized) score += 10;
    else if (entry.regionNormalized.startsWith(normalized)) score += 5;
    else if (entry.regionNormalized.includes(normalized)) score += 3;

    return { ...entry, score };
  });

  return scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.city.localeCompare(b.city))
    .slice(0, limit);
};

/**
 * Get region and MRC for a city name
 */
export const getCityInfo = (cityName) => {
  const index = createCitySearchIndex();
  const normalized = normalizeString(cityName);

  return index.find(entry => entry.cityNormalized === normalized);
};

/**
 * Get all cities in a region
 */
export const getCitiesByRegion = (regionSlug) => {
  const region = quebecMunicipalities[regionSlug];
  if (!region) return [];

  const cities = [];
  Object.values(region.mrcs).forEach(mrc => {
    cities.push(...mrc.cities);
  });

  return cities.sort();
};

/**
 * Get all cities in an MRC
 */
export const getCitiesByMRC = (regionSlug, mrcSlug) => {
  const region = quebecMunicipalities[regionSlug];
  if (!region) return [];

  const mrc = region.mrcs[mrcSlug];
  if (!mrc) return [];

  return [...mrc.cities].sort();
};

/**
 * Get all regions with basic info
 */
export const getAllRegions = () => {
  return Object.entries(quebecMunicipalities).map(([slug, region]) => ({
    slug,
    name: region.name,
    code: region.code
  }));
};

/**
 * Get all MRCs in a region
 */
export const getMRCsByRegion = (regionSlug) => {
  const region = quebecMunicipalities[regionSlug];
  if (!region) return [];

  return Object.entries(region.mrcs).map(([slug, mrc]) => ({
    slug,
    name: mrc.name
  }));
};
