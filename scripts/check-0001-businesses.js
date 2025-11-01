/**
 * Vérifier toutes les entreprises avec act_econ_code = "0001"
 *
 * Affiche:
 * - Combien d'entreprises ont ce code
 * - Combien ont main_category_id assigné
 * - Quelles catégories leur sont assignées
 * - Échantillon d'entreprises
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

console.log('🔍 VÉRIFICATION ENTREPRISES act_econ_code = "0001"\n');
console.log('═'.repeat(80));

// 1. Compter total avec code 0001
const { count: total } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .eq('act_econ_code', '0001');

console.log('\n📊 STATISTIQUES:');
console.log(`   Total entreprises avec act_econ_code="0001": ${total?.toLocaleString()}`);

// 2. Compter celles avec main_category_id assigné
const { count: withCat } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .eq('act_econ_code', '0001')
  .not('main_category_id', 'is', null);

console.log(`   Avec main_category_id assigné: ${withCat?.toLocaleString()}`);
console.log(`   Sans main_category_id (NULL): ${(total - withCat)?.toLocaleString()}`);

// 3. Récupérer échantillon avec catégories assignées
const { data: sample } = await supabase
  .from('businesses')
  .select('neq, name, act_econ_code, main_category_id, categories, main_category_slug')
  .eq('act_econ_code', '0001')
  .not('main_category_id', 'is', null)
  .limit(20);

if (sample && sample.length > 0) {
  console.log(`\n📋 ÉCHANTILLON (${sample.length} premières avec catégories):\n`);

  // Récupérer les noms de catégories
  for (const biz of sample) {
    let catName = 'Unknown';

    if (biz.main_category_id) {
      const { data: cat } = await supabase
        .from('main_categories')
        .select('name_fr, slug')
        .eq('id', biz.main_category_id)
        .single();

      catName = cat ? (cat.name_fr || cat.slug) : 'Unknown';
    }

    console.log(`NEQ ${biz.neq}: ${biz.name?.substring(0, 50)}`);
    console.log(`   main_category_id → ${catName}`);
    console.log(`   categories: ${JSON.stringify(biz.categories)}`);
    console.log(`   main_category_slug: ${biz.main_category_slug || 'NULL'}`);
    console.log('');
  }

  // Compter par catégorie assignée
  console.log('\n📊 RÉPARTITION PAR CATÉGORIE ASSIGNÉE:\n');

  const { data: allWithCat } = await supabase
    .from('businesses')
    .select('main_category_id')
    .eq('act_econ_code', '0001')
    .not('main_category_id', 'is', null)
    .limit(5000);

  const catCounts = {};
  for (const biz of allWithCat || []) {
    const catId = biz.main_category_id;
    catCounts[catId] = (catCounts[catId] || 0) + 1;
  }

  const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  for (const [catId, count] of sorted) {
    const { data: cat } = await supabase
      .from('main_categories')
      .select('name_fr, slug')
      .eq('id', catId)
      .single();

    const catName = cat ? (cat.name_fr || cat.slug) : 'Unknown';
    console.log(`   ${catName}: ${count.toLocaleString()} entreprises`);
  }
}

console.log('\n' + '═'.repeat(80));
console.log('\n💡 CONCLUSION:');
console.log('   Le code "0001" est un code GÉNÉRIQUE/NON-CLASSIFIÉ');
console.log('   Ces entreprises ne devraient PAS avoir de main_category_id');
console.log('   car elles n\'ont pas d\'activité économique spécifique déclarée.');
