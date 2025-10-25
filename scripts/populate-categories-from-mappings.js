import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  POPULATION DES CATÉGORIES DEPUIS ACT_ECON MAPPINGS\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function populateCategories() {
  // 1. Get all mappings with confidence >= 0.5
  console.log('📊 Chargement des mappings ACT_ECON...\n');

  const { data: mappings, error: mappingsError } = await supabase
    .from('act_econ_category_mappings')
    .select('act_econ_code, main_category_id, sub_category_id, confidence_score')
    .gte('confidence_score', 0.5);

  if (mappingsError) {
    console.error('❌ Erreur lors du chargement des mappings:', mappingsError);
    return;
  }

  console.log(`✅ ${mappings.length} mappings chargés\n`);

  // 2. For each mapping, update businesses with that ACT_ECON code
  let updated = 0;
  let errors = 0;
  const BATCH_SIZE = 100;

  console.log('🚀 Début de la mise à jour des catégories...\n');

  for (let i = 0; i < mappings.length; i += BATCH_SIZE) {
    const batch = mappings.slice(i, i + BATCH_SIZE);

    // Process batch in parallel
    await Promise.all(
      batch.map(async (mapping) => {
        try {
          // Build categories array
          const categoriesArray = [mapping.main_category_id];
          if (mapping.sub_category_id) {
            categoriesArray.push(mapping.sub_category_id);
          }

          // Update all businesses with this ACT_ECON code
          const { error: updateError, count } = await supabase
            .from('businesses')
            .update({
              categories: categoriesArray
            })
            .eq('act_econ_code', mapping.act_econ_code)
            // Only update if categories is empty array
            .or('categories.is.null,categories.eq.[]');

          if (updateError) {
            console.error(`  ❌ Erreur pour code ${mapping.act_econ_code}:`, updateError.message);
            errors++;
          } else {
            updated++;
            if (updated % 50 === 0) {
              console.log(`  ⏳ ${updated}/${mappings.length} codes traités...`);
            }
          }
        } catch (err) {
          console.error(`  ❌ Exception pour code ${mapping.act_econ_code}:`, err.message);
          errors++;
        }
      })
    );
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Traitement terminé!`);
  console.log(`   Codes traités: ${updated}`);
  console.log(`   Erreurs: ${errors}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // 3. Verify results
  console.log('🔍 Vérification des résultats...\n');

  const { count: totalBiz } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  const { count: withActEcon } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  // Count businesses with non-empty categories array
  const { data: withCats } = await supabase
    .from('businesses')
    .select('categories')
    .not('categories', 'is', null);

  const nonEmptyCats = withCats?.filter(b => b.categories && b.categories.length > 0).length || 0;

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total businesses: ${totalBiz?.toLocaleString() || 0}`);
  console.log(`Avec ACT_ECON: ${withActEcon?.toLocaleString() || 0}`);
  console.log(`Avec catégories assignées: ${nonEmptyCats.toLocaleString()}`);
  console.log(`Taux d'assignment: ${((nonEmptyCats / (withActEcon || 1)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Show sample
  const { data: sample } = await supabase
    .from('businesses')
    .select('name, act_econ_code, categories')
    .not('act_econ_code', 'is', null)
    .limit(5);

  console.log('📋 Exemples:\n');
  sample?.forEach(b => {
    console.log(`  ✓ ${b.name}`);
    console.log(`    ACT_ECON: ${b.act_econ_code}`);
    console.log(`    Categories: ${JSON.stringify(b.categories)}`);
  });
}

populateCategories();
