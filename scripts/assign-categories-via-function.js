import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  ASSIGNMENT DES CATÉGORIES VIA FONCTION SQL\n');
console.log('═══════════════════════════════════════════════════════════\n');

async function assignCategories() {
  console.log('🚀 Appel de la fonction SQL côté serveur...\n');
  console.log('⏰ Cette opération peut prendre 1-2 minutes...\n');

  try {
    // Appeler la fonction SQL
    const { data, error } = await supabase.rpc('assign_categories_from_act_econ');

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ TERMINÉ!');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (data && data.length > 0) {
      const result = data[0];
      console.log('📊 Résultats:');
      console.log(`   Codes ACT_ECON traités: ${result.codes_processed}`);
      console.log(`   Businesses mis à jour: ${result.total_updated?.toLocaleString()}`);
    }

    console.log('\n🔍 Vérification des statistiques...\n');

    // Vérifier les résultats
    const { count: totalWithActEcon } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .not('act_econ_code', 'is', null);

    // Échantillon pour compter ceux avec catégories
    const { data: sample } = await supabase
      .from('businesses')
      .select('categories')
      .not('act_econ_code', 'is', null)
      .range(0, 9999);

    const withCategories = sample?.filter(b => b.categories && b.categories.length > 0).length || 0;
    const estimated = Math.round((withCategories / 10000) * totalWithActEcon);
    const percentage = ((estimated / totalWithActEcon) * 100).toFixed(1);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 STATISTIQUES FINALES:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total avec ACT_ECON: ${totalWithActEcon?.toLocaleString()}`);
    console.log(`Échantillon (10K): ${withCategories.toLocaleString()} avec catégories`);
    console.log(`Estimation: ${estimated.toLocaleString()} avec catégories`);
    console.log(`Taux: ${percentage}%`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Exemples
    const { data: examples } = await supabase
      .from('businesses')
      .select('name, act_econ_code, categories')
      .not('act_econ_code', 'is', null)
      .not('categories', 'eq', '[]')
      .limit(5);

    console.log('📋 Exemples de businesses avec catégories:\n');
    examples?.forEach(b => {
      console.log(`  ✅ ${b.name}`);
      console.log(`     ACT_ECON: ${b.act_econ_code} | ${b.categories?.length || 0} catégorie(s)`);
    });

    console.log('\n✨ Assignment terminé avec succès!\n');

  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

assignCategories();
