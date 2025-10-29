import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Nominatim API (OpenStreetMap) - 100% gratuit
// Limite: 1 requête par seconde (respecter la politique d'usage)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS = 1100; // 1.1 seconde entre chaque requête (respecter les limites)

// Fonction pour attendre
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction de géocodage avec Nominatim
async function geocodeAddress(address, city, province = 'QC') {
  try {
    const query = `${address}, ${city}, ${province}, Canada`;
    const url = new URL(NOMINATIM_URL);
    url.searchParams.append('q', query);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', '1');
    url.searchParams.append('countrycodes', 'ca'); // Canada seulement

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RegistreQuebec/1.0 (contact@registreduquebec.com)' // Requis par Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

// Fonction principale
async function geocodeBusinesses() {
  console.log('🗺️  Géocodage des adresses avec OpenStreetMap (Nominatim)\n');
  console.log('================================================================================\n');

  // 1. Compter les entreprises sans coordonnées
  const { count, error: countError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('latitude', null)
    .not('address', 'is', null)
    .not('city', 'is', null);

  if (countError) {
    console.error('❌ Error counting businesses:', countError);
    return;
  }

  console.log(`📊 Total entreprises sans GPS mais avec adresse: ${count}\n`);

  // 2. Demander combien on veut traiter
  const BATCH_SIZE = 100; // Traiter par lots de 100
  const MAX_BUSINESSES = 500; // Maximum par exécution (éviter de surcharger Nominatim)

  console.log(`⚙️  Configuration:`);
  console.log(`   Batch size: ${BATCH_SIZE}`);
  console.log(`   Max par exécution: ${MAX_BUSINESSES}`);
  console.log(`   Délai entre requêtes: ${DELAY_MS}ms`);
  console.log(`   Temps estimé: ~${Math.ceil((Math.min(count, MAX_BUSINESSES) * DELAY_MS) / 1000 / 60)} minutes\n`);

  // 3. Récupérer les entreprises
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, city, province')
    .is('latitude', null)
    .not('address', 'is', null)
    .not('city', 'is', null)
    .limit(MAX_BUSINESSES);

  if (error) {
    console.error('❌ Error fetching businesses:', error);
    return;
  }

  console.log(`📦 Entreprises chargées: ${businesses.length}\n`);
  console.log('🔄 Démarrage du géocodage...\n');

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  // 4. Traiter chaque entreprise
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const progress = i + 1;

    console.log(`[${progress}/${businesses.length}] ${business.name}`);
    console.log(`   Adresse: ${business.address}, ${business.city}`);

    // Géocoder
    const coords = await geocodeAddress(business.address, business.city, business.province || 'QC');

    if (coords) {
      // Mettre à jour dans la base de données
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
        .eq('id', business.id);

      if (updateError) {
        console.log(`   ❌ Erreur update: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`   ✅ GPS ajouté: ${coords.latitude}, ${coords.longitude}`);
        successCount++;
      }
    } else {
      console.log(`   ⚠️  Adresse introuvable`);
      failCount++;
    }

    // Afficher stats tous les 50
    if ((progress % 50) === 0) {
      console.log(`\n📊 Stats intermédiaires:`);
      console.log(`   ✅ Succès: ${successCount}`);
      console.log(`   ❌ Échecs: ${failCount}`);
      console.log(`   📈 Taux de succès: ${((successCount / progress) * 100).toFixed(1)}%\n`);
    }

    // Respecter la limite de 1 req/sec de Nominatim
    if (i < businesses.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // 5. Résumé final
  console.log('\n================================================================================');
  console.log('✅ GÉOCODAGE TERMINÉ!\n');
  console.log('📊 Résultat final:');
  console.log(`   ✅ Coordonnées ajoutées: ${successCount}`);
  console.log(`   ❌ Échecs: ${failCount}`);
  console.log(`   📈 Taux de succès: ${((successCount / businesses.length) * 100).toFixed(1)}%`);
  console.log(`   🗺️  Entreprises restantes sans GPS: ${count - successCount}`);
}

// Exécuter
geocodeBusinesses().catch(console.error);
