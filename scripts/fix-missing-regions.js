import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Mapping complet des villes du Québec vers leurs régions
const cityToRegion = {
  // Bas-Saint-Laurent
  'Rimouski': 'Bas-Saint-Laurent',
  'Rivière-du-Loup': 'Bas-Saint-Laurent',
  'Matane': 'Bas-Saint-Laurent',
  'Mont-Joli': 'Bas-Saint-Laurent',
  'Amqui': 'Bas-Saint-Laurent',
  'Dégelis': 'Bas-Saint-Laurent',
  'La Pocatière': 'Bas-Saint-Laurent',
  'Témiscouata-sur-le-Lac': 'Bas-Saint-Laurent',
  'Cabano': 'Bas-Saint-Laurent',
  'Trois-Pistoles': 'Bas-Saint-Laurent',

  // Saguenay-Lac-Saint-Jean
  'Saguenay': 'Saguenay-Lac-Saint-Jean',
  'Alma': 'Saguenay-Lac-Saint-Jean',
  'Dolbeau-Mistassini': 'Saguenay-Lac-Saint-Jean',
  'Roberval': 'Saguenay-Lac-Saint-Jean',
  'Saint-Félicien': 'Saguenay-Lac-Saint-Jean',
  'Chicoutimi': 'Saguenay-Lac-Saint-Jean',
  'Jonquière': 'Saguenay-Lac-Saint-Jean',
  'La Baie': 'Saguenay-Lac-Saint-Jean',
  'Albanel': 'Saguenay-Lac-Saint-Jean',

  // Capitale-Nationale
  'Québec': 'Capitale-Nationale',
  'QUÉBEC': 'Capitale-Nationale',
  'Quebec': 'Capitale-Nationale',
  'Beaupré': 'Capitale-Nationale',
  'Sainte-Anne-de-Beaupré': 'Capitale-Nationale',
  'Château-Richer': 'Capitale-Nationale',
  'Stoneham-et-Tewkesbury': 'Capitale-Nationale',
  'Shannon': 'Capitale-Nationale',
  'Saint-Raymond': 'Capitale-Nationale',
  'Donnacona': 'Capitale-Nationale',
  'Cap-Santé': 'Capitale-Nationale',
  'Portneuf': 'Capitale-Nationale',
  'Fossambault-sur-le-Lac': 'Capitale-Nationale',
  'Lac-Beauport': 'Capitale-Nationale',
  'Lac-Saint-Charles': 'Capitale-Nationale',
  'Lac-Delage': 'Capitale-Nationale',

  // Mauricie
  'Trois-Rivières': 'Mauricie',
  'Shawinigan': 'Mauricie',
  'La Tuque': 'Mauricie',
  'Louiseville': 'Mauricie',
  'Grand-Mère': 'Mauricie',
  'Sainte-Geneviève-de-Batiscan': 'Mauricie',
  'Saint-Boniface': 'Mauricie',
  'Saint-Étienne-des-Grès': 'Mauricie',

  // Estrie
  'Sherbrooke': 'Estrie',
  'Magog': 'Estrie',
  'Granby': 'Estrie',
  'Cowansville': 'Estrie',
  'Lac-Mégantic': 'Estrie',
  'Thetford Mines': 'Estrie',
  'Asbestos': 'Estrie',
  'Coaticook': 'Estrie',
  'East Angus': 'Estrie',
  'Windsor': 'Estrie',
  'Lac-Brome': 'Estrie',

  // Montréal
  'Montréal': 'Montréal',
  'Montreal': 'Montréal',

  // Outaouais
  'Gatineau': 'Outaouais',
  'Hull': 'Outaouais',
  'Aylmer': 'Outaouais',
  'Buckingham': 'Outaouais',
  'Maniwaki': 'Outaouais',
  'Val-des-Monts': 'Outaouais',
  'Cantley': 'Outaouais',
  'Chelsea': 'Outaouais',

  // Abitibi-Témiscamingue
  'Rouyn-Noranda': 'Abitibi-Témiscamingue',
  'Val-d\'Or': 'Abitibi-Témiscamingue',
  'Amos': 'Abitibi-Témiscamingue',
  'La Sarre': 'Abitibi-Témiscamingue',
  'Ville-Marie': 'Abitibi-Témiscamingue',
  'Malartic': 'Abitibi-Témiscamingue',
  'BOURMONT': 'Abitibi-Témiscamingue',

  // Côte-Nord
  'Sept-Îles': 'Côte-Nord',
  'Baie-Comeau': 'Côte-Nord',
  'Port-Cartier': 'Côte-Nord',
  'Havre-Saint-Pierre': 'Côte-Nord',
  'Forestville': 'Côte-Nord',

  // Nord-du-Québec
  'Chibougamau': 'Nord-du-Québec',
  'Chapais': 'Nord-du-Québec',
  'Lebel-sur-Quévillon': 'Nord-du-Québec',
  'Matagami': 'Nord-du-Québec',

  // Gaspésie-Îles-de-la-Madeleine
  'Gaspé': 'Gaspésie-Îles-de-la-Madeleine',
  'Percé': 'Gaspésie-Îles-de-la-Madeleine',
  'Chandler': 'Gaspésie-Îles-de-la-Madeleine',
  'Carleton-sur-Mer': 'Gaspésie-Îles-de-la-Madeleine',
  'New Richmond': 'Gaspésie-Îles-de-la-Madeleine',
  'Îles-de-la-Madeleine': 'Gaspésie-Îles-de-la-Madeleine',
  'Cap-Chat': 'Gaspésie-Îles-de-la-Madeleine',

  // Chaudière-Appalaches
  'Lévis': 'Chaudière-Appalaches',
  'Thetford Mines': 'Chaudière-Appalaches',
  'Saint-Georges': 'Chaudière-Appalaches',
  'Montmagny': 'Chaudière-Appalaches',
  'Sainte-Marie': 'Chaudière-Appalaches',
  'Beauceville': 'Chaudière-Appalaches',
  'Saint-Joseph-de-Beauce': 'Chaudière-Appalaches',
  'Lac-Etchemin': 'Chaudière-Appalaches',
  'Disraeli': 'Chaudière-Appalaches',
  'Saint-Victor': 'Chaudière-Appalaches',

  // Laval
  'Laval': 'Laval',

  // Lanaudière
  'Joliette': 'Lanaudière',
  'Repentigny': 'Lanaudière',
  'Terrebonne': 'Lanaudière',
  'Mascouche': 'Lanaudière',
  'L\'Assomption': 'Lanaudière',
  'Berthierville': 'Lanaudière',
  'Saint-Gabriel': 'Lanaudière',
  'Sainte-Julienne': 'Lanaudière',
  'Rawdon': 'Lanaudière',
  'Saint-Félix-de-Valois': 'Lanaudière',
  'Sainte-Anne-des-Plaines': 'Lanaudière',

  // Laurentides
  'Saint-Jérôme': 'Laurentides',
  'Blainville': 'Laurentides',
  'Boisbriand': 'Laurentides',
  'Mirabel': 'Laurentides',
  'Saint-Eustache': 'Laurentides',
  'Sainte-Thérèse': 'Laurentides',
  'Sainte-Agathe-des-Monts': 'Laurentides',
  'Mont-Tremblant': 'Laurentides',
  'Mont-Laurier': 'Laurentides',
  'Sainte-Adèle': 'Laurentides',
  'Saint-Sauveur': 'Laurentides',
  'Prévost': 'Laurentides',
  'Rosemère': 'Laurentides',
  'Deux-Montagnes': 'Laurentides',
  'Saint-Colomban': 'Laurentides',

  // Montérégie
  'Longueuil': 'Montérégie',
  'Brossard': 'Montérégie',
  'Saint-Jean-sur-Richelieu': 'Montérégie',
  'Châteauguay': 'Montérégie',
  'Granby': 'Montérégie',
  'Saint-Hyacinthe': 'Montérégie',
  'Chambly': 'Montérégie',
  'Vaudreuil-Dorion': 'Montérégie',
  'Salaberry-de-Valleyfield': 'Montérégie',
  'Sorel-Tracy': 'Montérégie',
  'Saint-Constant': 'Montérégie',
  'Varennes': 'Montérégie',
  'Boucherville': 'Montérégie',
  'La Prairie': 'Montérégie',
  'Candiac': 'Montérégie',
  'Sainte-Julie': 'Montérégie',
  'Beloeil': 'Montérégie',
  'Saint-Bruno-de-Montarville': 'Montérégie',
  'McMasterville': 'Montérégie',
  'Mont-Saint-Hilaire': 'Montérégie',
  'Saint-Basile-le-Grand': 'Montérégie',
  'Carignan': 'Montérégie',
  'Marieville': 'Montérégie',
  'Rougemont': 'Montérégie',
  'Saint-Césaire': 'Montérégie',
  'Cowansville': 'Montérégie',
  'Farnham': 'Montérégie',
  'Bedford': 'Montérégie',
  'Huntingdon': 'Montérégie',
  'Beauharnois': 'Montérégie',
  'Maple Grove': 'Montérégie',
  'Saint-Lazare': 'Montérégie',
  'Hudson': 'Montérégie',
  'Rigaud': 'Montérégie',
  'Pincourt': 'Montérégie',
  'L\'Île-Perrot': 'Montérégie',
  'Notre-Dame-de-l\'Île-Perrot': 'Montérégie',
  'Pointe-des-Cascades': 'Montérégie',
  'Les Cèdres': 'Montérégie',
  'Coteau-du-Lac': 'Montérégie',
  'Saint-Zotique': 'Montérégie',
  'Sainte-Martine': 'Montérégie',
  'Mercier': 'Montérégie',
  'Saint-Rémi': 'Montérégie',
  'Napierville': 'Montérégie',
  'Saint-Michel': 'Montérégie',
  'Hemmingford': 'Montérégie',
  'Ormstown': 'Montérégie',
  'Sainte-Clotilde': 'Montérégie',
  'Saint-Chrysostome': 'Montérégie',
  'Howick': 'Montérégie',
  'Franklin': 'Montérégie',
  'Dunham': 'Montérégie',
  'Sutton': 'Montérégie',
  'Bromont': 'Montérégie',
  'Cowansville': 'Montérégie',
  'Waterloo': 'Montérégie',
  'Eastman': 'Montérégie',
  'Bolton-Est': 'Montérégie',
  'Magog': 'Montérégie',
  'Ange-Gardien': 'Montérégie',
  'Acton Vale': 'Montérégie',
  'Upton': 'Montérégie',
  'Saint-Liboire': 'Montérégie',
  'Saint-Pie': 'Montérégie',
  'Saint-Dominique': 'Montérégie',
  'Saint-Damase': 'Montérégie',
  'Saint-Valérien-de-Milton': 'Montérégie',
  'Sainte-Hélène-de-Bagot': 'Montérégie',
  'Saint-Simon': 'Montérégie',
  'Sainte-Rosalie': 'Montérégie',
  'Saint-Barnabé-Sud': 'Montérégie',
  'Massueville': 'Montérégie',
  'Yamaska': 'Montérégie',
  'Saint-François-du-Lac': 'Montérégie',
  'Pierreville': 'Montérégie',
  'Saint-Gérard-Majella': 'Montérégie',
  'Sainte-Victoire-de-Sorel': 'Montérégie',
  'Saint-Ours': 'Montérégie',
  'Saint-Roch-de-Richelieu': 'Montérégie',
  'Saint-Denis-sur-Richelieu': 'Montérégie',
  'Saint-Antoine-sur-Richelieu': 'Montérégie',
  'Saint-Marc-sur-Richelieu': 'Montérégie',
  'Saint-Charles-sur-Richelieu': 'Montérégie',
  'La Visitation-de-Yamaska': 'Montérégie',
  'Saint-Paul-d\'Abbotsford': 'Montérégie',
  'Les Coteaux': 'Montérégie',
  'Richelieu': 'Montérégie',
  'Saint-Robert': 'Montérégie',
  'Saint-Hugues': 'Montérégie',
  'Saint-Alphonse-de-Granby': 'Montérégie',
  'La Présentation': 'Montérégie',
  'Saint-Armand': 'Montérégie',

  // Centre-du-Québec
  'Drummondville': 'Centre-du-Québec',
  'Victoriaville': 'Centre-du-Québec',
  'Bécancour': 'Centre-du-Québec',
  'Plessisville': 'Centre-du-Québec',
  'Nicolet': 'Centre-du-Québec',
  'Warwick': 'Centre-du-Québec',
  'Princeville': 'Centre-du-Québec',
  'Saint-Germain-de-Grantham': 'Centre-du-Québec',
  'Kingsey Falls': 'Centre-du-Québec',
  'Daveluyville': 'Centre-du-Québec',
  'Manseau': 'Centre-du-Québec',
  'Ham-Nord': 'Centre-du-Québec',
  'Saint-Samuel': 'Centre-du-Québec',
  'TINGWICK': 'Centre-du-Québec',
  'Tingwick': 'Centre-du-Québec',
  'Lefebvre': 'Centre-du-Québec',

  // Estrie (ajouts)
  'Orford': 'Estrie',
  'Potton': 'Estrie',
  'Val-des-Sources': 'Estrie',
  'Lac Brome': 'Estrie',
  'Lambton': 'Estrie',

  // Capitale-Nationale (ajouts)
  'Saint-Jean-de-l\'Île-d\'Orléans': 'Capitale-Nationale',
  'Baie-Saint-Paul': 'Capitale-Nationale',
  'LA MALBAIE': 'Capitale-Nationale',
  'La Malbaie': 'Capitale-Nationale',
  'wendake': 'Capitale-Nationale',
  'Wendake': 'Capitale-Nationale',
  'Sainte-Catherine-de-la-Jacques-Cartier': 'Capitale-Nationale',
  'Deschambault-Grondines': 'Capitale-Nationale',
  'L\'Isle-aux-Coudres': 'Capitale-Nationale',
  'Petite-Rivière-Saint-François': 'Capitale-Nationale',

  // Saguenay-Lac-Saint-Jean (ajouts)
  'Saint-Prime': 'Saguenay-Lac-Saint-Jean',
  'Saint-Nazaire': 'Saguenay-Lac-Saint-Jean',
  'Saint-Bruno': 'Saguenay-Lac-Saint-Jean',

  // Laurentides (ajouts)
  'Saint-Donat': 'Laurentides',
  'SAINTE-ADÈLE': 'Laurentides',
  'Sainte-Adèle': 'Laurentides',
  'Saint-Hippolyte': 'Laurentides',
  'Sainte-Anne-des-Lacs': 'Laurentides',
  'Val-Morin': 'Laurentides',

  // Montréal (ajouts)
  'Westmount': 'Montréal',
  'Mont-Royal': 'Montréal',
  'Lasalle': 'Montréal',
  'LaSalle': 'Montréal',

  // Lanaudière (ajouts)
  'Saint-Roch-de-l\'Achigan': 'Lanaudière',
  'Saint-Jacques': 'Lanaudière',
  'St-Albert': 'Lanaudière',
  'Notre-Dame-des-Prairies': 'Lanaudière',
  'Crabtree': 'Lanaudière',

  // Chaudière-Appalaches (ajouts)
  'Saint-Sévère': 'Chaudière-Appalaches',
  'Sainte-Christine': 'Chaudière-Appalaches',

  // Outaouais (ajouts)
  'Lac-Simon': 'Outaouais',

  // Gaspésie-Îles-de-la-Madeleine (ajouts)
  'LES HAUTEURS': 'Gaspésie-Îles-de-la-Madeleine',
  'Les Hauteurs': 'Gaspésie-Îles-de-la-Madeleine',
  'Les Îles-de-la-Madeleine': 'Gaspésie-Îles-de-la-Madeleine',

  // Côte-Nord (ajouts)
  'Schefferville': 'Côte-Nord',
};

async function fixMissingRegions() {
  console.log('🔧 Correction des régions manquantes...\n');

  // Get all businesses with null region
  const { data: businesses, error: fetchError } = await supabase
    .from('businesses')
    .select('id, name, city, region')
    .eq('data_source', 'req')
    .is('region', null);

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération:', fetchError.message);
    return;
  }

  console.log(`📊 ${businesses.length} entreprises sans région trouvées\n`);

  let fixed = 0;
  let notFound = 0;

  for (const business of businesses) {
    const region = cityToRegion[business.city];

    if (region) {
      // Update the business with the correct region
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ region })
        .eq('id', business.id);

      if (updateError) {
        console.error(`❌ Erreur pour ${business.name}:`, updateError.message);
      } else {
        fixed++;
        console.log(`✅ ${business.name} (${business.city}) → ${region}`);
      }
    } else {
      notFound++;
      console.log(`⚠️  Ville non trouvée: ${business.city} (${business.name})`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSUMÉ');
  console.log('═'.repeat(60));
  console.log(`✅ Régions corrigées: ${fixed}`);
  console.log(`⚠️  Villes non mappées: ${notFound}`);
  console.log('═'.repeat(60));
}

fixMissingRegions();
