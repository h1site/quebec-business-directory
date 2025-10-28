import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const targetUUID = '065589d2-5efd-47d5-a8b1-dcc418023bd6';

async function findOrphanCategory() {
  console.log(`🔍 Recherche d'entreprises avec category_id orphelin: ${targetUUID}\n`);

  // Check businesses with this category_id
  const { data: businesses, count, error } = await supabase
    .from('businesses')
    .select('id, name, category_id, main_category, sub_category', { count: 'exact' })
    .eq('category_id', targetUUID)
    .limit(20);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!businesses || businesses.length === 0) {
    console.log('❌ Aucune entreprise trouvée avec ce category_id');

    // Check if it exists in business_categories
    const { data: catExists } = await supabase
      .from('business_categories')
      .select('id')
      .eq('id', targetUUID)
      .single();

    if (!catExists) {
      console.log('❌ Ce UUID n\'existe PAS dans business_categories (catégorie orpheline supprimée)');
    }
    return;
  }

  console.log(`✅ TROUVÉ: ${count} entreprises utilisent ce category_id ORPHELIN\n`);
  console.log(`📋 Échantillon d'entreprises (max 20):\n`);

  businesses.forEach((b, i) => {
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   - ID: ${b.id}`);
    console.log(`   - category_id: ${b.category_id}`);
    console.log(`   - main_category: ${b.main_category}`);
    console.log(`   - sub_category: ${b.sub_category}`);
    console.log('');
  });

  // Verify if category exists in business_categories
  console.log('\n🔍 Vérification si la catégorie existe dans business_categories...');
  const { data: category, error: catError } = await supabase
    .from('business_categories')
    .select('id, name_fr, name_en, parent_id')
    .eq('id', targetUUID)
    .single();

  if (category) {
    console.log('✅ La catégorie EXISTE dans business_categories:');
    console.log(`   - Nom FR: ${category.name_fr}`);
    console.log(`   - Nom EN: ${category.name_en}`);
    console.log(`   - parent_id: ${category.parent_id}`);

    if (category.parent_id) {
      const { data: parent } = await supabase
        .from('business_categories')
        .select('name_fr, name_en')
        .eq('id', category.parent_id)
        .single();

      if (parent) {
        console.log(`   - Catégorie principale: ${parent.name_fr} / ${parent.name_en}`);
      } else {
        console.log(`   ⚠️ parent_id pointe vers une catégorie qui n'existe PAS!`);
      }
    } else {
      console.log('   - C\'est une CATÉGORIE PRINCIPALE (pas de parent)');
    }
  } else {
    console.log('❌ La catégorie N\'EXISTE PAS dans business_categories');
    console.log(`   → ${count} entreprises ont un category_id ORPHELIN (catégorie supprimée)`);
  }

  // Check total orphaned categories
  console.log('\n\n📊 Analyse globale des catégories orphelines...');

  const { data: allBusinesses } = await supabase
    .from('businesses')
    .select('category_id')
    .not('category_id', 'is', null)
    .limit(50000);

  if (allBusinesses) {
    const uniqueCategoryIds = [...new Set(allBusinesses.map(b => b.category_id))];
    console.log(`   - Catégories uniques utilisées: ${uniqueCategoryIds.length}`);

    let orphanCount = 0;
    for (const catId of uniqueCategoryIds.slice(0, 100)) {
      const { data: exists } = await supabase
        .from('business_categories')
        .select('id')
        .eq('id', catId)
        .single();

      if (!exists) {
        orphanCount++;
      }
    }

    console.log(`   - Catégories orphelines (échantillon 100): ${orphanCount}`);
  }
}

findOrphanCategory();
