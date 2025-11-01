/**
 * Réinitialiser main_category_id à NULL pour TOUTES les entreprises
 * avec act_econ_code = NULL (pas de code d'activité économique)
 *
 * Fait en batch pour éviter les timeouts Supabase
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

const BATCH_SIZE = 100; // Petit batch pour éviter timeout

console.log('🧹 RÉINITIALISATION act_econ_code=NULL → main_category_id=NULL\n');
console.log('═'.repeat(80));

// 1. Compter combien d'entreprises au total avec act_econ_code NULL
const { count: totalNull } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .is('act_econ_code', null);

console.log(`\n📊 Total entreprises avec act_econ_code=NULL: ${totalNull?.toLocaleString()}`);

// 2. Compter combien ont aussi main_category_id assigné (à nettoyer)
const { count: totalToClean } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .is('act_econ_code', null)
  .not('main_category_id', 'is', null);

console.log(`📊 Entreprises à nettoyer (avec main_category_id): ${totalToClean?.toLocaleString()}`);

if (!totalToClean || totalToClean === 0) {
  console.log('\n✅ Aucune entreprise à nettoyer!');
  console.log('   Toutes les entreprises avec act_econ_code=NULL ont déjà main_category_id=NULL');
  process.exit(0);
}

console.log('\n🚀 Début du nettoyage par batch de ' + BATCH_SIZE + '...\n');

let totalCleaned = 0;
let passNumber = 1;
let hasMore = true;

while (hasMore) {
  // Récupérer un batch d'IDs
  const { data: batch, error: fetchError } = await supabase
    .from('businesses')
    .select('id, neq, name, act_econ_code')
    .is('act_econ_code', null)
    .not('main_category_id', 'is', null)
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('❌ Erreur récupération:', fetchError);
    break;
  }

  if (!batch || batch.length === 0) {
    hasMore = false;
    break;
  }

  // Afficher échantillon première fois
  if (passNumber === 1) {
    console.log('📋 Échantillon (5 premiers):');
    batch.slice(0, 5).forEach((biz, i) => {
      console.log(`   ${i + 1}. NEQ ${biz.neq}: ${biz.name?.substring(0, 50)}`);
      console.log(`      act_econ_code: ${biz.act_econ_code || 'NULL'}`);
    });
    console.log('');
  }

  // Update en batch
  const ids = batch.map(b => b.id);

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ main_category_id: null })
    .in('id', ids);

  if (updateError) {
    console.error(`❌ Erreur update batch ${passNumber}:`, updateError);
    break;
  }

  totalCleaned += batch.length;
  const progress = Math.round((totalCleaned / totalToClean) * 100);

  console.log(`✓ Batch ${passNumber}: ${batch.length} entreprises nettoyées | Total: ${totalCleaned.toLocaleString()}/${totalToClean.toLocaleString()} (${progress}%)`);

  passNumber++;

  // Limite de sécurité
  if (passNumber > 10000) {
    console.log('⚠️  Limite de 10000 passes atteinte');
    break;
  }

  // Petit délai pour ne pas surcharger Supabase
  if (passNumber % 10 === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

console.log('\n' + '═'.repeat(80));
console.log('\n🎉 NETTOYAGE TERMINÉ\n');
console.log(`   Entreprises nettoyées: ${totalCleaned.toLocaleString()}`);
console.log(`   Nombre de batches: ${passNumber - 1}`);

// Vérification finale
console.log('\n📊 VÉRIFICATION FINALE...\n');

const { count: remaining } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .is('act_econ_code', null)
  .not('main_category_id', 'is', null);

if (remaining === 0) {
  console.log('✅ PARFAIT! Toutes les entreprises avec act_econ_code=NULL ont main_category_id=NULL');
} else {
  console.log(`⚠️  Il reste encore ${remaining?.toLocaleString()} entreprises à nettoyer`);
  console.log('   Relancer le script pour continuer...');
}

console.log('\n💡 Les entreprises sans code act_econ n\'apparaîtront plus dans les catégories');
