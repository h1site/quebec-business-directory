/**
 * Afficher tous les mappings ACT_ECON → Catégories
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 MAPPINGS ACT_ECON → CATÉGORIES\n');
console.log('═'.repeat(80));

// Récupérer tous les mappings
const { data: mappings } = await supabase
  .from('act_econ_main_categories')
  .select('act_econ_code, main_category_id')
  .order('act_econ_code');

if (!mappings || mappings.length === 0) {
  console.log('⚠️  Table act_econ_main_categories est vide!');
  console.log('\nCherchons dans act_econ_main_final...\n');

  const { data: finalMappings } = await supabase
    .from('act_econ_main_final')
    .select('*')
    .limit(10);

  console.log('act_econ_main_final:', finalMappings);
  process.exit(0);
}

console.log('Total mappings:', mappings.length);
console.log('');

// Récupérer toutes les catégories
const { data: categories } = await supabase
  .from('main_categories')
  .select('id, name_fr, slug');

const catMap = {};
categories?.forEach(cat => {
  catMap[cat.id] = { name_fr: cat.name_fr, slug: cat.slug };
});

// Grouper par catégorie
const byCategory = {};
mappings.forEach(m => {
  const cat = catMap[m.main_category_id];
  const catName = cat ? (cat.name_fr || cat.slug) : 'Unknown';
  if (!byCategory[catName]) {
    byCategory[catName] = [];
  }
  byCategory[catName].push(m.act_econ_code);
});

// Afficher
console.log('📊 CODES ACT_ECON PAR CATÉGORIE:\n');
Object.keys(byCategory).sort().forEach(catName => {
  const codes = byCategory[catName].sort();
  console.log(`${catName}:`);
  console.log(`   Codes (${codes.length}): ${codes.join(', ')}`);
  console.log('');
});

console.log('═'.repeat(80));
console.log(`\nTotal: ${mappings.length} mappings dans ${Object.keys(byCategory).length} catégories`);
