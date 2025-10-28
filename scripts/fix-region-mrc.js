import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { quebecMunicipalities } from '../src/data/quebecMunicipalities.js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Build city → region/mrc lookup map
const cityLookup = {};

Object.entries(quebecMunicipalities).forEach(([regionSlug, regionData]) => {
  Object.entries(regionData.mrcs).forEach(([mrcSlug, mrcData]) => {
    mrcData.cities.forEach(city => {
      const normalizedCity = city.toLowerCase().trim();
      cityLookup[normalizedCity] = {
        region: regionData.name,
        mrc: mrcData.name,
        regionSlug,
        mrcSlug
      };
    });
  });
});

console.log(`📚 ${Object.keys(cityLookup).length} villes dans le dictionnaire\n`);

async function fixRegionMrc() {
  const BATCH_SIZE = 500; // Process 500 at a time
  let offset = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  let totalNotFound = 0;

  console.log('🔄 Traitement des entreprises avec Region/MRC NULL...\n');

  while (true) {
    // Get batch of businesses with null region or mrc
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, city, region, mrc')
      .or('region.is.null,mrc.is.null')
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error('❌ Erreur:', error);
      break;
    }

    if (!businesses || businesses.length === 0) {
      console.log('\n✅ Terminé! Plus d\'entreprises à traiter.');
      break;
    }

    console.log(`📦 Batch ${Math.floor(offset / BATCH_SIZE) + 1}: ${businesses.length} entreprises`);

    for (const business of businesses) {
      if (!business.city) {
        console.log(`⚠️  Pas de ville: ID ${business.id}`);
        totalNotFound++;
        continue;
      }

      const normalizedCity = business.city.toLowerCase().trim();
      const lookup = cityLookup[normalizedCity];

      if (!lookup) {
        // Try partial match
        const partialMatch = Object.keys(cityLookup).find(key =>
          normalizedCity.includes(key) || key.includes(normalizedCity)
        );

        if (partialMatch) {
          const match = cityLookup[partialMatch];
          const { error: updateError } = await supabase
            .from('businesses')
            .update({
              region: match.region,
              mrc: match.mrc
            })
            .eq('id', business.id);

          if (updateError) {
            console.log(`❌ Erreur mise à jour: ${business.city}`);
            totalFailed++;
          } else {
            totalUpdated++;
          }
        } else {
          totalNotFound++;
        }
        continue;
      }

      // Update business with region and mrc
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          region: lookup.region,
          mrc: lookup.mrc
        })
        .eq('id', business.id);

      if (updateError) {
        console.log(`❌ Erreur: ${business.city} - ${updateError.message}`);
        totalFailed++;
      } else {
        totalUpdated++;
      }
    }

    console.log(`   ✅ Mis à jour: ${totalUpdated} | ❌ Échoués: ${totalFailed} | ⚠️  Non trouvés: ${totalNotFound}\n`);

    offset += BATCH_SIZE;

    // Pause to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Résumé final:');
  console.log(`   ✅ Total mis à jour: ${totalUpdated.toLocaleString()}`);
  console.log(`   ❌ Total échoués: ${totalFailed.toLocaleString()}`);
  console.log(`   ⚠️  Total non trouvés: ${totalNotFound.toLocaleString()}`);
}

fixRegionMrc();
