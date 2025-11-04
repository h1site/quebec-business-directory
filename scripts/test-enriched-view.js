/**
 * Test if businesses_enriched view includes description_en
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testEnrichedView() {
  console.log('\n🔍 Testing businesses_enriched view...\n');

  // Test with a specific business
  const { data, error } = await supabase
    .from('businesses_enriched')
    .select('id, name, slug, description, description_en')
    .eq('slug', 'joligren-inc-2')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data) {
    console.log('❌ Business not found in enriched view');
    return;
  }

  console.log('✅ Business found in enriched view:');
  console.log('  Name:', data.name);
  console.log('  Slug:', data.slug);
  console.log('\n📝 French description (description):');
  console.log('  ', data.description ? data.description.substring(0, 150) + '...' : 'NULL');
  console.log('\n📝 English description (description_en):');
  console.log('  ', data.description_en ? data.description_en.substring(0, 150) + '...' : 'NULL');

  if (!data.description_en) {
    console.log('\n❌ PROBLEM: description_en is NULL in businesses_enriched view');
    console.log('   This means the view needs to be recreated in Supabase.');
    console.log('   Run the SQL from: supabase/migrations/improve_search_ranking_FINAL.sql');
  } else {
    console.log('\n✅ description_en is available in businesses_enriched view');
  }
}

testEnrichedView()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
