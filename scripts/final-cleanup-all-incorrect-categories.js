/**
 * NETTOYAGE FINAL ET COMPLET
 *
 * Réinitialise main_category_id à NULL pour TOUTES les entreprises qui ont:
 * - main_category_id assigné (non NULL)
 * - MAIS categories = [] (vide)
 *
 * Règle: Si une entreprise n'a PAS de vraie catégorisation (categories=[]),
 * elle ne devrait PAS avoir de main_category_id assigné.
 *
 * Cela empêche les entreprises non pertinentes d'apparaître dans les recherches par catégorie.
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

const BATCH_SIZE = 50; // Petit batch pour éviter les timeouts

console.log('🧹 NETTOYAGE FINAL - TOUTES CATÉGORISATIONS INCORRECTES\n');
console.log('═'.repeat(80));
console.log('\n⚠️  CE SCRIPT VA:');
console.log('   1. Trouver TOUTES les entreprises avec main_category_id assigné');
console.log('   2. Réinitialiser à NULL si categories=[]');
console.log('   3. Tourner jusqu\'à ce qu\'il n\'y ait plus rien à nettoyer\n');
console.log('═'.repeat(80));

let totalCleaned = 0;
let passNumber = 1;
let foundProblems = true;

while (foundProblems) {
  console.log(`\n🔄 PASSE #${passNumber}\n`);

  // Récupérer un batch d'entreprises avec main_category_id
  const { data: batch, error } = await supabase
    .from('businesses')
    .select('id, neq, name, main_category_id, categories, act_econ_code')
    .not('main_category_id', 'is', null)
    .limit(1000);

  if (error) {
    console.error('❌ Erreur récupération:', error);
    break;
  }

  if (!batch || batch.length === 0) {
    console.log('✅ Aucune entreprise avec main_category_id trouvée');
    foundProblems = false;
    break;
  }

  // Filtrer celles avec categories vide
  const toClean = batch.filter(b => !b.categories || b.categories.length === 0);

  if (toClean.length === 0) {
    console.log('✅ Aucune entreprise mal catégorisée dans ce batch');
    foundProblems = false;
    break;
  }

  console.log(`   Trouvé: ${toClean.length} entreprises à nettoyer (sur ${batch.length})`);

  // Afficher échantillon
  if (passNumber === 1) {
    console.log('\n   📋 Échantillon (5 premiers):');
    toClean.slice(0, 5).forEach((biz, i) => {
      console.log(`   ${i + 1}. NEQ ${biz.neq}: ${biz.name?.substring(0, 50)}`);
      console.log(`      act_econ_code: ${biz.act_econ_code || 'NULL'}`);
    });
    console.log('');
  }

  // Nettoyer par petits batches
  let cleaned = 0;
  for (let i = 0; i < toClean.length; i += BATCH_SIZE) {
    const smallBatch = toClean.slice(i, i + BATCH_SIZE);
    const ids = smallBatch.map(b => b.id);

    const { error: updateError } = await supabase
      .from('businesses')
      .update({ main_category_id: null })
      .in('id', ids);

    if (updateError) {
      console.error(`   ❌ Erreur update batch ${Math.floor(i / BATCH_SIZE) + 1}:`, updateError);
    } else {
      cleaned += smallBatch.length;
      const progress = Math.round((cleaned / toClean.length) * 100);
      process.stdout.write(`\r   Nettoyage: ${cleaned}/${toClean.length} (${progress}%)`);
    }
  }

  console.log(`\n   ✅ Passe #${passNumber}: ${cleaned} entreprises nettoyées\n`);
  totalCleaned += cleaned;
  passNumber++;

  // Limite de sécurité
  if (passNumber > 200) {
    console.log('⚠️  Limite de 200 passes atteinte');
    break;
  }
}

console.log('\n' + '═'.repeat(80));
console.log('\n🎉 NETTOYAGE FINAL TERMINÉ\n');
console.log(`   Total entreprises nettoyées: ${totalCleaned.toLocaleString()}`);
console.log(`   Nombre de passes: ${passNumber - 1}`);

// Vérification finale
console.log('\n📊 VÉRIFICATION FINALE...\n');

const { data: remaining } = await supabase
  .from('businesses')
  .select('id, categories, main_category_id')
  .not('main_category_id', 'is', null)
  .limit(10000);

const stillBad = remaining?.filter(b => !b.categories || b.categories.length === 0).length || 0;

if (stillBad === 0) {
  console.log('✅ PARFAIT! Aucune entreprise mal catégorisée restante!');
} else {
  console.log(`⚠️  Il reste encore ${stillBad.toLocaleString()} entreprises mal catégorisées`);
  console.log('   (probablement dans un batch suivant, relancer le script)');
}

console.log('\n💡 Les entreprises avec categories=[] n\'apparaîtront plus dans les recherches par catégorie');
