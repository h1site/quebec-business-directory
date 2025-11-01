/**
 * Analyser les entreprises avec main_category_id mais sans vraie catégorisation
 *
 * Problème identifié: Des entreprises ont main_category_id assigné
 * mais n'ont PAS de catégorie dans leur champ 'categories' array.
 *
 * Exemple: NEQ 8880410194 - Office d'habitation
 * - act_econ_code: "0001" (code générique)
 * - categories: []
 * - main_category_id: technologie UUID (INCORRECT!)
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

console.log('🔍 ANALYSE DES ENTREPRISES MAL CATÉGORISÉES\n');
console.log('═'.repeat(80));

// 1. Total avec main_category_id
const { count: totalWithMainCatId } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .not('main_category_id', 'is', null);

console.log('\n📊 STATISTIQUES GLOBALES:');
console.log(`   Entreprises avec main_category_id: ${totalWithMainCatId?.toLocaleString()}`);

// 2. Récupérer toutes les entreprises avec main_category_id et vérifier si categories est vide
const { data: allWithMainCat } = await supabase
  .from('businesses')
  .select('id, categories, main_category_id')
  .not('main_category_id', 'is', null)
  .limit(50000);

const incorrectCat = allWithMainCat?.filter(b => !b.categories || b.categories.length === 0).length || 0;

console.log(`   Entreprises avec main_category_id MAIS categories=[]: ${incorrectCat.toLocaleString()}`);
console.log(`   ⚠️  INCORRECT: ${incorrectCat.toLocaleString()} entreprises mal catégorisées\n`);

// 3. Analyser par code ACT_ECON
console.log('📋 TOP 10 CODES ACT_ECON MAL CATÉGORISÉS:\n');

const { data: topCodes } = await supabase
  .from('businesses')
  .select('act_econ_code, categories')
  .not('main_category_id', 'is', null)
  .limit(50000);

if (topCodes) {
  const codeCounts = {};
  topCodes
    .filter(b => !b.categories || b.categories.length === 0)
    .forEach(b => {
      const code = b.act_econ_code || 'NULL';
      codeCounts[code] = (codeCounts[code] || 0) + 1;
    });

  const sorted = Object.entries(codeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  sorted.forEach(([code, count], i) => {
    console.log(`   ${i + 1}. Code "${code}": ${count.toLocaleString()} entreprises`);
  });
}

// 4. Analyser par main_category_id assigné
console.log('\n\n📂 CATÉGORIES ASSIGNÉES INCORRECTEMENT:\n');

const { data: wrongCats } = await supabase
  .from('businesses')
  .select('main_category_id, categories')
  .not('main_category_id', 'is', null)
  .limit(50000);

if (wrongCats) {
  const catCounts = {};
  wrongCats
    .filter(b => !b.categories || b.categories.length === 0)
    .forEach(b => {
      const catId = b.main_category_id;
      catCounts[catId] = (catCounts[catId] || 0) + 1;
    });

  const sortedCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  for (const [catId, count] of sortedCats) {
    const { data: cat } = await supabase
      .from('main_categories')
      .select('name_fr, name_en, slug')
      .eq('id', catId)
      .single();

    const catName = cat ? (cat.name_fr || cat.slug) : 'Unknown';
    console.log(`   ${catName}: ${count.toLocaleString()} entreprises`);
  }
}

// 5. Échantillon d'entreprises affectées
console.log('\n\n📋 ÉCHANTILLON 10 ENTREPRISES MAL CATÉGORISÉES:\n');

const { data: allSample } = await supabase
  .from('businesses')
  .select('neq, name, act_econ_code, main_category_id, categories, main_category_slug')
  .not('main_category_id', 'is', null)
  .limit(1000);

const sample = allSample?.filter(b => !b.categories || b.categories.length === 0).slice(0, 10);

if (sample) {
  for (const biz of sample) {
    const { data: cat } = await supabase
      .from('main_categories')
      .select('name_fr, slug')
      .eq('id', biz.main_category_id)
      .single();

    console.log(`NEQ ${biz.neq}: ${biz.name}`);
    console.log(`   act_econ_code: ${biz.act_econ_code}`);
    console.log(`   main_category_id: ${cat ? cat.name_fr || cat.slug : 'Unknown'}`);
    console.log(`   categories: []`);
    console.log(`   main_category_slug: ${biz.main_category_slug || 'NULL'}`);
    console.log('');
  }
}

console.log('═'.repeat(80));
console.log('\n✅ Analyse terminée\n');
console.log('💡 RECOMMANDATION:');
console.log('   Réinitialiser main_category_id à NULL pour ces entreprises');
console.log('   car elles n\'ont PAS de vraie catégorisation (categories=[])');
