/**
 * Met à jour main_category_slug pour toutes les businesses qui ne l'ont pas
 * en utilisant main_category_id pour joindre avec main_categories
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

console.log('🔄 MISE À JOUR DES main_category_slug');
console.log('═'.repeat(60));

// Étape 1: Compter combien de businesses n'ont pas main_category_slug
console.log('\n📊 Analyse de la base de données...');

const { count: nullCount } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .is('main_category_slug', null)
  .not('main_category_id', 'is', null);

console.log(`   ❌ ${nullCount?.toLocaleString()} businesses sans main_category_slug`);

const { count: totalCount } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true });

console.log(`   📈 ${totalCount?.toLocaleString()} businesses au total`);

if (nullCount === 0) {
  console.log('\n✅ Toutes les businesses ont déjà main_category_slug!');
  process.exit(0);
}

// Étape 2: Récupérer toutes les main_categories pour créer un mapping
console.log('\n📋 Chargement des catégories...');

const { data: categories } = await supabase
  .from('main_categories')
  .select('id, slug');

if (!categories || categories.length === 0) {
  console.error('❌ Impossible de charger les catégories!');
  process.exit(1);
}

const categoryMap = new Map();
categories.forEach(cat => {
  categoryMap.set(cat.id, cat.slug);
});

console.log(`   ✅ ${categories.length} catégories chargées`);

// Étape 3: Mettre à jour par lots
console.log('\n🔄 Mise à jour en cours...');

const BATCH_SIZE = 1000;
let updated = 0;
let errors = 0;

for (let offset = 0; offset < nullCount; offset += BATCH_SIZE) {
  try {
    // Récupérer un lot de businesses sans main_category_slug
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, main_category_id')
      .is('main_category_slug', null)
      .not('main_category_id', 'is', null)
      .range(offset, offset + BATCH_SIZE - 1);

    if (fetchError) throw fetchError;
    if (!businesses || businesses.length === 0) break;

    // Mettre à jour chaque business
    for (const biz of businesses) {
      const categorySlug = categoryMap.get(biz.main_category_id);

      if (categorySlug) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ main_category_slug: categorySlug })
          .eq('id', biz.id);

        if (updateError) {
          console.error(`   ❌ Erreur pour business ${biz.id}:`, updateError.message);
          errors++;
        } else {
          updated++;
        }
      }
    }

    process.stdout.write(`\r   Mis à jour: ${updated.toLocaleString()}/${nullCount.toLocaleString()}`);

    // Pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error(`\n   ❌ Erreur batch à offset ${offset}:`, error.message);
    errors++;

    // Si trop d'erreurs, arrêter
    if (errors > 10) {
      console.error('\n❌ Trop d\'erreurs, arrêt du script');
      process.exit(1);
    }
  }
}

console.log('\n');
console.log('═'.repeat(60));
console.log('✅ MISE À JOUR TERMINÉE!');
console.log(`   ✅ ${updated.toLocaleString()} businesses mises à jour`);
if (errors > 0) {
  console.log(`   ⚠️  ${errors} erreurs rencontrées`);
}
console.log('═'.repeat(60));
