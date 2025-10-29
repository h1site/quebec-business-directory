import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Checking correlation between act_econ_code and main_category_slug...\n');

// Check businesses with act_econ_code
const { data: withActEcon, error: error1 } = await supabase
  .from('businesses')
  .select('id, name, act_econ_code, main_category_slug')
  .not('act_econ_code', 'is', null)
  .limit(100);

if (error1) {
  console.error('Error fetching businesses with act_econ_code:', error1);
  process.exit(1);
}

// Calculate statistics
let withCategory = 0;
let withoutCategory = 0;

withActEcon.forEach(b => {
  if (b.main_category_slug) withCategory++;
  else withoutCategory++;
});

console.log('📊 Statistics for businesses WITH act_econ_code:');
console.log(`Total sampled: ${withActEcon.length}`);
console.log(`With main_category_slug: ${withCategory} (${(withCategory/withActEcon.length*100).toFixed(1)}%)`);
console.log(`Without main_category_slug: ${withoutCategory} (${(withoutCategory/withActEcon.length*100).toFixed(1)}%)`);

// Show sample data
console.log('\n📝 Sample of businesses with act_econ_code:');
withActEcon.slice(0, 5).forEach(b => {
  console.log(`  - ${b.name}`);
  console.log(`    act_econ_code: ${b.act_econ_code}`);
  console.log(`    main_category_slug: ${b.main_category_slug || '❌ NULL'}`);
});

// Check if there's an act_econ mapping table
console.log('\n🔍 Checking for act_econ mapping tables...');
const { data: tables, error: error2 } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .like('table_name', '%act_econ%');

if (tables && tables.length > 0) {
  console.log('Found tables:', tables.map(t => t.table_name).join(', '));
} else {
  console.log('No act_econ mapping tables found in schema');
}

process.exit(0);
