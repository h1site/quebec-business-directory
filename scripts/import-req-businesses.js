/**
 * Script d'import des entreprises depuis le Registre des Entreprises du Québec (REQ)
 *
 * PRÉREQUIS:
 * 1. Télécharger le dataset depuis: https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises
 * 2. Placer le fichier CSV dans: data/req-entreprises.csv
 * 3. Exécuter la migration: supabase/migration_add_req_import_support.sql
 *
 * UTILISATION:
 * node scripts/import-req-businesses.js
 *
 * OPTIONS:
 * --limit=1000    Limiter à 1000 entreprises (pour test)
 * --dry-run       Afficher les données sans les insérer
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY ou VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments en ligne de commande
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;
const offsetArg = args.find(arg => arg.startsWith('--offset='));
const offset = offsetArg ? parseInt(offsetArg.split('=')[1]) : 0;
const dryRun = args.includes('--dry-run');

console.log('🚀 Import des entreprises depuis le REQ');
console.log('📊 Configuration:', { limit, offset, dryRun });

/**
 * Mapping Ville → MRC → Région
 * Réutilise la logique de migration_add_mrc_to_businesses.sql
 */
const cityToLocation = {
  // Montérégie
  'Vaudreuil-Dorion': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Vaudreuil-sur-le-Lac': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'L\'Île-Perrot': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Notre-Dame-de-l\'Île-Perrot': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Pincourt': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Hudson': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Saint-Lazare': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Longueuil': { mrc: 'Longueuil', region: 'Montérégie' },
  'Brossard': { mrc: 'Longueuil', region: 'Montérégie' },
  'Saint-Lambert': { mrc: 'Longueuil', region: 'Montérégie' },
  'Boucherville': { mrc: 'Longueuil', region: 'Montérégie' },
  'Saint-Jean-sur-Richelieu': { mrc: 'Le Haut-Richelieu', region: 'Montérégie' },
  'Chambly': { mrc: 'La Vallée-du-Richelieu', region: 'Montérégie' },
  'Saint-Hyacinthe': { mrc: 'Les Maskoutains', region: 'Montérégie' },
  'Granby': { mrc: 'La Haute-Yamaska', region: 'Montérégie' },
  'Salaberry-de-Valleyfield': { mrc: 'Beauharnois-Salaberry', region: 'Montérégie' },
  'Châteauguay': { mrc: 'Roussillon', region: 'Montérégie' },
  'La Prairie': { mrc: 'Roussillon', region: 'Montérégie' },
  'Candiac': { mrc: 'Roussillon', region: 'Montérégie' },
  'Sainte-Julie': { mrc: 'Marguerite-D\'Youville', region: 'Montérégie' },
  'Varennes': { mrc: 'Marguerite-D\'Youville', region: 'Montérégie' },
  'Sorel-Tracy': { mrc: 'Pierre-De Saurel', region: 'Montérégie' },

  // Montréal
  'Montréal': { mrc: 'Montréal', region: 'Montréal' },
  'Montreal': { mrc: 'Montréal', region: 'Montréal' },

  // Laval
  'Laval': { mrc: 'Laval', region: 'Laval' },

  // Laurentides
  'Saint-Jérôme': { mrc: 'La Rivière-du-Nord', region: 'Laurentides' },
  'Blainville': { mrc: 'Thérèse-De Blainville', region: 'Laurentides' },
  'Sainte-Thérèse': { mrc: 'Thérèse-De Blainville', region: 'Laurentides' },
  'Boisbriand': { mrc: 'Thérèse-De Blainville', region: 'Laurentides' },
  'Mirabel': { mrc: 'Mirabel', region: 'Laurentides' },
  'Saint-Eustache': { mrc: 'Deux-Montagnes', region: 'Laurentides' },
  'Sainte-Agathe-des-Monts': { mrc: 'Les Laurentides', region: 'Laurentides' },
  'Mont-Tremblant': { mrc: 'Les Laurentides', region: 'Laurentides' },

  // Lanaudière
  'Terrebonne': { mrc: 'Les Moulins', region: 'Lanaudière' },
  'Mascouche': { mrc: 'Les Moulins', region: 'Lanaudière' },
  'Repentigny': { mrc: 'L\'Assomption', region: 'Lanaudière' },
  'L\'Assomption': { mrc: 'L\'Assomption', region: 'Lanaudière' },
  'Joliette': { mrc: 'Joliette', region: 'Lanaudière' },

  // Capitale-Nationale
  'Québec': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'Quebec': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'Lévis': { mrc: 'Lévis', region: 'Chaudière-Appalaches' },

  // Outaouais
  'Gatineau': { mrc: 'Gatineau', region: 'Outaouais' },

  // Estrie
  'Sherbrooke': { mrc: 'Sherbrooke', region: 'Estrie' },

  // Mauricie
  'Trois-Rivières': { mrc: 'Trois-Rivières', region: 'Mauricie' },
  'Shawinigan': { mrc: 'Shawinigan', region: 'Mauricie' },

  // Saguenay-Lac-Saint-Jean
  'Saguenay': { mrc: 'Saguenay', region: 'Saguenay-Lac-Saint-Jean' },
  'Alma': { mrc: 'Lac-Saint-Jean-Est', region: 'Saguenay-Lac-Saint-Jean' },
  'Roberval': { mrc: 'Le Domaine-du-Roy', region: 'Saguenay-Lac-Saint-Jean' },
  'Dolbeau-Mistassini': { mrc: 'Maria-Chapdelaine', region: 'Saguenay-Lac-Saint-Jean' },
  'Saint-Félicien': { mrc: 'Le Domaine-du-Roy', region: 'Saguenay-Lac-Saint-Jean' },

  // Abitibi-Témiscamingue
  'Rouyn-Noranda': { mrc: 'Rouyn-Noranda', region: 'Abitibi-Témiscamingue' },
  'Val-d\'Or': { mrc: 'La Vallée-de-l\'Or', region: 'Abitibi-Témiscamingue' },
  'Amos': { mrc: 'Abitibi', region: 'Abitibi-Témiscamingue' },

  // Côte-Nord
  'Sept-Îles': { mrc: 'Sept-Rivières', region: 'Côte-Nord' },
  'Baie-Comeau': { mrc: 'Manicouagan', region: 'Côte-Nord' },
  'Port-Cartier': { mrc: 'Sept-Rivières', region: 'Côte-Nord' },

  // Gaspésie-Îles-de-la-Madeleine
  'Gaspé': { mrc: 'La Côte-de-Gaspé', region: 'Gaspésie-Îles-de-la-Madeleine' },
  'Rimouski': { mrc: 'Rimouski-Neigette', region: 'Bas-Saint-Laurent' },
  'Matane': { mrc: 'La Matanie', region: 'Bas-Saint-Laurent' },
  'Rivière-du-Loup': { mrc: 'Rivière-du-Loup', region: 'Bas-Saint-Laurent' },

  // Chaudière-Appalaches
  'Lévis': { mrc: 'Lévis', region: 'Chaudière-Appalaches' },
  'Thetford Mines': { mrc: 'Les Appalaches', region: 'Chaudière-Appalaches' },
  'Saint-Georges': { mrc: 'Beauce-Sartigan', region: 'Chaudière-Appalaches' },
  'Montmagny': { mrc: 'Montmagny', region: 'Chaudière-Appalaches' },
  'Lac-Etchemin': { mrc: 'Les Etchemins', region: 'Chaudière-Appalaches' },

  // Centre-du-Québec
  'Drummondville': { mrc: 'Drummondville', region: 'Centre-du-Québec' },
  'Victoriaville': { mrc: 'Arthabaska', region: 'Centre-du-Québec' },
  'Nicolet': { mrc: 'Nicolet-Yamaska', region: 'Centre-du-Québec' },

  // Montérégie - Plus de villes
  'Beloeil': { mrc: 'La Vallée-du-Richelieu', region: 'Montérégie' },
  'Saint-Bruno-de-Montarville': { mrc: 'La Vallée-du-Richelieu', region: 'Montérégie' },
  'Saint-Basile-le-Grand': { mrc: 'Marguerite-D\'Youville', region: 'Montérégie' },
  'Vaudreuil': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Rigaud': { mrc: 'Vaudreuil-Soulanges', region: 'Montérégie' },
  'Pointe-Claire': { mrc: 'Montréal', region: 'Montréal' },
  'Dollard-des-Ormeaux': { mrc: 'Montréal', region: 'Montréal' },
  'Beaconsfield': { mrc: 'Montréal', region: 'Montréal' },
  'Kirkland': { mrc: 'Montréal', region: 'Montréal' },
  'Saint-Constant': { mrc: 'Roussillon', region: 'Montérégie' },
  'Delson': { mrc: 'Roussillon', region: 'Montérégie' },
  'Mercier': { mrc: 'Roussillon', region: 'Montérégie' },
  'Beauharnois': { mrc: 'Beauharnois-Salaberry', region: 'Montérégie' },
  'Huntingdon': { mrc: 'Le Haut-Saint-Laurent', region: 'Montérégie' },
  'Marieville': { mrc: 'Rouville', region: 'Montérégie' },
  'Mont-Saint-Hilaire': { mrc: 'La Vallée-du-Richelieu', region: 'Montérégie' },
  'Verchères': { mrc: 'Marguerite-D\'Youville', region: 'Montérégie' },
  'Contrecoeur': { mrc: 'Marguerite-D\'Youville', region: 'Montérégie' },
  'Saint-Amable': { mrc: 'Marguerite-D\'Youville', region: 'Montérégie' },
  'Cowansville': { mrc: 'Brome-Missisquoi', region: 'Montérégie' },

  // Laurentides - Plus de villes
  'Rosemère': { mrc: 'Thérèse-De Blainville', region: 'Laurentides' },
  'Lorraine': { mrc: 'Thérèse-De Blainville', region: 'Laurentides' },
  'Bois-des-Filion': { mrc: 'Thérèse-De Blainville', region: 'Laurentides' },
  'Deux-Montagnes': { mrc: 'Deux-Montagnes', region: 'Laurentides' },
  'Saint-Joseph-du-Lac': { mrc: 'Deux-Montagnes', region: 'Laurentides' },
  'Oka': { mrc: 'Deux-Montagnes', region: 'Laurentides' },
  'Sainte-Adèle': { mrc: 'Les Pays-d\'en-Haut', region: 'Laurentides' },
  'Sainte-Sophie': { mrc: 'La Rivière-du-Nord', region: 'Laurentides' },
  'Prévost': { mrc: 'La Rivière-du-Nord', region: 'Laurentides' },
  'Mont-Tremblant': { mrc: 'Les Laurentides', region: 'Laurentides' },
  'MONT-TREMBLANT': { mrc: 'Les Laurentides', region: 'Laurentides' },

  // Lanaudière - Plus de villes
  'L\'Épiphanie': { mrc: 'L\'Assomption', region: 'Lanaudière' },
  'Lavaltrie': { mrc: 'D\'Autray', region: 'Lanaudière' },
  'Berthierville': { mrc: 'D\'Autray', region: 'Lanaudière' },
  'Saint-Charles-Borromée': { mrc: 'Joliette', region: 'Lanaudière' },
  'Rawdon': { mrc: 'Matawinie', region: 'Lanaudière' },

  // Capitale-Nationale - Plus de villes
  'Sainte-Foy': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'Beauport': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'Charlesbourg': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'L\'Ancienne-Lorette': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'Saint-Augustin-de-Desmaures': { mrc: 'Québec', region: 'Capitale-Nationale' },
  'Donnacona': { mrc: 'Portneuf', region: 'Capitale-Nationale' },
  'Pont-Rouge': { mrc: 'Portneuf', region: 'Capitale-Nationale' },

  // Mauricie - Plus de villes
  'Grand-Mère': { mrc: 'Shawinigan', region: 'Mauricie' },
  'La Tuque': { mrc: 'La Tuque', region: 'Mauricie' },
  'Louiseville': { mrc: 'Maskinongé', region: 'Mauricie' },

  // Estrie - Plus de villes
  'Magog': { mrc: 'Memphrémagog', region: 'Estrie' },
  'Bromont': { mrc: 'Brome-Missisquoi', region: 'Estrie' },
  'Cowansville': { mrc: 'Brome-Missisquoi', region: 'Estrie' },
  'Asbestos': { mrc: 'Les Sources', region: 'Estrie' },

  // Outaouais - Plus de villes
  'Aylmer': { mrc: 'Gatineau', region: 'Outaouais' },
  'Hull': { mrc: 'Gatineau', region: 'Outaouais' },
  'Buckingham': { mrc: 'Gatineau', region: 'Outaouais' },
  'Masson-Angers': { mrc: 'Gatineau', region: 'Outaouais' },
  'Val-des-Monts': { mrc: 'Les Collines-de-l\'Outaouais', region: 'Outaouais' },
  'Chelsea': { mrc: 'Les Collines-de-l\'Outaouais', region: 'Outaouais' },

  // Variantes de noms de villes (avec St, St-, etc.)
  'St-Jean sur Richelieu': { mrc: 'Le Haut-Richelieu', region: 'Montérégie' },
  'St-Jérôme': { mrc: 'La Rivière-du-Nord', region: 'Laurentides' },
  'St-Césaire': { mrc: 'Rouville', region: 'Montérégie' },
  'St-Isidore': { mrc: 'Roussillon', region: 'Montérégie' },
  'St-Nazaire': { mrc: 'Lac-Saint-Jean-Est', region: 'Saguenay-Lac-Saint-Jean' },
  'MONT-ST-GRÉGOIRE': { mrc: 'Le Haut-Richelieu', region: 'Montérégie' },

  // Variantes avec apostrophes et espaces
  'Val d\'Or': { mrc: 'La Vallée-de-l\'Or', region: 'Abitibi-Témiscamingue' },
  'Sainte-Marthe-sur-le-Lac': { mrc: 'Deux-Montagnes', region: 'Laurentides' },
  'Sainte-Mélanie': { mrc: 'Joliette', region: 'Lanaudière' },
  'Saint-Nérée-de-Bellechasse': { mrc: 'Bellechasse', region: 'Chaudière-Appalaches' },
  'SAINT-ÉLIE': { mrc: 'Les Maskoutains', region: 'Montérégie' },

  // Estrie
  'Valcourt': { mrc: 'Le Val-Saint-François', region: 'Estrie' },
  'Cascapédia--Saint-Jules': { mrc: 'Avignon', region: 'Gaspésie-Îles-de-la-Madeleine' },

  // Bas-Saint-Laurent / Gaspésie
  'CAUSAPSCAL': { mrc: 'La Matapédia', region: 'Bas-Saint-Laurent' },
  'RIVIÈRE-AU-RENARD': { mrc: 'La Côte-de-Gaspé', region: 'Gaspésie-Îles-de-la-Madeleine' }
};

/**
 * Générer un slug SEO-friendly basé sur le nom de l'entreprise
 * Retourne slug simple d'abord, ajoute ville si collision détectée ultérieurement
 */
function generateBaseSlug(name, city = '') {
  if (!name) return null;

  const base = name
    .toLowerCase()
    .normalize('NFD') // Décomposer les accents
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer caractères spéciaux par tirets
    .replace(/(^-|-$)/g, '') // Retirer tirets début/fin
    .substring(0, 50); // Limiter longueur

  // Normaliser la ville pour le slug
  const citySlug = city
    ? city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : '';

  return { base, citySlug };
}

/**
 * Générer un slug unique en vérifiant les doublons
 * Stratégie: nom → nom-ville (si doublon) → nom-ville-2 (si encore doublon)
 */
async function generateUniqueSlug(name, city, neq, etablissement) {
  const { base, citySlug } = generateBaseSlug(name, city);

  // Tenter d'abord le slug simple
  let slug = base;
  let { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single();

  // Si collision, ajouter la ville
  if (existing) {
    slug = citySlug ? `${base}-${citySlug}` : base;

    const { data: existingWithCity } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single();

    // Si encore collision, ajouter suffixe numérique
    if (existingWithCity) {
      let counter = 2;
      let finalSlug = `${slug}-${counter}`;

      while (true) {
        const { data: check } = await supabase
          .from('businesses')
          .select('id')
          .eq('slug', finalSlug)
          .single();

        if (!check) {
          slug = finalSlug;
          break;
        }
        counter++;
        finalSlug = `${slug}-${counter}`;
      }
    }
  }

  return slug;
}

/**
 * Trouver la catégorie basée sur le code SCIAN
 */
async function findCategoryByScian(scianCode) {
  if (!scianCode) {
    return { main_category_id: null, sub_category_id: null, confidence: 0 };
  }

  // Chercher mapping exact en commençant par le code le plus précis (6 → 5 → 4 → 3 → 2 chiffres)
  for (let digits = scianCode.length; digits >= 2; digits--) {
    const code = scianCode.substring(0, digits);

    const { data, error } = await supabase
      .from('scian_category_mapping')
      .select('main_category_id, sub_category_id, confidence_level')
      .eq('scian_code', code)
      .order('confidence_level', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      return {
        main_category_id: data.main_category_id,
        sub_category_id: data.sub_category_id,
        confidence: data.confidence_level
      };
    }
  }

  return { main_category_id: null, sub_category_id: null, confidence: 0 };
}

/**
 * Insérer un batch d'entreprises (en ignorant les doublons NEQ + établissement)
 */
async function batchInsert(businesses) {
  if (dryRun) {
    console.log(`🔍 [DRY-RUN] Affichage de ${businesses.length} entreprises:`);
    console.table(businesses.slice(0, 3)); // Afficher 3 exemples
    return { count: businesses.length, errors: [] };
  }

  // Vérifier quels NEQ + etablissement_number existent déjà
  const neqs = businesses.map(b => b.neq).filter(Boolean);
  const { data: existing } = await supabase
    .from('businesses')
    .select('neq, etablissement_number')
    .in('neq', neqs);

  // Créer un Set avec clé composite "neq-etab"
  const existingKeys = new Set(
    (existing || []).map(b => `${b.neq}-${b.etablissement_number}`)
  );

  // Filtrer les entreprises qui n'existent pas déjà
  const newBusinesses = businesses.filter(
    b => !existingKeys.has(`${b.neq}-${b.etablissement_number}`)
  );

  if (newBusinesses.length === 0) {
    console.log('⚠️  Toutes les entreprises de ce batch existent déjà');
    return { count: 0, errors: [], skipped: businesses.length };
  }

  if (existingKeys.size > 0) {
    const skipped = businesses.length - newBusinesses.length;
    console.log(`⏭️  Ignoré ${skipped} entreprise(s) déjà existante(s)`);
  }

  // Gérer les doublons de slugs DANS LE BATCH
  const slugCounts = {};
  const finalBusinesses = newBusinesses.map(business => {
    let finalSlug = business.slug;

    // Si ce slug apparaît plusieurs fois dans le batch, ajouter ville
    if (slugCounts[finalSlug]) {
      slugCounts[finalSlug]++;
      const citySlug = business.city
        ? business.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : '';
      finalSlug = citySlug ? `${business.slug}-${citySlug}` : `${business.slug}-${slugCounts[finalSlug]}`;
    } else {
      slugCounts[finalSlug] = 1;
    }

    return { ...business, slug: finalSlug };
  });

  const { data, error} = await supabase
    .from('businesses')
    .insert(finalBusinesses)
    .select('id, neq, name');

  if (error) {
    console.error('❌ Erreur lors de l\'insertion:', error.message);
    const skipped = businesses.length - finalBusinesses.length;
    return { count: 0, errors: [error], skipped: skipped };
  }

  const skipped = businesses.length - finalBusinesses.length;
  return { count: data.length, errors: [], skipped: skipped };
}

/**
 * Assigner les catégories basées sur SCIAN
 */
async function assignCategoryToBusinesses(businessIds, subCategoryId) {
  if (!subCategoryId || dryRun) return;

  const relations = businessIds.map(businessId => ({
    business_id: businessId,
    sub_category_id: subCategoryId,
    is_primary: true
  }));

  const { error } = await supabase
    .from('business_categories')
    .insert(relations);

  if (error) {
    console.error('⚠️ Erreur lors de l\'assignation des catégories:', error.message);
  }
}

/**
 * Fonction principale d'import
 */
async function importREQData() {
  const csvPath = path.join(__dirname, '..', 'data', 'req-entreprises.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('❌ Fichier CSV introuvable:', csvPath);
    console.log('');
    console.log('📥 Pour obtenir le fichier:');
    console.log('   1. Visitez: https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises');
    console.log('   2. Téléchargez le fichier CSV');
    console.log('   3. Placez-le dans: data/req-entreprises.csv');
    console.log('');
    process.exit(1);
  }

  console.log('📂 Lecture du fichier CSV:', csvPath);

  let totalRead = 0;
  let totalInserted = 0;
  let totalErrors = 0;
  let totalSkipped = 0;
  let batch = [];
  const batchSize = 100; // Insérer par batch de 100 pour performance

  // Statistiques
  const stats = {
    withLocation: 0,
    withCategory: 0,
    withScian: 0
  };

  return new Promise((resolve, reject) => {
    let rowIndex = 0;

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', async (row) => {
        rowIndex++;

        // Skip rows before offset
        if (rowIndex <= offset) return;

        // Stop after limit
        if (totalRead >= limit) return;

        totalRead++;

        // Parser les champs du format officiel REQ Etablissements.csv
        // Note: Gérer BOM (Byte Order Mark) dans le CSV qui peut préfixer NEQ
        const neq = row.NEQ || row['﻿NEQ'] || row[Object.keys(row)[0]]; // Gère BOM
        const etablissement = row.NO_SUF_ETAB || '1'; // Numéro d'établissement (pour multi-établissements)
        const name = row.NOM_ETAB || 'Entreprise sans nom';
        const addressLine1 = row.LIGN1_ADR || '';
        const addressLine2 = row.LIGN2_ADR || ''; // Contient "Ville (Québec)"
        const lign3 = row.LIGN3_ADR || ''; // Parfois le code postal est ici
        const lign4 = row.LIGN4_ADR || ''; // Ou ici
        const scianCode = row.COD_ACT_ECON || row.COD_ACT_ECON2;
        const scianDesc = row.DESC_ACT_ECON_ETAB || row.DESC_ACT_ECON_ETAB2;

        if (!neq) {
          console.log('⚠️ Ligne sans NEQ ignorée:', row);
          return;
        }

        // Parser ville et code postal
        let city = '';
        let postalCode = '';

        // Extraire ville depuis LIGN2_ADR (format: "Montréal (Québec)" ou "MONT-TREMBLANT QC")
        if (addressLine2) {
          // Extraire ville (avant "(Québec)" ou "(QC)" ou "QC")
          const cityMatch = addressLine2.match(/^([^(]+?)\s*(?:\((?:Québec|QC)\)|\s+QC)?$/i);
          if (cityMatch) {
            city = cityMatch[1].trim();
          } else {
            // Fallback: prendre toute la ligne si pas de pattern match
            city = addressLine2.replace(/\s*\((?:Québec|QC)\)|\s+QC/gi, '').trim();
          }
        }

        // Extraire code postal depuis LIGN3_ADR, LIGN4_ADR ou LIGN2_ADR
        const postalSources = [lign4, lign3, addressLine2];
        for (const source of postalSources) {
          if (source) {
            // Format: H1J1Z1 ou H1J 1Z1 ou "H1J 1Z1"
            const postalMatch = source.match(/([A-Z]\d[A-Z]\s?\d[A-Z]\d)/i);
            if (postalMatch) {
              postalCode = postalMatch[1].replace(/\s/g, '').toUpperCase();
              break;
            }
          }
        }

        // Filtrer: seulement établissements principaux
        const isPrincipal = row.IND_ETAB_PRINC === 'O';
        const status = 'actif'; // Etablissements.csv contient seulement actifs

        // Filtrer: seulement entreprises actives
        if (status && status.toLowerCase().includes('inactif')) {
          return;
        }

        // Filtrer: ignorer les entreprises "9000-XXXX QUÉBEC INC."
        // Ce sont des numéros génériques sans nom significatif
        if (name && /^9\d{3}-\d{4}\s+QU[ÉE]BEC\s+INC/i.test(name)) {
          return;
        }

        // Filtrer: ignorer les entreprises commençant par "3XXX-XXXX QUÉBEC INC." ou "3XXXXXXX CANADA INC."
        // Ce sont aussi des numéros de corporation génériques
        if (name && /^3\d{3,7}[-\s]?\d{0,4}\s+(QU[ÉE]BEC|CANADA)\s+INC/i.test(name)) {
          return;
        }

        // Trouver MRC et région
        const location = cityToLocation[city] || { mrc: null, region: null };
        if (location.mrc) stats.withLocation++;
        if (scianCode) stats.withScian++;

        // Générer slug unique (async)
        const slug = await generateUniqueSlug(name, city, neq, etablissement);

        const business = {
          neq: neq,
          etablissement_number: etablissement,
          name: name,
          address: addressLine1,
          city: city,
          mrc: location.mrc,
          region: location.region,
          postal_code: postalCode,
          province: 'QC',
          scian_code: scianCode,
          scian_description: scianDesc,
          slug: slug,
          data_source: 'req',
          is_claimed: false,
          owner_id: null,
          auto_categorized: scianCode ? true : false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        batch.push(business);

        // Insérer par batch
        if (batch.length >= batchSize) {
          const result = await batchInsert([...batch]);
          totalInserted += result.count;
          totalErrors += result.errors.length;
          totalSkipped += result.skipped || 0;

          console.log(`✅ Importé ${totalInserted}/${totalRead} entreprises (${Math.round(totalInserted/totalRead*100)}%) | Ignoré: ${totalSkipped}`);

          batch = [];
        }

        // Log progression
        if (totalRead % 500 === 0) {
          console.log(`📊 Progression: ${totalRead} entreprises lues`);
          console.log(`   - Avec location: ${stats.withLocation} (${Math.round(stats.withLocation/totalRead*100)}%)`);
          console.log(`   - Avec SCIAN: ${stats.withScian} (${Math.round(stats.withScian/totalRead*100)}%)`);
        }
      })
      .on('end', async () => {
        // Insérer dernier batch
        if (batch.length > 0) {
          const result = await batchInsert(batch);
          totalInserted += result.count;
          totalSkipped += result.skipped || 0;
        }

        console.log('');
        console.log('✅ Import terminé!');
        console.log('═'.repeat(50));
        console.log(`📊 Statistiques:`);
        console.log(`   Total lu:        ${totalRead}`);
        console.log(`   Total inséré:    ${totalInserted}`);
        console.log(`   Total ignoré:    ${totalSkipped} (déjà existants)`);
        console.log(`   Erreurs:         ${totalErrors}`);
        console.log(`   Avec location:   ${stats.withLocation} (${Math.round(stats.withLocation/totalRead*100)}%)`);
        console.log(`   Avec SCIAN:      ${stats.withScian} (${Math.round(stats.withScian/totalRead*100)}%)`);
        console.log('═'.repeat(50));
        console.log('');
        console.log('⏭️  Prochaine étape: Assigner les catégories basées sur SCIAN');
        console.log('   node scripts/assign-categories-from-scian.js');

        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Erreur lors de la lecture du CSV:', error);
        reject(error);
      });
  });
}

// Exécuter l'import
importREQData()
  .then(() => {
    console.log('🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
