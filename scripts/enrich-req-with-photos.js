/**
 * Script d'enrichissement COMPLET des données REQ via Google Places API
 * Récupère: téléphone, site web, horaires, note Google, avis, LOGO et PHOTOS
 *
 * UTILISATION:
 * node scripts/enrich-req-with-photos.js
 *
 * OPTIONS:
 * --limit=100   Limiter à 100 entreprises
 * --dry-run     Afficher les résultats sans les sauvegarder
 * --batch=10    Traiter par lots de X entreprises (défaut: 10)
 *
 * PRÉREQUIS:
 * - VITE_GOOGLE_MAPS_API_KEY dans .env
 * - SUPABASE_SERVICE_KEY dans .env (pour upload photos)
 * - API Google Places activée
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const googleApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;

if (!googleApiKey) {
  console.error('❌ VITE_GOOGLE_MAPS_API_KEY manquant dans .env');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('❌ Clé Supabase manquante dans .env');
  process.exit(1);
}

// Client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const batchArg = args.find(arg => arg.startsWith('--batch='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 2000;
const batchSize = batchArg ? parseInt(batchArg.split('=')[1]) : 10;
const dryRun = args.includes('--dry-run');

console.log('🌐 Enrichissement COMPLET des données REQ via Google Places API');
console.log('📸 Inclut: téléphone, site web, notes, avis, LOGO et PHOTOS');
console.log('📊 Configuration:', { limit, batchSize, dryRun });
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
  logoAdded: 0,
  photosAdded: 0
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
    'icon',
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
 * Télécharger une photo depuis Google Places
 */
async function downloadGooglePhoto(photoReference, maxWidth = 1200) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${googleApiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`   ⚠️  Erreur téléchargement photo: ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer;
  } catch (error) {
    console.error('   ❌ Erreur téléchargement photo:', error.message);
    return null;
  }
}

/**
 * Upload une image vers Supabase Storage
 */
async function uploadToSupabase(buffer, fileName, bucket = 'business-photos') {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error(`   ❌ Erreur upload Supabase:`, error.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('   ❌ Erreur upload:', error.message);
    return null;
  }
}

/**
 * Générer un nom de fichier unique
 */
function generateFileName(businessId, type = 'photo', index = 0) {
  const hash = crypto.createHash('md5').update(businessId).digest('hex').substring(0, 8);
  const timestamp = Date.now();

  if (type === 'logo') {
    return `logos/${hash}-${timestamp}.jpg`;
  }

  return `photos/${hash}-${index}-${timestamp}.jpg`;
}

/**
 * Enrichir une entreprise avec photos
 */
async function enrichBusinessWithPhotos(business) {
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
  const enrichmentData = {};

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

  // Types/Catégories Google
  if (details.types && Array.isArray(details.types)) {
    enrichmentData.google_types = details.types;
    console.log(`   🏷️  Types: ${details.types.slice(0, 3).join(', ')}`);
  }

  // LOGO (icon)
  if (details.icon) {
    console.log(`   🎨 Téléchargement du logo...`);
    try {
      // Download icon
      const iconResponse = await fetch(details.icon);
      if (iconResponse.ok) {
        const iconBuffer = Buffer.from(await iconResponse.arrayBuffer());
        const logoFileName = generateFileName(business.id, 'logo');
        const logoUrl = await uploadToSupabase(iconBuffer, logoFileName, 'business-logos');

        if (logoUrl) {
          enrichmentData.logo_url = logoUrl;
          console.log(`   ✅ Logo uploadé: ${logoUrl}`);
          stats.logoAdded++;
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Erreur logo: ${error.message}`);
    }
  }

  // PHOTOS
  if (details.photos && Array.isArray(details.photos) && details.photos.length > 0) {
    console.log(`   📸 ${details.photos.length} photos disponibles, téléchargement de 5 max...`);
    const galleryUrls = [];
    const maxPhotos = Math.min(5, details.photos.length);

    for (let i = 0; i < maxPhotos; i++) {
      const photo = details.photos[i];

      if (photo.photo_reference) {
        const photoBuffer = await downloadGooglePhoto(photo.photo_reference);

        if (photoBuffer) {
          const photoFileName = generateFileName(business.id, 'photo', i);
          const photoUrl = await uploadToSupabase(photoBuffer, photoFileName, 'business-photos');

          if (photoUrl) {
            galleryUrls.push(photoUrl);
            console.log(`   ✅ Photo ${i + 1}/${maxPhotos} uploadée`);
          }
        }

        // Pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    if (galleryUrls.length > 0) {
      enrichmentData.gallery_images = galleryUrls;
      stats.photosAdded += galleryUrls.length;
      console.log(`   📸 ${galleryUrls.length} photos uploadées`);
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
    console.log(`   [DRY-RUN] Sauvegarderait:`, Object.keys(enrichmentData));
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

  // Récupérer entreprises sans logo
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, city, postal_code')
    .eq('data_source', 'req')
    .is('logo_url', null) // Seulement celles sans logo
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
      const enrichmentData = await enrichBusinessWithPhotos(biz);

      if (enrichmentData) {
        await saveEnrichment(biz.id, enrichmentData);
      }

      // Pause pour respecter les limites API (max 50 req/s)
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Erreur pour ${biz.name}:`, error.message);
      stats.errors++;
    }

    // Log progression
    if ((i + 1) % batchSize === 0 || i === businesses.length - 1) {
      console.log(`\n📊 Progression: ${i + 1}/${stats.total}`);
      console.log(`   ✅ Enrichies: ${stats.enriched} | ⚠️  Non trouvées: ${stats.notFound} | ❌ Erreurs: ${stats.errors}`);
      console.log(`   📸 Logos: ${stats.logoAdded} | Photos: ${stats.photosAdded}`);
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
  console.log(`   🎨 Logos:         ${stats.logoAdded}`);
  console.log(`   📸 Photos:        ${stats.photosAdded}`);

  console.log('═'.repeat(60));

  // Estimation coût API
  const searchCalls = stats.enriched;
  const detailsCalls = stats.enriched;
  const photoCalls = stats.photosAdded + stats.logoAdded;
  const totalCalls = searchCalls + detailsCalls + photoCalls;

  console.log(`\n💰 Utilisation API Google Places:`);
  console.log(`   Recherches:    ${searchCalls}`);
  console.log(`   Détails:       ${detailsCalls}`);
  console.log(`   Photos:        ${photoCalls}`);
  console.log(`   Total appels:  ${totalCalls}`);

  if (totalCalls <= 28000) {
    console.log(`   ✅ GRATUIT (sous les 28,000 appels gratuits/mois)`);
  } else {
    const cost = ((totalCalls - 28000) / 1000) * 17;
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
