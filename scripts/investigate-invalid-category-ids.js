import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function investigateInvalidCategoryIds() {
  console.log('🔍 Investigation des main_category_id invalides...\n');
  console.log('='.repeat(80));

  // 1. Trouver l'UUID spécifique mentionné
  const problematicUUID = 'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9';

  console.log(`\n1️⃣ Recherche de l'UUID problématique: ${problematicUUID}\n`);

  // Vérifier si cet UUID existe dans main_categories
  const { data: catExists, error: catError } = await supabase
    .from('main_categories')
    .select('*')
    .eq('id', problematicUUID)
    .single();

  if (catExists) {
    console.log('✅ Cet UUID EXISTE dans main_categories:');
    console.log(`   - ID: ${catExists.id}`);
    console.log(`   - Slug: ${catExists.slug}`);
    console.log(`   - Label FR: ${catExists.label_fr}`);
    console.log(`   - Label EN: ${catExists.label_en}`);
  } else {
    console.log('❌ Cet UUID N\'EXISTE PAS dans main_categories');
    console.log(`   Erreur: ${catError?.message || 'Not found'}`);
  }

  // 2. Compter combien d'entreprises utilisent cet UUID
  const { count: bizCount, error: bizError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('main_category_id', problematicUUID);

  console.log(`\n📊 ${bizCount || 0} entreprises utilisent cet UUID comme main_category_id`);

  // 3. Échantillon d'entreprises avec cet UUID
  if (bizCount > 0) {
    const { data: bizSample } = await supabase
      .from('businesses')
      .select('id, name, slug, city, main_category_id')
      .eq('main_category_id', problematicUUID)
      .limit(5);

    console.log('\n📋 Échantillon d\'entreprises avec cet UUID:\n');
    bizSample?.forEach((biz, i) => {
      console.log(`${i + 1}. ${biz.name} (${biz.city || 'N/A'})`);
      console.log(`   - Slug: ${biz.slug}`);
      console.log(`   - URL attendue: /categorie/{category_slug}/${biz.city}/${biz.slug}`);
      console.log(`   - URL actuelle: /${problematicUUID}/${biz.city}/${biz.slug}`);
      console.log('');
    });
  }

  // 4. Vérifier TOUS les main_category_id invalides
  console.log('\n2️⃣ Recherche de TOUS les main_category_id invalides...\n');

  // Get all unique main_category_id from businesses
  const { data: allCategoryIds } = await supabase
    .from('businesses')
    .select('main_category_id')
    .not('main_category_id', 'is', null);

  if (allCategoryIds) {
    const uniqueIds = [...new Set(allCategoryIds.map(b => b.main_category_id))];
    console.log(`📊 ${uniqueIds.length} main_category_id uniques trouvés dans businesses`);

    // Get all valid IDs from main_categories
    const { data: validCategories } = await supabase
      .from('main_categories')
      .select('id');

    const validIds = new Set(validCategories?.map(c => c.id) || []);
    console.log(`✅ ${validIds.size} catégories valides dans main_categories`);

    // Find invalid IDs
    const invalidIds = uniqueIds.filter(id => !validIds.has(id));

    if (invalidIds.length > 0) {
      console.log(`\n⚠️  ${invalidIds.length} main_category_id INVALIDES trouvés:\n`);

      for (const invalidId of invalidIds) {
        const { count } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('main_category_id', invalidId);

        console.log(`   - ${invalidId}: ${count} entreprises`);
      }

      // 5. Vérifier si ces UUIDs existent dans business_categories (l'ancienne table)
      console.log('\n3️⃣ Vérification dans l\'ancienne table business_categories...\n');

      for (const invalidId of invalidIds.slice(0, 5)) { // Check first 5
        const { data: oldCat } = await supabase
          .from('business_categories')
          .select('id, name_fr, name_en, slug, parent_id')
          .eq('id', invalidId)
          .single();

        if (oldCat) {
          console.log(`✅ ${invalidId} trouvé dans business_categories (ancienne table):`);
          console.log(`   - Nom FR: ${oldCat.name_fr}`);
          console.log(`   - Nom EN: ${oldCat.name_en}`);
          console.log(`   - Slug: ${oldCat.slug}`);
          console.log(`   - Parent ID: ${oldCat.parent_id || 'NULL'}`);
          console.log('');
        } else {
          console.log(`❌ ${invalidId} N'EXISTE NULLE PART (ni main_categories ni business_categories)`);
          console.log('');
        }
      }

    } else {
      console.log('✅ Aucun main_category_id invalide trouvé!');
    }
  }

  // 6. Résumé et recommandations
  console.log('\n' + '='.repeat(80));
  console.log('📝 RÉSUMÉ ET RECOMMANDATIONS');
  console.log('='.repeat(80));

  const { count: totalBiz } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  const { count: withMainCat } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  console.log(`
📊 ÉTAT ACTUEL:
   Total entreprises:           ${totalBiz?.toLocaleString()}
   Avec main_category_id:       ${withMainCat?.toLocaleString()}
   Sans main_category_id:       ${(totalBiz - withMainCat)?.toLocaleString()}
  `);

  console.log('🔧 PROBLÈME DÉTECTÉ:');
  console.log('   Certaines entreprises ont des main_category_id qui pointent vers');
  console.log('   l\'ancienne table business_categories au lieu de main_categories');
  console.log('   Cela casse les URLs: /{uuid}/city/slug au lieu de /category/city/slug\n');

  console.log('💡 SOLUTION PROPOSÉE:');
  console.log('   Option 1: SET main_category_id = NULL pour ces entreprises');
  console.log('             → Elles n\'auront plus de catégorie cassée');
  console.log('             → Puis utiliser le mapping ACT_ECON pour les recatégoriser\n');

  console.log('   Option 2: Mapper business_categories → main_categories');
  console.log('             → Trouver la correspondance entre les deux systèmes');
  console.log('             → Mettre à jour avec les bons IDs de main_categories\n');

  console.log('   Option 3: Supprimer complètement main_category_id invalides');
  console.log('             → Nettoyer la DB');
  console.log('             → Reconstruire via ACT_ECON mapping (propre)\n');

  console.log('🏆 RECOMMANDATION: Option 3');
  console.log('   1. SET main_category_id = NULL WHERE main_category_id NOT IN main_categories');
  console.log('   2. Créer le mapping act_econ_to_main_category');
  console.log('   3. Assigner les main_category_id via ACT_ECON (propre et fiable)');

  console.log('\n' + '='.repeat(80));
}

investigateInvalidCategoryIds().catch(console.error);
