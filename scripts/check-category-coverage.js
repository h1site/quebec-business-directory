import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCategoryCoverage() {
  console.log('🔍 Vérification de la couverture des catégories...\n');

  // Total businesses
  const { count: total } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  // Businesses with main_category_id
  const { count: withCategory } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  // Businesses without main_category_id
  const withoutCategory = total - withCategory;

  console.log('📊 État actuel:');
  console.log(`   Total: ${total.toLocaleString()} entreprises`);
  console.log(`   Avec catégorie: ${withCategory.toLocaleString()} (${((withCategory/total)*100).toFixed(2)}%)`);
  console.log(`   Sans catégorie: ${withoutCategory.toLocaleString()} (${((withoutCategory/total)*100).toFixed(2)}%)`);

  // Check ACT_ECON codes
  const { count: withActEcon } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  console.log(`\n📋 Codes ACT_ECON:`);
  console.log(`   Avec act_econ_code: ${withActEcon.toLocaleString()} (${((withActEcon/total)*100).toFixed(2)}%)`);

  // Sample some businesses without category
  const { data: samples } = await supabase
    .from('businesses')
    .select('name, act_econ_code, main_category_id')
    .is('main_category_id', null)
    .not('act_econ_code', 'is', null)
    .limit(10);

  console.log('\n🔍 Échantillon de 10 entreprises sans catégorie:');
  samples.forEach(b => {
    console.log(`   ${b.name}: act_econ=${b.act_econ_code}`);
  });

  // Check mapping table
  const { count: mappings } = await supabase
    .from('act_econ_to_main_category')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🗺️  Mappings ACT_ECON → catégories: ${mappings}`);
}

checkCategoryCoverage().catch(console.error);
