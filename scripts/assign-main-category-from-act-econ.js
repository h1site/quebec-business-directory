import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BATCH_SIZE = 500;

async function assignMainCategoryFromActEcon() {
  console.log('🎯 Attribution automatique de main_category_id via ACT_ECON\n');
  console.log('='.repeat(80));

  // 1. Vérifier que la table de mapping existe
  console.log('\n1️⃣ Vérification de la table de mapping...\n');

  const { data: mappings, error: mappingError } = await supabase
    .from('act_econ_to_main_category')
    .select('act_econ_code, main_category_id')
    .limit(5);

  if (mappingError) {
    console.error('❌ Erreur: La table act_econ_to_main_category n\'existe pas ou est vide');
    console.error('   Veuillez d\'abord exécuter les migrations:');
    console.error('   1. supabase/migrations/20250128_create_act_econ_mapping.sql');
    console.error('   2. supabase/migrations/20250128_insert_act_econ_mappings.sql');
    return;
  }

  const { count: mappingCount } = await supabase
    .from('act_econ_to_main_category')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Table de mapping trouvée: ${mappingCount} mappings ACT_ECON → main_category`);

  // 2. Compter les entreprises avec act_econ_code mais sans main_category_id
  console.log('\n2️⃣ Comptage des entreprises à mettre à jour...\n');

  const { count: totalToUpdate, error: countError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null)
    .is('main_category_id', null);

  if (countError) {
    console.error('❌ Erreur:', countError);
    return;
  }

  console.log(`📊 ${totalToUpdate.toLocaleString()} entreprises avec act_econ_code mais sans main_category_id`);

  if (totalToUpdate === 0) {
    console.log('\n✅ Toutes les entreprises avec act_econ_code ont déjà un main_category_id!');
    return;
  }

  // 3. Traiter par batch
  console.log('\n3️⃣ Attribution des main_category_id par batch...\n');
  console.log(`   Taille du batch: ${BATCH_SIZE}`);
  console.log(`   Batches estimés: ${Math.ceil(totalToUpdate / BATCH_SIZE)}\n`);

  let offset = 0;
  let totalUpdated = 0;
  let totalNotFound = 0;
  let batchNumber = 0;

  while (offset < totalToUpdate) {
    batchNumber++;
    console.log(`\n📦 Batch ${batchNumber} (${BATCH_SIZE} entreprises)`);

    // Get batch of businesses with act_econ_code but no main_category_id
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name, act_econ_code')
      .not('act_econ_code', 'is', null)
      .is('main_category_id', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (fetchError) {
      console.error('❌ Erreur lors du fetch:', fetchError);
      break;
    }

    if (!businesses || businesses.length === 0) {
      console.log('✅ Plus d\'entreprises à traiter');
      break;
    }

    // Group by act_econ_code for batch processing
    const codeGroups = {};

    for (const biz of businesses) {
      // Extract first 4 characters (main code)
      const mainCode = biz.act_econ_code.substring(0, 4);

      if (!codeGroups[mainCode]) {
        codeGroups[mainCode] = [];
      }
      codeGroups[mainCode].push(biz);
    }

    console.log(`   Codes ACT_ECON uniques dans ce batch: ${Object.keys(codeGroups).length}`);

    // For each code group, find mapping and update
    for (const [mainCode, bizGroup] of Object.entries(codeGroups)) {
      // Find main_category_id for this act_econ_code
      const { data: mapping } = await supabase
        .from('act_econ_to_main_category')
        .select('main_category_id')
        .eq('act_econ_code', mainCode)
        .single();

      if (!mapping) {
        console.log(`   ⚠️  Code ${mainCode}: Pas de mapping trouvé (${bizGroup.length} entreprises ignorées)`);
        totalNotFound += bizGroup.length;
        continue;
      }

      // Update all businesses in this group
      const bizIds = bizGroup.map(b => b.id);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ main_category_id: mapping.main_category_id })
        .in('id', bizIds);

      if (updateError) {
        console.error(`   ❌ Erreur lors de la mise à jour pour le code ${mainCode}:`, updateError);
      } else {
        totalUpdated += bizGroup.length;
        console.log(`   ✅ Code ${mainCode}: ${bizGroup.length} entreprises mises à jour`);
      }
    }

    offset += BATCH_SIZE;
    console.log(`   📊 Progrès: ${Math.min(offset, totalToUpdate).toLocaleString()}/${totalToUpdate.toLocaleString()} (${((offset / totalToUpdate) * 100).toFixed(1)}%)`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 4. Statistiques finales
  console.log('\n' + '='.repeat(80));
  console.log('📊 RÉSULTATS FINAUX');
  console.log('='.repeat(80));

  const { count: remainingNull } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null)
    .is('main_category_id', null);

  const { count: totalWithCategory } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  console.log(`
✅ Mis à jour:                    ${totalUpdated.toLocaleString()} entreprises
⚠️  Sans mapping trouvé:          ${totalNotFound.toLocaleString()} entreprises
📊 Reste à traiter:               ${remainingNull.toLocaleString()} entreprises (act_econ_code mais sans category)

ÉTAT GLOBAL:
   Total entreprises:             ${totalBusinesses.toLocaleString()}
   Avec main_category_id:         ${totalWithCategory.toLocaleString()} (${((totalWithCategory / totalBusinesses) * 100).toFixed(1)}%)
   Sans main_category_id:         ${(totalBusinesses - totalWithCategory).toLocaleString()} (${(((totalBusinesses - totalWithCategory) / totalBusinesses) * 100).toFixed(1)}%)
  `);

  console.log('='.repeat(80));
  console.log('🎯 PROCHAINES ÉTAPES');
  console.log('='.repeat(80));
  console.log(`
1. ✅ Mapping ACT_ECON → main_categories créé
2. ✅ Entreprises avec act_econ_code catégorisées automatiquement
3. 🔄 Script sync-act-econ-streaming.js en cours (ajoute plus de codes)
4. 🔄 Les filtres de catégorie fonctionneront pour ${totalWithCategory.toLocaleString()} entreprises

💡 Pour traiter les entreprises restantes:
   - Attendre que le script de sync termine
   - Re-exécuter ce script pour assigner les nouveaux codes
   - Ou utiliser business_categories pour les entreprises manuellement enregistrées
  `);
}

assignMainCategoryFromActEcon().catch(console.error);
