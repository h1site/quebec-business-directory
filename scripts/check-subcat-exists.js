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

console.log('🔍 Checking subcategory: soins-infirmiers-prives\n');

const { data, error } = await supabase
  .from('sub_categories')
  .select('slug, label_fr, main_category:main_categories(slug, label_fr)')
  .eq('slug', 'soins-infirmiers-prives')
  .maybeSingle();

if (error) {
  console.log('❌ Error:', error.message);
} else if (data) {
  console.log('✅ Found subcategory:');
  console.log(JSON.stringify(data, null, 2));
} else {
  console.log('❌ Subcategory NOT found in database');
  console.log('\nSearching for similar slugs...');
  
  const { data: similar } = await supabase
    .from('sub_categories')
    .select('slug, label_fr')
    .ilike('slug', '%soins%')
    .limit(10);
    
  if (similar && similar.length > 0) {
    console.log('\nSimilar subcategories found:');
    similar.forEach(s => console.log(`  - ${s.slug}: ${s.label_fr}`));
  }
}
