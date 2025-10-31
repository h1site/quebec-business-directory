import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function compareActEconCodes() {
  console.log('🔍 COMPARAISON DES CODES ACT_ECON\n');
  console.log('='.repeat(80));

  // 1. Sample codes from businesses
  console.log('\n📊 Codes dans "businesses" (sample 20):');
  console.log('-'.repeat(80));

  const { data: bizCodes } = await supabase
    .from('businesses')
    .select('act_econ_code')
    .not('act_econ_code', 'is', null)
    .is('main_category_id', null)
    .limit(20);

  const uniqueBizCodes = [...new Set(bizCodes.map(b => b.act_econ_code))].sort();
  console.log(uniqueBizCodes.join(', '));

  // 2. Sample codes from mappings
  console.log('\n📊 Codes dans "act_econ_category_mappings" (sample 20):');
  console.log('-'.repeat(80));

  const { data: mappingCodes } = await supabase
    .from('act_econ_category_mappings')
    .select('act_econ_code')
    .limit(20);

  const uniqueMappingCodes = [...new Set(mappingCodes.map(m => m.act_econ_code))].sort();
  console.log(uniqueMappingCodes.join(', '));

  // 3. Try to find matches
  console.log('\n🔄 Recherche de correspondances:');
  console.log('-'.repeat(80));

  let matches = 0;
  for (const bizCode of uniqueBizCodes) {
    const { data: match } = await supabase
      .from('act_econ_category_mappings')
      .select('act_econ_code, main_category_id')
      .eq('act_econ_code', bizCode)
      .single();

    if (match) {
      console.log(`✅ "${bizCode}" → MATCH`);
      matches++;
    } else {
      console.log(`❌ "${bizCode}" → NO MATCH`);
    }
  }

  console.log(`\nTotal matches: ${matches}/${uniqueBizCodes.length}`);

  // 4. Check code formats
  console.log('\n📏 Format des codes:');
  console.log('-'.repeat(80));

  console.log('\nBusinesses:');
  bizCodes.slice(0, 5).forEach(b => {
    console.log(`  "${b.act_econ_code}" (length: ${b.act_econ_code.length})`);
  });

  console.log('\nMappings:');
  mappingCodes.slice(0, 5).forEach(m => {
    console.log(`  "${m.act_econ_code}" (length: ${m.act_econ_code.length})`);
  });

  // 5. Distribution of codes in businesses
  console.log('\n📊 Distribution des codes dans businesses:');
  console.log('-'.repeat(80));

  const { data: allBizCodes } = await supabase
    .from('businesses')
    .select('act_econ_code')
    .not('act_econ_code', 'is', null)
    .is('main_category_id', null)
    .limit(5000);

  const codeCount = {};
  allBizCodes.forEach(b => {
    codeCount[b.act_econ_code] = (codeCount[b.act_econ_code] || 0) + 1;
  });

  const sorted = Object.entries(codeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log('\nTop 20 codes les plus fréquents (sample de 5000):');
  sorted.forEach(([code, count]) => {
    console.log(`  ${code}: ${count} entreprises`);
  });

  console.log('\n' + '='.repeat(80));
}

compareActEconCodes().catch(console.error);
