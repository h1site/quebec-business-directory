import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Checking businesses in subcategory: soins-infirmiers-prives\n');

const { data, error, count } = await supabase
  .from('businesses_enriched')
  .select('*', { count: 'exact', head: false })
  .eq('primary_sub_category_slug', 'soins-infirmiers-prives')
  .limit(5);

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log(`✅ Found ${count} businesses in this subcategory`);
  if (data && data.length > 0) {
    console.log('\nFirst business:');
    console.log(`  - ${data[0].name} (${data[0].city})`);
  } else {
    console.log('\n❌ No businesses found with this primary_sub_category_slug');
  }
}
