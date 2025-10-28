import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSubCategories() {
  console.log('🔍 Vérification de la table sub_categories...\n');

  // 1. Structure de la table
  const { data: sample, error: sampleError } = await supabase
    .from('sub_categories')
    .select('*')
    .limit(1)
    .single();

  if (sampleError) {
    console.error('❌ Erreur:', sampleError.message);
    console.log('\n💡 La table sub_categories n\'existe probablement pas.');
    return;
  }

  console.log('✅ Table sub_categories trouvée!');
  console.log('Colonnes:', Object.keys(sample).join(', '));

  // 2. Compter le total
  const { count, error: countError } = await supabase
    .from('sub_categories')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total de sous-catégories: ${count}`);

  // 3. Échantillon par catégorie principale
  console.log('\n📋 Échantillon de sous-catégories par catégorie principale:\n');

  const { data: mainCats } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr')
    .limit(5);

  for (const mainCat of mainCats) {
    const { data: subs, count: subCount } = await supabase
      .from('sub_categories')
      .select('id, slug, label_fr', { count: 'exact' })
      .eq('main_category_id', mainCat.id)
      .limit(5);

    console.log(`🏷️  ${mainCat.label_fr} (${mainCat.slug})`);
    console.log(`   Total: ${subCount} sous-catégories`);
    if (subs && subs.length > 0) {
      subs.forEach(sub => {
        console.log(`   - ${sub.label_fr} (${sub.slug})`);
      });
    }
    console.log('');
  }

  // 4. Vérifier la structure
  console.log('='.repeat(70));
  console.log('📋 STRUCTURE DES CATÉGORIES SUR LE SITE:');
  console.log('='.repeat(70));
  console.log('\n1️⃣ CATÉGORIES PRINCIPALES');
  console.log('   Table: main_categories');
  console.log('   Colonnes: id, slug, label_fr, label_en');
  console.log('   Utilisée dans: businesses.main_category_id\n');

  console.log('2️⃣ SOUS-CATÉGORIES');
  console.log('   Table: sub_categories');
  console.log('   Colonnes: id, slug, label_fr, main_category_id');
  console.log('   Utilisée dans: businesses.sub_category_ids (array)\n');

  console.log('3️⃣ ACT_ECON (nouveau système)');
  console.log('   Tables:');
  console.log('   - act_econ_main: Codes principaux (0100, 0200, ... 9900)');
  console.log('   - act_econ_codes: Codes détaillés (0110, 0111, ...)');
  console.log('   Utilisée dans: businesses.act_econ_code\n');
}

checkSubCategories();
