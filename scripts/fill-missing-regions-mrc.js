import { createClient } from '@supabase/supabase-js';
import { quebecMunicipalities } from '../src/data/quebecMunicipalities.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  processed: 0,
  updated: 0,
  notFound: 0,
  errors: 0
};

// Mapping des arrondissements et variations vers villes principales
const cityAliases = {
  // Montréal
  'verdun': 'montreal',
  'outremont': 'montreal',
  'westmount': 'montreal',
  'mont-royal': 'montreal',
  'cote-des-neiges': 'montreal',
  'notre-dame-de-grace': 'montreal',
  'rosemont': 'montreal',
  'hochelaga-maisonneuve': 'montreal',
  'plateau-mont-royal': 'montreal',
  'villeray': 'montreal',
  'ahuntsic': 'montreal',
  'cartierville': 'montreal',
  'saint-laurent': 'montreal',
  'anjou': 'montreal',
  'mercier': 'montreal',
  'riviere-des-prairies': 'montreal',
  'pointe-aux-trembles': 'montreal',
  'lasalle': 'montreal',
  'lachine': 'montreal',
  'pierrefonds': 'montreal',
  'roxboro': 'montreal',
  'dollard-des-ormeaux': 'montreal',

  // Québec
  'st-emile': 'quebec',
  'saint-emile': 'quebec',
  'charlesbourg': 'quebec',
  'beauport': 'quebec',
  'sainte-foy': 'quebec',
  'sillery': 'quebec',
  'cap-rouge': 'quebec',
  'l\'ancienne-lorette': 'quebec',
  'loretteville': 'quebec',
  'vanier': 'quebec',

  // Lévis
  'saint-david-de-l\'auberiviere': 'levis',
  'saint-nicolas': 'levis',
  'saint-redempteur': 'levis',
  'charny': 'levis',

  // Variations courantes
  'trois-rivieres-ouest': 'trois-rivieres',
  'shawinigan-sud': 'shawinigan',
  'jonquiere': 'saguenay',
  'chicoutimi': 'saguenay',
  'la-baie': 'saguenay',
  'gatineau': 'gatineau',
  'hull': 'gatineau',
  'aylmer': 'gatineau',
  'buckingham': 'gatineau',
  'masson-angers': 'gatineau'
};

// Fonction pour normaliser les noms de ville
function normalizeCity(city) {
  if (!city) return '';

  // Enlever préfixes comme "Canton", "Municipalité", etc.
  let cleaned = city
    .replace(/^(canton|municipalite|ville|paroisse)\s+/i, '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^\w\s-]/g, '') // Enlever la ponctuation
    .replace(/\s+/g, '-');

  // Vérifier si c'est un alias
  if (cityAliases[cleaned]) {
    cleaned = cityAliases[cleaned];
  }

  return cleaned;
}

// Créer un index inversé: ville → { region, mrc }
function buildCityIndex() {
  const index = new Map();

  for (const [regionSlug, regionData] of Object.entries(quebecMunicipalities)) {
    for (const [mrcSlug, mrcData] of Object.entries(regionData.mrcs)) {
      for (const city of mrcData.cities) {
        const normalizedCity = normalizeCity(city);
        index.set(normalizedCity, {
          region: regionSlug,
          regionName: regionData.name,
          mrc: mrcSlug,
          mrcName: mrcData.name,
          originalCity: city
        });
      }
    }
  }

  console.log(`📚 Index créé avec ${index.size} villes`);
  return index;
}

// Trouver la région et MRC pour une ville donnée
function findRegionAndMRC(city, cityIndex) {
  if (!city) return null;

  // Essayer d'abord avec le nom exact normalisé
  const normalized = normalizeCity(city);
  let result = cityIndex.get(normalized);
  if (result) return result;

  // Essayer en enlevant les parties entre parenthèses (ex: "Montreal (Quebec)" → "Montreal")
  const withoutParens = city.replace(/\s*\([^)]*\)/g, '').trim();
  if (withoutParens !== city) {
    result = cityIndex.get(normalizeCity(withoutParens));
    if (result) return result;
  }

  // Fuzzy matching: chercher dans toutes les villes si ça commence pareil
  for (const [cityKey, location] of cityIndex.entries()) {
    // Match exact partiel (début de chaîne)
    if (cityKey.startsWith(normalized) || normalized.startsWith(cityKey)) {
      return location;
    }
  }

  // Essayer de matcher sur les 2-3 premiers mots pour les noms composés
  const parts = normalized.split('-').filter(p => p.length > 0);
  if (parts.length > 1) {
    // Essayer les 3 premiers mots
    for (let i = Math.min(3, parts.length); i >= 2; i--) {
      const partial = parts.slice(0, i).join('-');
      for (const [cityKey, location] of cityIndex.entries()) {
        if (cityKey.startsWith(partial) || partial.startsWith(cityKey)) {
          return location;
        }
      }
    }
  }

  // Dernier recours: chercher des correspondances approximatives
  // par exemple "st-jerome" devrait matcher "saint-jerome"
  const variations = [
    normalized.replace(/^st-/, 'saint-'),
    normalized.replace(/^saint-/, 'st-'),
    normalized.replace(/^ste-/, 'sainte-'),
    normalized.replace(/^sainte-/, 'ste-')
  ];

  for (const variation of variations) {
    if (variation !== normalized) {
      result = cityIndex.get(variation);
      if (result) return result;
    }
  }

  return null;
}

async function fillMissingRegionsMRC() {
  console.log('🚀 Début du remplissage des régions et MRC manquantes...\n');

  // Construire l'index des villes
  const cityIndex = buildCityIndex();

  // Récupérer les entreprises sans région ou MRC
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    console.log(`\n📥 Chargement des entreprises ${from} à ${from + pageSize}...`);

    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, city, region, mrc')
      .or('region.is.null,region.eq.,mrc.is.null,mrc.eq.')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Erreur lors du chargement:', error.message);
      stats.errors++;
      break;
    }

    if (!businesses || businesses.length === 0) {
      hasMore = false;
      break;
    }

    // Traiter chaque entreprise
    const updates = [];

    for (const business of businesses) {
      stats.processed++;

      // Chercher la région et MRC
      const location = findRegionAndMRC(business.city, cityIndex);

      if (location) {
        // Préparer la mise à jour seulement si nécessaire
        const needsUpdate = !business.region || !business.mrc;

        if (needsUpdate) {
          updates.push({
            id: business.id,
            region: location.region,
            mrc: location.mrc
          });
          stats.updated++;
        }
      } else {
        stats.notFound++;
        if (stats.notFound <= 10) {
          console.log(`⚠️  Ville non trouvée: "${business.city}" (${business.name})`);
        }
      }
    }

    // Mettre à jour par batch
    if (updates.length > 0) {
      console.log(`💾 Mise à jour de ${updates.length} entreprises...`);

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            region: update.region,
            mrc: update.mrc
          })
          .eq('id', update.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour ID ${update.id}:`, updateError.message);
          stats.errors++;
        }
      }
    }

    console.log(`   Traité: ${stats.processed} | Mis à jour: ${stats.updated} | Non trouvés: ${stats.notFound}`);

    from += pageSize;
    hasMore = businesses.length === pageSize;

    // Petit délai pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✅ TERMINÉ!\n');
  console.log('═══════════════════════════════════');
  console.log('📊 STATISTIQUES FINALES:');
  console.log('═══════════════════════════════════');
  console.log(`Entreprises traitées: ${stats.processed}`);
  console.log(`Mises à jour: ${stats.updated}`);
  console.log(`Villes non trouvées: ${stats.notFound}`);
  console.log(`Erreurs: ${stats.errors}`);
  console.log('═══════════════════════════════════\n');
}

// Lancer le script
fillMissingRegionsMRC().catch(console.error);
