import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkLevels() {
  console.log('🔍 Analyse des niveaux 2 et 3...\n');

  // Level 2
  console.log('📋 LEVEL 2 - Échantillon:');
  const { data: level2, count: count2 } = await supabase
    .from('act_econ_codes')
    .select('code, label_fr, parent_code, category_level', { count: 'exact' })
    .eq('category_level', 2)
    .order('code')
    .limit(10);

  console.log(`Total: ${count2} codes`);
  level2.forEach(row => {
    console.log(`   ${row.code}: ${row.label_fr} (parent: ${row.parent_code})`);
  });

  // Level 3
  console.log('\n📋 LEVEL 3 - Échantillon:');
  const { data: level3, count: count3 } = await supabase
    .from('act_econ_codes')
    .select('code, label_fr, parent_code, category_level', { count: 'exact' })
    .eq('category_level', 3)
    .order('code')
    .limit(10);

  console.log(`Total: ${count3} codes`);
  level3.forEach(row => {
    console.log(`   ${row.code}: ${row.label_fr} (parent: ${row.parent_code})`);
  });

  console.log('\n📊 RÉSUMÉ:');
  console.log(`   - Level 2: ${count2} codes (ex: 0110, 0120, etc.)`);
  console.log(`   - Level 3: ${count3} codes (ex: 0111, 0112, etc.)`);
  console.log('\n💡 STRATÉGIE:');
  console.log('   - Level 2: parent_code → code principal (0110 → 0100)');
  console.log('   - Level 3: parent_code → GARDER parent level 2 (0111 → 0110)');
}

checkLevels();
