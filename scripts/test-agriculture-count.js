import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testAgricultureCount() {
  console.log('🌾 Test: Comptage des entreprises en Agriculture\n');

  // 1. Trouver la catégorie Agriculture
  const { data: agricultureCategory } = await supabase
    .from('main_categories')
    .select('id, name_fr, slug')
    .or('name_fr.ilike.%agriculture%,name_fr.ilike.%environnement%')
    .limit(5);

  console.log('📋 Catégories trouvées:');
  agricultureCategory.forEach(cat => {
    console.log(`   - ${cat.name_fr} (${cat.slug})`);
  });

  if (!agricultureCategory || agricultureCategory.length === 0) {
    console.log('\n❌ Aucune catégorie agriculture trouvée');
    return;
  }

  // Prendre la première catégorie trouvée
  const agriCat = agricultureCategory[0];
  console.log(`\n🎯 Utilisation de: ${agriCat.name_fr} (${agriCat.id})\n`);

  // 2. Compter les entreprises dans cette catégorie
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('main_category_id', agriCat.id);

  console.log(`📊 Résultat: ${count?.toLocaleString()} entreprises en ${agriCat.name_fr}`);

  // 3. Échantillon de 10 entreprises
  const { data: samples } = await supabase
    .from('businesses')
    .select('name, act_econ_code')
    .eq('main_category_id', agriCat.id)
    .limit(10);

  console.log(`\n🔍 Échantillon de 10 entreprises:`);
  samples.forEach((biz, i) => {
    console.log(`   ${i + 1}. ${biz.name} (code: ${biz.act_econ_code})`);
  });

  // 4. Statistiques des codes ACT_ECON
  console.log('\n📈 Codes ACT_ECON dans cette catégorie:');
  const { data: codes } = await supabase
    .from('businesses')
    .select('act_econ_code')
    .eq('main_category_id', agriCat.id)
    .not('act_econ_code', 'is', null);

  const codeCount = {};
  codes.forEach(biz => {
    const code = biz.act_econ_code;
    codeCount[code] = (codeCount[code] || 0) + 1;
  });

  const topCodes = Object.entries(codeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  topCodes.forEach(([code, count]) => {
    console.log(`   ${code}: ${count} entreprises`);
  });
}

testAgricultureCount().catch(console.error);
