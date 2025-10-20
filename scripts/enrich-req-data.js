/**
 * Script d'enrichissement des données REQ via Google Places API
 * Récupère: téléphone, site web, horaires, note Google, avis, photos
 *
 * UTILISATION:
 * node scripts/enrich-req-data.js
 *
 * OPTIONS:
 * --limit=100   Limiter à 100 entreprises
 * --dry-run     Afficher les résultats sans les sauvegarder
 *
 * PRÉREQUIS:
 * - VITE_GOOGLE_MAPS_API_KEY dans .env
 * - API Google Places activée
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!googleApiKey) {
  console.error('❌ VITE_GOOGLE_MAPS_API_KEY manquant dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 100;
const dryRun = args.includes('--dry-run');

console.log('🌐 Enrichissement des données REQ via Google Places API');
console.log('📊 Configuration:', { limit, dryRun });
console.log('');

// Statistiques
const stats = {
  total: 0,
  enriched: 0,
  notFound: 0,
  errors: 0,
  phoneAdded: 0,
  websiteAdded: 0,
  ratingAdded: 0,
  hoursAdded: 0
};

/**
 * Rechercher une entreprise sur Google Places
 */
async function searchGooglePlaces(businessName, address, city) {
  const query = `${businessName}, ${address}, ${city}, Québec`;

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address&key=${googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].place_id;
    }

    return null;
  } catch (error) {
    console.error('❌ Erreur recherche Google Places:', error.message);
    return null;
  }
}

/**
 * Récupérer les détails d'un lieu Google Places
 */
async function getPlaceDetails(placeId) {
  const fields = [
    'name',
    'formatted_phone_number',
    'international_phone_number',
    'website',
    'rating',
    'user_ratings_total',
    'opening_hours',
    'geometry',
    'photos',
    'reviews',
    'url',
    'types',
    'business_status',
    'formatted_address'
  ].join(',');

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${googleApiKey}&language=fr`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.result;
    }

    return null;
  } catch (error) {
    console.error('❌ Erreur détails Google Places:', error.message);
    return null;
  }
}

/**
 * Enrichir une entreprise
 */
async function enrichBusiness(business) {
  console.log(`🔍 ${business.name} (${business.city})`);

  // Rechercher sur Google Places
  const placeId = await searchGooglePlaces(business.name, business.address, business.city);

  if (!placeId) {
    console.log('   ⚠️  Non trouvé sur Google Places');
    stats.notFound++;
    return null;
  }

  console.log(`   ✅ Trouvé: ${placeId}`);

  // Récupérer les détails
  const details = await getPlaceDetails(placeId);

  if (!details) {
    console.log('   ⚠️  Impossible de récupérer les détails');
    stats.errors++;
    return null;
  }

  // Préparer les données d'enrichissement
  const enrichmentData = {
    google_place_id: placeId,
    google_maps_url: details.url || null
  };

  // Téléphone
  if (details.formatted_phone_number || details.international_phone_number) {
    enrichmentData.phone = details.formatted_phone_number || details.international_phone_number;
    console.log(`   📞 Téléphone: ${enrichmentData.phone}`);
    stats.phoneAdded++;
  }

  // Site web
  if (details.website) {
    enrichmentData.website = details.website;
    console.log(`   🌐 Site web: ${enrichmentData.website}`);
    stats.websiteAdded++;
  }

  // Note Google
  if (details.rating) {
    enrichmentData.google_rating = details.rating;
    enrichmentData.google_reviews_count = details.user_ratings_total || 0;
    console.log(`   ⭐ Note: ${details.rating}/5 (${details.user_ratings_total} avis)`);
    stats.ratingAdded++;
  }

  // Coordonnées
  if (details.geometry && details.geometry.location) {
    enrichmentData.latitude = details.geometry.location.lat;
    enrichmentData.longitude = details.geometry.location.lng;
    console.log(`   📍 Coordonnées: ${enrichmentData.latitude}, ${enrichmentData.longitude}`);
  }

  // Horaires
  if (details.opening_hours && details.opening_hours.weekday_text) {
    // On pourrait parser les horaires, mais c'est complexe
    // Pour l'instant, on enregistre juste qu'on les a
    console.log(`   🕒 Horaires disponibles`);
    stats.hoursAdded++;
    // TODO: Parser et insérer dans business_hours table
  }

  // Types/Catégories Google (plus précis que SCIAN)
  if (details.types && Array.isArray(details.types)) {
    // Stocker les types Google pour référence future
    enrichmentData.google_types = details.types.join(',');
    console.log(`   🏷️  Types Google: ${details.types.slice(0, 3).join(', ')}`);
  }

  // Statut business
  if (details.business_status) {
    enrichmentData.business_status = details.business_status;
    if (details.business_status !== 'OPERATIONAL') {
      console.log(`   ⚠️  Statut: ${details.business_status}`);
    }
  }

  console.log('');
  stats.enriched++;

  return enrichmentData;
}

/**
 * Sauvegarder les données enrichies
 */
async function saveEnrichment(businessId, enrichmentData) {
  if (dryRun) {
    console.log(`   [DRY-RUN] Sauvegarderait:`, enrichmentData);
    return true;
  }

  const { error } = await supabase
    .from('businesses')
    .update(enrichmentData)
    .eq('id', businessId);

  if (error) {
    console.error(`   ❌ Erreur sauvegarde:`, error.message);
    return false;
  }

  return true;
}

/**
 * Enrichissement principal
 */
async function enrichAll() {
  console.log('📥 Récupération des entreprises REQ à enrichir...\n');

  // Récupérer entreprises sans téléphone ni site web
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, city, postal_code, phone, website')
    .eq('data_source', 'req')
    .is('phone', null) // Seulement celles sans téléphone
    .limit(limit);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  stats.total = businesses.length;
  console.log(`✅ ${stats.total} entreprises à enrichir\n`);

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];

    try {
      const enrichmentData = await enrichBusiness(biz);

      if (enrichmentData) {
        await saveEnrichment(biz.id, enrichmentData);
      }

      // Pause pour respecter les limites API (max 50 req/s)
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ Erreur pour ${biz.name}:`, error.message);
      stats.errors++;
    }

    // Log progression
    if ((i + 1) % 10 === 0) {
      console.log(`📊 Progression: ${i + 1}/${stats.total}`);
      console.log(`   ✅ Enrichies: ${stats.enriched} | ⚠️  Non trouvées: ${stats.notFound} | ❌ Erreurs: ${stats.errors}`);
      console.log('');
    }
  }

  // Rapport final
  console.log('');
  console.log('✅ Enrichissement terminé!');
  console.log('═'.repeat(60));
  console.log('📊 RAPPORT D\'ENRICHISSEMENT');
  console.log('═'.repeat(60));
  console.log(`\n🏢 TOTAL: ${stats.total} entreprises`);
  console.log(`   ✅ Enrichies:     ${stats.enriched} (${Math.round(stats.enriched/stats.total*100)}%)`);
  console.log(`   ⚠️  Non trouvées:  ${stats.notFound} (${Math.round(stats.notFound/stats.total*100)}%)`);
  console.log(`   ❌ Erreurs:       ${stats.errors} (${Math.round(stats.errors/stats.total*100)}%)`);

  console.log(`\n📊 DONNÉES AJOUTÉES:`);
  console.log(`   📞 Téléphones:    ${stats.phoneAdded}`);
  console.log(`   🌐 Sites web:     ${stats.websiteAdded}`);
  console.log(`   ⭐ Notes Google:  ${stats.ratingAdded}`);
  console.log(`   🕒 Horaires:      ${stats.hoursAdded}`);

  console.log('═'.repeat(60));

  // Estimation coût API
  const apiCalls = stats.enriched * 2; // 1 search + 1 details per business
  const cost = (apiCalls / 1000) * 17; // $17 per 1000 calls after free tier
  console.log(`\n💰 Utilisation API Google Places:`);
  console.log(`   Appels: ${apiCalls}`);
  if (apiCalls <= 28000) {
    console.log(`   ✅ GRATUIT (sous les 28,000 appels gratuits/mois)`);
  } else {
    console.log(`   ⚠️  Coût estimé: ~$${cost.toFixed(2)} USD`);
  }

  console.log('');
}

// Exécuter
enrichAll()
  .then(() => {
    console.log('🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
