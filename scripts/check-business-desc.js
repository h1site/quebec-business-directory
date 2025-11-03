/**
 * Quick script to check if a specific business has description_en
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

const slug = 'joligren-inc-2';

async function checkBusiness() {
  console.log(`\n🔍 Checking business: ${slug}\n`);

  // Try businesses table directly first
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, description, description_en')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data) {
    console.log('❌ Business not found');
    return;
  }

  console.log('✅ Business found:');
  console.log('  Name:', data.name);
  console.log('  Slug:', data.slug);
  console.log('\n📝 French description (description):');
  console.log('  ', data.description ? data.description.substring(0, 150) + '...' : 'NULL');
  console.log('\n📝 English description (description_en):');
  console.log('  ', data.description_en ? data.description_en.substring(0, 150) + '...' : 'NULL');

  if (!data.description_en) {
    console.log('\n❌ PROBLEM: description_en is NULL - English descriptions not yet generated for this business');
  } else {
    console.log('\n✅ Both descriptions exist');
  }
}

checkBusiness()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
