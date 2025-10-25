import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  ASSIGNMENT DES CATÉGORIES DEPUIS ACT_ECON\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function assignCategories() {
  // 1. Load all mappings
  console.log('📊 Chargement des mappings ACT_ECON...\n');

  const { data: mappings, error: mappingsError } = await supabase
    .from('act_econ_category_mappings')
    .select('act_econ_code, main_category_id, sub_category_id, confidence_score')
    .gte('confidence_score', 0.5);

  if (mappingsError) {
    console.error('❌ Erreur:', mappingsError);
    return;
  }

  console.log(`✅ ${mappings.length} mappings chargés\n`);
  console.log('🚀 Mise à jour des catégories...\n');

  let successCount = 0;
  let errorCount = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < mappings.length; i += BATCH_SIZE) {
    const batch = mappings.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (mapping) => {
        try {
          // Build categories array
          const categoriesArray = [mapping.main_category_id];
          if (mapping.sub_category_id) {
            categoriesArray.push(mapping.sub_category_id);
          }

          // Update ALL businesses with this ACT_ECON code
          const { error: updateError } = await supabase
            .from('businesses')
            .update({ categories: categoriesArray })
            .eq('act_econ_code', mapping.act_econ_code);

          if (updateError) {
            console.error(`❌ Code ${mapping.act_econ_code}:`, updateError.message);
            errorCount++;
          } else {
            successCount++;
            if (successCount % 100 === 0) {
              console.log(`  ⏳ ${successCount}/${mappings.length} codes traités...`);
            }
          }
        } catch (err) {
          console.error(`❌ Exception pour ${mapping.act_econ_code}:`, err.message);
          errorCount++;
        }
      })
    );
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Traitement terminé!`);
  console.log(`   Codes réussis: ${successCount}`);
  console.log(`   Erreurs: ${errorCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Verify results
  console.log('🔍 Vérification des résultats...\n');

  const { count: totalBiz } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  const { count: withActEcon } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  // Sample to count non-empty categories
  const { data: allBiz } = await supabase
    .from('businesses')
    .select('categories')
    .not('act_econ_code', 'is', null);

  const withCategories = allBiz?.filter(b => b.categories && b.categories.length > 0).length || 0;

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total businesses: ${totalBiz?.toLocaleString() || 0}`);
  console.log(`Avec ACT_ECON: ${withActEcon?.toLocaleString() || 0}`);
  console.log(`Avec catégories: ${withCategories.toLocaleString()}`);
  console.log(`Taux: ${((withCategories / (withActEcon || 1)) * 100).toFixed(1)}%`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Show samples
  const { data: samples } = await supabase
    .from('businesses')
    .select('name, act_econ_code, categories')
    .not('act_econ_code', 'is', null)
    .limit(10);

  console.log('📋 Exemples:\n');
  samples?.forEach(b => {
    const catStatus = b.categories && b.categories.length > 0 ? '✅' : '❌';
    console.log(`  ${catStatus} ${b.name}`);
    console.log(`    ACT_ECON: ${b.act_econ_code} | Categories: ${JSON.stringify(b.categories)}`);
  });
}

assignCategories();
