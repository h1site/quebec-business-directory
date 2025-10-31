import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BATCH_SIZE = 1000;

async function syncMainCategorySlug() {
  console.log('🎯 SYNC MAIN_CATEGORY_SLUG FROM ACT_ECON_CATEGORY_MAPPINGS\n');
  console.log('='.repeat(80));
  console.log('\nCe script va:');
  console.log('1. Utiliser act_econ_category_mappings (1706 codes détaillés)');
  console.log('2. Assigner main_category_id + main_category_slug pour chaque code\n');
  console.log('='.repeat(80));

  // ============================================================================
  // ÉTAPE 1: Assigner main_category_id via ACT_ECON
  // ============================================================================
  console.log('\n📊 ÉTAPE 1: Attribution de main_category_id via ACT_ECON\n');

  // Check if mapping table exists
  const { data: mappings, error: mappingError } = await supabase
    .from('act_econ_category_mappings')
    .select('act_econ_code, main_category_id')
    .limit(5);

  if (mappingError) {
    console.error('❌ Erreur: La table act_econ_category_mappings n\'existe pas');
    return;
  }

  const { count: mappingCount } = await supabase
    .from('act_econ_category_mappings')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Table de mapping trouvée: ${mappingCount} mappings ACT_ECON → main_category`);

  // Count businesses with act_econ but no main_category_id
  const { count: needCategoryId } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null)
    .is('main_category_id', null);

  console.log(`📊 ${needCategoryId?.toLocaleString() || 0} entreprises avec act_econ mais sans main_category_id`);

  if (needCategoryId > 0) {
    console.log('\n🔄 Attribution de main_category_id par batch...\n');

    let offset = 0;
    let totalUpdatedIds = 0;
    let totalNoMatch = 0;
    let batchNumber = 0;

    while (offset < needCategoryId) {
      batchNumber++;

      // Get batch of businesses with act_econ_code but no main_category_id
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id, name, act_econ_code')
        .not('act_econ_code', 'is', null)
        .is('main_category_id', null)
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError || !businesses || businesses.length === 0) {
        break;
      }

      // Group by exact act_econ_code (no substring!)
      const codeGroups = {};
      for (const biz of businesses) {
        const code = biz.act_econ_code;
        if (!codeGroups[code]) {
          codeGroups[code] = [];
        }
        codeGroups[code].push(biz);
      }

      // Update each group
      for (const [code, bizGroup] of Object.entries(codeGroups)) {
        // Skip "0001" placeholder codes
        if (code === '0001') {
          totalNoMatch += bizGroup.length;
          continue;
        }

        const { data: mapping } = await supabase
          .from('act_econ_category_mappings')
          .select('main_category_id')
          .eq('act_econ_code', code)
          .single();

        if (!mapping) {
          totalNoMatch += bizGroup.length;
          continue;
        }

        const bizIds = bizGroup.map(b => b.id);
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ main_category_id: mapping.main_category_id })
          .in('id', bizIds);

        if (!updateError) {
          totalUpdatedIds += bizGroup.length;
        }
      }

      offset += BATCH_SIZE;

      if (batchNumber % 10 === 0) {
        console.log(`   ⏳ Batch ${batchNumber}: ${totalUpdatedIds.toLocaleString()} assignés, ${totalNoMatch.toLocaleString()} sans mapping`);
      }
    }

    console.log(`\n✅ Étape 1 terminée:`);
    console.log(`   - ${totalUpdatedIds.toLocaleString()} main_category_id assignés`);
    console.log(`   - ${totalNoMatch.toLocaleString()} sans mapping trouvé`);
  } else {
    console.log('\n✅ Toutes les entreprises avec act_econ ont déjà un main_category_id');
  }

  // ============================================================================
  // ÉTAPE 2: Remplir main_category_slug depuis main_categories
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 ÉTAPE 2: Population de main_category_slug\n');

  // Count businesses with main_category_id but no main_category_slug
  const { count: needSlug } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null)
    .is('main_category_slug', null);

  console.log(`📊 ${needSlug?.toLocaleString() || 0} entreprises avec main_category_id mais sans main_category_slug`);

  if (needSlug > 0) {
    console.log('\n🔄 Remplissage de main_category_slug par batch...\n');

    let offset = 0;
    let totalUpdatedSlugs = 0;
    let batchNumber = 0;

    while (offset < needSlug) {
      batchNumber++;

      // Get batch of businesses with main_category_id but no slug
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id, main_category_id')
        .not('main_category_id', 'is', null)
        .is('main_category_slug', null)
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError || !businesses || businesses.length === 0) {
        break;
      }

      // Group by main_category_id
      const categoryGroups = {};
      for (const biz of businesses) {
        if (!categoryGroups[biz.main_category_id]) {
          categoryGroups[biz.main_category_id] = [];
        }
        categoryGroups[biz.main_category_id].push(biz.id);
      }

      // For each category, get slug and update businesses
      for (const [categoryId, bizIds] of Object.entries(categoryGroups)) {
        // Get category slug
        const { data: category } = await supabase
          .from('main_categories')
          .select('slug')
          .eq('id', categoryId)
          .single();

        if (!category || !category.slug) continue;

        // Update all businesses with this category
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ main_category_slug: category.slug })
          .in('id', bizIds);

        if (!updateError) {
          totalUpdatedSlugs += bizIds.length;
        }
      }

      offset += BATCH_SIZE;

      if (batchNumber % 10 === 0) {
        console.log(`   ⏳ Batch ${batchNumber}: ${totalUpdatedSlugs.toLocaleString()} mis à jour`);
      }
    }

    console.log(`\n✅ Étape 2 terminée: ${totalUpdatedSlugs.toLocaleString()} main_category_slug remplis`);
  } else {
    console.log('\n✅ Toutes les entreprises avec main_category_id ont déjà un main_category_slug');
  }

  // ============================================================================
  // STATISTIQUES FINALES
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('📊 STATISTIQUES FINALES');
  console.log('='.repeat(80));

  const { count: totalBiz } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  const { count: withActEcon } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  const { count: withCategoryId } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  const { count: withSlug } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_slug', 'is', null);

  const { count: withAllFields } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_slug', 'is', null)
    .not('city', 'is', null)
    .not('slug', 'is', null);

  console.log(`
Total entreprises:                    ${totalBiz?.toLocaleString() || 0}
Avec act_econ_code:                   ${withActEcon?.toLocaleString() || 0} (${((withActEcon / totalBiz) * 100).toFixed(1)}%)
Avec main_category_id:                ${withCategoryId?.toLocaleString() || 0} (${((withCategoryId / totalBiz) * 100).toFixed(1)}%)
Avec main_category_slug:              ${withSlug?.toLocaleString() || 0} (${((withSlug / totalBiz) * 100).toFixed(1)}%)

✅ Prêtes pour sitemap:                ${withAllFields?.toLocaleString() || 0}
   (main_category_slug + city + slug)
  `);

  console.log('='.repeat(80));
  console.log('🎯 PROCHAINE ÉTAPE');
  console.log('='.repeat(80));
  console.log(`
Maintenant que main_category_slug est rempli, vous pouvez:

1. ✅ Régénérer le sitemap anglais:
   node scripts/generate-sitemap-en-split.js

2. ✅ Vérifier les résultats:
   Le sitemap devrait maintenant inclure ~${withAllFields?.toLocaleString() || 0} entreprises
  `);

  console.log('='.repeat(80));
}

syncMainCategorySlug().catch(console.error);
