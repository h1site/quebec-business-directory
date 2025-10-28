import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const targetUUID = '065589d2-5efd-47d5-a8b1-dcc418023bd6';

async function findCategoryStructure() {
  console.log(`🔍 Recherche du UUID: ${targetUUID}\n`);

  // 1. Get a sample business to see the structure
  console.log('📋 Structure de la table businesses:');
  const { data: sampleBusiness } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single();

  if (sampleBusiness) {
    console.log('Colonnes disponibles:', Object.keys(sampleBusiness).join(', '));
    console.log('');
  }

  // 2. Check in main_category field
  console.log('\n1️⃣ Recherche dans le champ "main_category"...');
  const { data: businessesMainCat, count: countMain } = await supabase
    .from('businesses')
    .select('id, name, main_category, sub_category', { count: 'exact' })
    .eq('main_category', targetUUID)
    .limit(10);

  if (businessesMainCat && businessesMainCat.length > 0) {
    console.log(`✅ TROUVÉ: ${countMain} entreprises ont ce UUID comme main_category\n`);
    console.log('Échantillon:');
    businessesMainCat.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   - ID: ${b.id}`);
      console.log(`   - main_category: ${b.main_category}`);
      console.log(`   - sub_category: ${b.sub_category}\n`);
    });

    // Get the category details
    const { data: category } = await supabase
      .from('business_categories')
      .select('id, name_fr, name_en, parent_id')
      .eq('id', targetUUID)
      .single();

    if (category) {
      console.log('📂 Détails de la catégorie principale:');
      console.log(`   - Nom FR: ${category.name_fr}`);
      console.log(`   - Nom EN: ${category.name_en}`);
      console.log(`   - parent_id: ${category.parent_id || 'NULL (c\'est une catégorie racine)'}`);
    } else {
      console.log('❌ ATTENTION: Cette catégorie N\'EXISTE PAS dans business_categories (orpheline!)');
    }
  } else {
    console.log('❌ Aucune entreprise avec ce main_category');
  }

  // 3. Check in sub_category field
  console.log('\n2️⃣ Recherche dans le champ "sub_category"...');
  const { data: businessesSubCat, count: countSub } = await supabase
    .from('businesses')
    .select('id, name, main_category, sub_category', { count: 'exact' })
    .eq('sub_category', targetUUID)
    .limit(10);

  if (businessesSubCat && businessesSubCat.length > 0) {
    console.log(`✅ TROUVÉ: ${countSub} entreprises ont ce UUID comme sub_category\n`);
    console.log('Échantillon:');
    businessesSubCat.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   - ID: ${b.id}`);
      console.log(`   - main_category: ${b.main_category}`);
      console.log(`   - sub_category: ${b.sub_category}\n`);
    });

    // Get the category details
    const { data: category } = await supabase
      .from('business_categories')
      .select('id, name_fr, name_en, parent_id')
      .eq('id', targetUUID)
      .single();

    if (category) {
      console.log('📂 Détails de la sous-catégorie:');
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
        }
      }
    } else {
      console.log('❌ ATTENTION: Cette catégorie N\'EXISTE PAS dans business_categories (orpheline!)');
    }
  } else {
    console.log('❌ Aucune entreprise avec ce sub_category');
  }

  // 4. Check if UUID exists in business_categories
  console.log('\n3️⃣ Vérification dans business_categories...');
  const { data: catInTable } = await supabase
    .from('business_categories')
    .select('id, name_fr, name_en, parent_id')
    .eq('id', targetUUID)
    .single();

  if (catInTable) {
    console.log('✅ La catégorie EXISTE dans business_categories:');
    console.log(`   - Nom FR: ${catInTable.name_fr}`);
    console.log(`   - Nom EN: ${catInTable.name_en}`);
    console.log(`   - parent_id: ${catInTable.parent_id || 'NULL'}`);
  } else {
    console.log('❌ La catégorie N\'EXISTE PAS dans business_categories');
  }

  // 5. Summary
  console.log('\n\n📊 RÉSUMÉ:');
  console.log(`UUID: ${targetUUID}`);
  console.log(`- Utilisé comme main_category: ${countMain || 0} fois`);
  console.log(`- Utilisé comme sub_category: ${countSub || 0} fois`);
  console.log(`- Existe dans business_categories: ${catInTable ? 'OUI' : 'NON'}`);

  if ((countMain > 0 || countSub > 0) && !catInTable) {
    console.log('\n⚠️  PROBLÈME: Catégorie orpheline détectée!');
    console.log('Des entreprises référencent une catégorie qui n\'existe plus.');
  }
}

findCategoryStructure();
