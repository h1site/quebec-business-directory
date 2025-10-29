import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Vérification des tables de mapping ACT_ECON...\n');

// Check for act_econ_to_main_category table
console.log('1️⃣ Table: act_econ_to_main_category');
const { data: table1, error: error1 } = await supabase
  .from('act_econ_to_main_category')
  .select('*')
  .limit(3);

if (error1) {
  console.log('   ❌ N\'existe pas:', error1.message);
} else {
  console.log(`   ✅ Existe! (${table1.length} lignes échantillonnées)`);
  console.log('   Colonnes:', Object.keys(table1[0] || {}));
  if (table1.length > 0) {
    console.log('   Exemple:', table1[0]);
  }
}

// Check for act_econ_category_mappings table
console.log('\n2️⃣ Table: act_econ_category_mappings');
const { data: table2, error: error2 } = await supabase
  .from('act_econ_category_mappings')
  .select('*')
  .limit(3);

if (error2) {
  console.log('   ❌ N\'existe pas:', error2.message);
} else {
  console.log(`   ✅ Existe! (${table2.length} lignes échantillonnées)`);
  console.log('   Colonnes:', Object.keys(table2[0] || {}));
  if (table2.length > 0) {
    console.log('   Exemple:', table2[0]);
  }
}

// Check what column businesses use for categories
console.log('\n3️⃣ Colonnes dans la table businesses:');
const { data: sampleBiz, error: error3 } = await supabase
  .from('businesses')
  .select('id, name, act_econ_code, main_category_id, main_category_slug, categories')
  .limit(1);

if (error3) {
  console.log('   ❌ Erreur:', error3.message);
} else {
  console.log('   Colonnes disponibles:', Object.keys(sampleBiz[0] || {}));
  console.log('   Exemple:', sampleBiz[0]);
}

process.exit(0);
