/**
 * Réinitialiser main_category_id à NULL pour les entreprises mal catégorisées
 *
 * Problème: 953 entreprises ont main_category_id assigné mais categories=[]
 * Ces assignations sont incorrectes et causent des problèmes dans la recherche.
 *
 * Exemple: NEQ 8880410194 (Office d'habitation) apparaît dans "Technologie"
 * alors qu'elle n'a AUCUNE catégorie réelle.
 *
 * Solution: Réinitialiser main_category_id à NULL pour ces entreprises.
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

const FETCH_BATCH_SIZE = 1000;
const UPDATE_BATCH_SIZE = 100; // Supabase has a limit on .in() operator

console.log('🔧 NETTOYAGE DES main_category_id INCORRECTS\n');
console.log('═'.repeat(80));

// 1. Récupérer toutes les entreprises avec main_category_id mais categories=[]
console.log('\n📊 Récupération des entreprises mal catégorisées...\n');

let allBadBusinesses = [];
let page = 0;
let hasMore = true;

while (hasMore) {
  const { data: batch, error } = await supabase
    .from('businesses')
    .select('id, neq, name, main_category_id, categories, act_econ_code')
    .not('main_category_id', 'is', null)
    .range(page * FETCH_BATCH_SIZE, (page + 1) * FETCH_BATCH_SIZE - 1);

  if (error) {
    console.error('❌ Erreur lors de la récupération:', error);
    break;
  }

  if (!batch || batch.length === 0) {
    hasMore = false;
    break;
  }

  // Filtrer celles avec categories vide
  const badOnes = batch.filter(b => !b.categories || b.categories.length === 0);
  allBadBusinesses = allBadBusinesses.concat(badOnes);

  console.log(`   Page ${page + 1}: ${badOnes.length} entreprises mal catégorisées trouvées (sur ${batch.length})`);

  page++;

  // Limite de sécurité
  if (page > 200) {
    console.log('⚠️  Limite de pages atteinte (200 pages = 200k entreprises)');
    break;
  }
}

console.log(`\n✅ Total trouvé: ${allBadBusinesses.length} entreprises mal catégorisées\n`);

if (allBadBusinesses.length === 0) {
  console.log('✅ Aucune entreprise à nettoyer!');
  process.exit(0);
}

// 2. Afficher un échantillon
console.log('📋 ÉCHANTILLON (10 premiers):\n');
allBadBusinesses.slice(0, 10).forEach((biz, i) => {
  console.log(`${i + 1}. NEQ ${biz.neq}: ${biz.name}`);
  console.log(`   act_econ_code: ${biz.act_econ_code || 'NULL'}`);
  console.log(`   main_category_id: ${biz.main_category_id}`);
  console.log(`   categories: []`);
  console.log('');
});

console.log('═'.repeat(80));
console.log(`\n⚠️  ATTENTION: Vous allez réinitialiser main_category_id à NULL pour ${allBadBusinesses.length} entreprises`);
console.log('   Cela inclut le NEQ 8880410194 (Office d\'habitation)\n');

// 3. Exécuter le nettoyage par batch
console.log('🚀 Début du nettoyage...\n');

let updated = 0;
let errors = 0;

for (let i = 0; i < allBadBusinesses.length; i += UPDATE_BATCH_SIZE) {
  const batch = allBadBusinesses.slice(i, i + UPDATE_BATCH_SIZE);
  const ids = batch.map(b => b.id);

  const { error } = await supabase
    .from('businesses')
    .update({ main_category_id: null })
    .in('id', ids);

  if (error) {
    console.error(`❌ Erreur batch ${Math.floor(i / UPDATE_BATCH_SIZE) + 1}:`, error);
    errors++;
  } else {
    updated += batch.length;
    const progress = ((i + batch.length) / allBadBusinesses.length * 100).toFixed(1);
    console.log(`   ✓ Batch ${Math.floor(i / UPDATE_BATCH_SIZE) + 1}: ${batch.length} entreprises nettoyées (${progress}%)`);
  }
}

console.log('\n' + '═'.repeat(80));
console.log('\n✅ NETTOYAGE TERMINÉ\n');
console.log(`   Entreprises nettoyées: ${updated}`);
console.log(`   Erreurs: ${errors}`);
console.log('\n💡 Ces entreprises n\'apparaîtront plus dans les résultats de recherche par catégorie');
console.log('   car elles n\'ont PAS de vraie catégorisation (categories=[])');
