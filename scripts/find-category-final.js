import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const targetUUID = '065589d2-5efd-47d5-a8b1-dcc418023bd6';

async function findCategory() {
  console.log(`🔍 Recherche du UUID: ${targetUUID}\n`);

  // 1. Check in main_category_id
  console.log('1️⃣ Recherche dans le champ "main_category_id"...');
  const { data: businessesMain, count: countMain } = await supabase
    .from('businesses')
    .select('id, name, main_category_id, sub_category_ids', { count: 'exact' })
    .eq('main_category_id', targetUUID)
    .limit(10);

  if (businessesMain && businessesMain.length > 0) {
    console.log(`✅ TROUVÉ: ${countMain} entreprises ont ce UUID comme main_category_id\n`);
    console.log('Échantillon:');
    businessesMain.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   - ID: ${b.id}`);
      console.log(`   - main_category_id: ${b.main_category_id}`);
      console.log(`   - sub_category_ids: ${b.sub_category_ids}\n`);
    });
  } else {
    console.log('❌ Aucune entreprise avec ce main_category_id');
  }

  // 2. Check in sub_category_ids array
  console.log('\n2️⃣ Recherche dans le array "sub_category_ids"...');
  const { data: businessesSub, count: countSub } = await supabase
    .from('businesses')
    .select('id, name, main_category_id, sub_category_ids', { count: 'exact' })
    .contains('sub_category_ids', [targetUUID])
    .limit(10);

  if (businessesSub && businessesSub.length > 0) {
    console.log(`✅ TROUVÉ: ${countSub} entreprises ont ce UUID dans sub_category_ids\n`);
    console.log('Échantillon:');
    businessesSub.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   - ID: ${b.id}`);
      console.log(`   - main_category_id: ${b.main_category_id}`);
      console.log(`   - sub_category_ids: ${b.sub_category_ids}\n`);
    });
  } else {
    console.log('❌ Aucune entreprise avec ce UUID dans sub_category_ids');
  }

  // 3. Check if it exists in business_categories
  console.log('\n3️⃣ Vérification dans business_categories...');
  const { data: category } = await supabase
    .from('business_categories')
    .select('id, name_fr, name_en, parent_id')
    .eq('id', targetUUID)
    .single();

  if (category) {
    console.log('✅ La catégorie EXISTE dans business_categories:');
    console.log(`   - Nom FR: ${category.name_fr}`);
    console.log(`   - Nom EN: ${category.name_en}`);
    console.log(`   - parent_id: ${category.parent_id || 'NULL (catégorie principale)'}`);

    if (category.parent_id) {
      const { data: parent } = await supabase
        .from('business_categories')
        .select('id, name_fr, name_en')
        .eq('id', category.parent_id)
        .single();

      if (parent) {
        console.log(`\n   ➜ CATÉGORIE PRINCIPALE ASSOCIÉE:`);
        console.log(`     - ID: ${parent.id}`);
        console.log(`     - Nom FR: ${parent.name_fr}`);
        console.log(`     - Nom EN: ${parent.name_en}`);
      } else {
        console.log(`\n   ⚠️  ATTENTION: parent_id pointe vers une catégorie qui n'existe pas!`);
      }
    } else {
      console.log(`\n   ℹ️  C'est une CATÉGORIE PRINCIPALE (racine)`);
    }

    // Get all sub-categories if it's a parent
    const { data: children, count: childCount } = await supabase
      .from('business_categories')
      .select('id, name_fr, name_en', { count: 'exact' })
      .eq('parent_id', targetUUID)
      .limit(20);

    if (children && children.length > 0) {
      console.log(`\n   📂 Sous-catégories (${childCount} total):`);
      children.forEach((child, i) => {
        console.log(`     ${i + 1}. ${child.name_fr} / ${child.name_en}`);
      });
    }
  } else {
    console.log('❌ La catégorie N\'EXISTE PAS dans business_categories');
  }

  // 4. Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ FINAL');
  console.log('='.repeat(60));
  console.log(`UUID: ${targetUUID}`);
  console.log(`Table: business_categories`);
  console.log(`Existe: ${category ? 'OUI ✅' : 'NON ❌'}`);

  if (category) {
    console.log(`\nType: ${category.parent_id ? 'SOUS-CATÉGORIE' : 'CATÉGORIE PRINCIPALE'}`);
    console.log(`Nom FR: ${category.name_fr}`);
    console.log(`Nom EN: ${category.name_en}`);

    if (category.parent_id) {
      console.log(`\nCatégorie principale (parent_id): ${category.parent_id}`);
    }
  }

  console.log(`\nUtilisation dans businesses:`);
  console.log(`- Comme main_category_id: ${countMain || 0} entreprises`);
  console.log(`- Dans sub_category_ids: ${countSub || 0} entreprises`);
  console.log('='.repeat(60));
}

findCategory();
