import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const targetUUID = '065589d2-5efd-47d5-a8b1-dcc418023bd6';

async function findUUID() {
  console.log(`🔍 Recherche du UUID: ${targetUUID}\n`);

  // 1. Check in businesses table
  console.log('1️⃣ Vérification dans la table "businesses"...');
  const { data: business, error: err1 } = await supabase
    .from('businesses')
    .select('id, name, category_id, main_category, sub_category')
    .eq('id', targetUUID)
    .single();

  if (business) {
    console.log('✅ TROUVÉ dans la table "businesses"!');
    console.log(`   - Nom: ${business.name}`);
    console.log(`   - category_id: ${business.category_id}`);
    console.log(`   - main_category: ${business.main_category}`);
    console.log(`   - sub_category: ${business.sub_category}`);

    // Get category details
    if (business.category_id) {
      const { data: cat } = await supabase
        .from('business_categories')
        .select('name_fr, name_en')
        .eq('id', business.category_id)
        .single();

      if (cat) {
        console.log(`   - Catégorie: ${cat.name_fr} / ${cat.name_en}`);
      }
    }
    return;
  }

  // 2. Check in business_categories table
  console.log('\n2️⃣ Vérification dans la table "business_categories"...');
  const { data: category, error: err2 } = await supabase
    .from('business_categories')
    .select('id, name_fr, name_en, parent_id')
    .eq('id', targetUUID)
    .single();

  if (category) {
    console.log('✅ TROUVÉ dans la table "business_categories"!');
    console.log(`   - Nom FR: ${category.name_fr}`);
    console.log(`   - Nom EN: ${category.name_en}`);
    console.log(`   - parent_id: ${category.parent_id}`);

    // Get parent category if exists
    if (category.parent_id) {
      const { data: parent } = await supabase
        .from('business_categories')
        .select('name_fr, name_en')
        .eq('id', category.parent_id)
        .single();

      if (parent) {
        console.log(`   - Catégorie parent: ${parent.name_fr} / ${parent.name_en}`);
      }
    } else {
      console.log('   - C\'est une CATÉGORIE PRINCIPALE (pas de parent)');
    }
    return;
  }

  // 3. Check if it's used as category_id in businesses
  console.log('\n3️⃣ Vérification si utilisé comme category_id dans "businesses"...');
  const { data: businessesWithCat, count } = await supabase
    .from('businesses')
    .select('id, name', { count: 'exact', head: false })
    .eq('category_id', targetUUID)
    .limit(5);

  if (businessesWithCat && businessesWithCat.length > 0) {
    console.log(`✅ TROUVÉ: Ce UUID est utilisé comme category_id par ${count} entreprises`);
    console.log(`   Exemples d'entreprises:`);
    businessesWithCat.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.name} (${b.id})`);
    });

    // Get the category details
    const { data: cat } = await supabase
      .from('business_categories')
      .select('name_fr, name_en, parent_id')
      .eq('id', targetUUID)
      .single();

    if (cat) {
      console.log(`\n   Détails de la catégorie:`);
      console.log(`   - Nom FR: ${cat.name_fr}`);
      console.log(`   - Nom EN: ${cat.name_en}`);
      if (cat.parent_id) {
        const { data: parent } = await supabase
          .from('business_categories')
          .select('name_fr, name_en')
          .eq('id', cat.parent_id)
          .single();
        if (parent) {
          console.log(`   - Catégorie principale: ${parent.name_fr} / ${parent.name_en}`);
        }
      } else {
        console.log(`   - C'est une CATÉGORIE PRINCIPALE`);
      }
    }
    return;
  }

  // 4. Check if it's used as parent_id in business_categories
  console.log('\n4️⃣ Vérification si utilisé comme parent_id dans "business_categories"...');
  const { data: subCategories, count: subCount } = await supabase
    .from('business_categories')
    .select('id, name_fr, name_en', { count: 'exact' })
    .eq('parent_id', targetUUID)
    .limit(10);

  if (subCategories && subCategories.length > 0) {
    console.log(`✅ TROUVÉ: Ce UUID est la catégorie PARENT de ${subCount} sous-catégories`);
    console.log(`   Sous-catégories:`);
    subCategories.forEach((sub, i) => {
      console.log(`   ${i + 1}. ${sub.name_fr} / ${sub.name_en}`);
    });

    // Get the parent category details
    const { data: parent } = await supabase
      .from('business_categories')
      .select('name_fr, name_en')
      .eq('id', targetUUID)
      .single();

    if (parent) {
      console.log(`\n   Catégorie principale:`);
      console.log(`   - Nom FR: ${parent.name_fr}`);
      console.log(`   - Nom EN: ${parent.name_en}`);
    }
    return;
  }

  console.log('\n❌ UUID non trouvé dans aucune table');
}

findUUID();
