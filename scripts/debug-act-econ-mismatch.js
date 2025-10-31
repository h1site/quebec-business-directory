import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function debugActEconMismatch() {
  console.log('🔍 DEBUG: ACT_ECON CODES MISMATCH\n');
  console.log('='.repeat(80));

  // 1. Get sample businesses with act_econ_code but no main_category_id
  console.log('\n1️⃣ Sample businesses with act_econ but no main_category_id:\n');

  const { data: sampleBiz, error: sampleError } = await supabase
    .from('businesses')
    .select('id, name, act_econ_code, main_category_id')
    .not('act_econ_code', 'is', null)
    .is('main_category_id', null)
    .limit(10);

  if (sampleError) {
    console.error('Error:', sampleError);
    return;
  }

  console.log('Sample businesses:');
  sampleBiz.forEach(biz => {
    console.log(`  - ${biz.name}`);
    console.log(`    act_econ_code: "${biz.act_econ_code}" (length: ${biz.act_econ_code.length}, first 4: "${biz.act_econ_code.substring(0, 4)}")`);
  });

  // 2. Get all mapping codes
  console.log('\n2️⃣ All ACT_ECON codes in mapping table:\n');

  const { data: mappings } = await supabase
    .from('act_econ_to_main_category')
    .select('act_econ_code, main_category_id')
    .limit(10);

  console.log('Sample mappings:');
  mappings.forEach(m => {
    console.log(`  - Code: "${m.act_econ_code}" (length: ${m.act_econ_code.length}) → ${m.main_category_id}`);
  });

  // 3. Try to find a match for first sample business
  console.log('\n3️⃣ Testing match for first business:\n');

  const firstBiz = sampleBiz[0];
  const mainCode = firstBiz.act_econ_code.substring(0, 4);
  console.log(`Business: ${firstBiz.name}`);
  console.log(`Full code: "${firstBiz.act_econ_code}"`);
  console.log(`Main code (first 4): "${mainCode}"`);

  const { data: match, error: matchError } = await supabase
    .from('act_econ_to_main_category')
    .select('*')
    .eq('act_econ_code', mainCode);

  console.log(`\nLooking for mapping with code "${mainCode}":`);
  if (match && match.length > 0) {
    console.log('✅ MATCH FOUND:');
    console.log(JSON.stringify(match, null, 2));
  } else {
    console.log('❌ NO MATCH FOUND');
    console.log('Error:', matchError);
  }

  // 4. Check if maybe it's a 5-digit or 6-digit code issue
  console.log('\n4️⃣ Checking all possible code lengths:\n');

  for (let len = 3; len <= 6; len++) {
    const testCode = firstBiz.act_econ_code.substring(0, len);
    const { data: testMatch } = await supabase
      .from('act_econ_to_main_category')
      .select('act_econ_code, main_category_id')
      .eq('act_econ_code', testCode)
      .single();

    console.log(`  Length ${len}: "${testCode}" → ${testMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    if (testMatch) {
      console.log(`    → main_category_id: ${testMatch.main_category_id}`);
    }
  }

  // 5. Get distribution of act_econ_code lengths in businesses
  console.log('\n5️⃣ Distribution of ACT_ECON code lengths in businesses:\n');

  const { data: bizWithActEcon } = await supabase
    .from('businesses')
    .select('act_econ_code')
    .not('act_econ_code', 'is', null)
    .limit(1000);

  const lengthDist = {};
  bizWithActEcon.forEach(b => {
    const len = b.act_econ_code.length;
    lengthDist[len] = (lengthDist[len] || 0) + 1;
  });

  console.log('Code length distribution (sample of 1000):');
  Object.entries(lengthDist)
    .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
    .forEach(([len, count]) => {
      console.log(`  Length ${len}: ${count} businesses`);
    });

  // 6. Get distribution of act_econ_code lengths in mapping table
  console.log('\n6️⃣ Distribution of ACT_ECON code lengths in mapping table:\n');

  const { data: allMappings } = await supabase
    .from('act_econ_to_main_category')
    .select('act_econ_code');

  const mappingLengthDist = {};
  allMappings.forEach(m => {
    const len = m.act_econ_code.length;
    mappingLengthDist[len] = (mappingLengthDist[len] || 0) + 1;
  });

  console.log('Mapping code length distribution:');
  Object.entries(mappingLengthDist)
    .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
    .forEach(([len, count]) => {
      console.log(`  Length ${len}: ${count} mappings`);
    });

  console.log('\n' + '='.repeat(80));
  console.log('💡 DIAGNOSTIC');
  console.log('='.repeat(80));
  console.log('\nIf code lengths don\'t match, the substring(0, 4) approach won\'t work.');
  console.log('We need to adjust the matching logic based on actual code formats.\n');
}

debugActEconMismatch().catch(console.error);
