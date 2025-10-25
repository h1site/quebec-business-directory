import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  RETRY: Assignment des catégories (codes qui ont timeout)\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Get mappings for codes that timed out
const failedCodes = new Set([
  '0163', '0135', '0221', '0159', '0134', '0114', '0169', '0115', '0229', '0151',
  '0139', '0231', '0232', '0131', '0112', '0171', '0113', '0111', '4564', '4499',
  '4013', '4561', '4411', '4569', '4491', '4842', '4839', '4591', '5219', '4599',
  '6019', '6223', '6033', '6239', '6224', '6231', '6032', '6213', '6012', '6323',
  '6131', '6222', '6359', '6599', '6596', '6582', '6342', '6541', '6591', '6399',
  '7215', '7211', '7129', '7214', '7299', '0164', '4562'
]);

async function retryFailedCodes() {
  // Load mappings for failed codes
  const { data: mappings, error } = await supabase
    .from('act_econ_category_mappings')
    .select('act_econ_code, main_category_id, sub_category_id')
    .in('act_econ_code', Array.from(failedCodes))
    .gte('confidence_score', 0.5);

  if (error) {
    console.error('❌ Error loading mappings:', error);
    return;
  }

  console.log(`✅ ${mappings.length} mappings à retry\n`);
  console.log('🚀 Traitement par batches de businesses...\n');

  let totalUpdated = 0;
  let errors = 0;

  for (const mapping of mappings) {
    try {
      // Build categories array
      const categoriesArray = [mapping.main_category_id];
      if (mapping.sub_category_id) {
        categoriesArray.push(mapping.sub_category_id);
      }

      // Get all businesses with this ACT_ECON code
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id')
        .eq('act_econ_code', mapping.act_econ_code);

      if (fetchError) {
        console.error(`❌ Fetch error for ${mapping.act_econ_code}:`, fetchError.message);
        errors++;
        continue;
      }

      if (!businesses || businesses.length === 0) {
        continue;
      }

      console.log(`  📋 Code ${mapping.act_econ_code}: ${businesses.length} businesses`);

      // Update in smaller batches of 20
      const BATCH_SIZE = 20;
      let updated = 0;

      for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
        const batch = businesses.slice(i, i + BATCH_SIZE);
        const ids = batch.map(b => b.id);

        const { error: updateError } = await supabase
          .from('businesses')
          .update({ categories: categoriesArray })
          .in('id', ids);

        if (updateError) {
          console.error(`     ❌ Batch error:`, updateError.message);
          errors++;
        } else {
          updated += batch.length;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`     ✅ ${updated} businesses mis à jour\n`);
      totalUpdated += updated;

    } catch (err) {
      console.error(`❌ Exception for ${mapping.act_econ_code}:`, err.message);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Terminé!`);
  console.log(`   Total mis à jour: ${totalUpdated.toLocaleString()}`);
  console.log(`   Erreurs: ${errors}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Final stats
  const { data: allBiz } = await supabase
    .from('businesses')
    .select('categories')
    .not('act_econ_code', 'is', null);

  const withCategories = allBiz?.filter(b => b.categories && b.categories.length > 0).length || 0;

  console.log('📊 Statistiques finales:');
  console.log(`   Businesses avec catégories: ${withCategories.toLocaleString()} / 101,261`);
  console.log(`   Taux: ${((withCategories / 101261) * 100).toFixed(1)}%\n`);
}

retryFailedCodes();
