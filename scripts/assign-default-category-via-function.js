#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Catégorie par défaut: "Services professionnels"
const DEFAULT_CATEGORY_ID = '944753c0-0ebf-4d74-9168-268fab04fc0d';
const BATCH_SIZE = 5000;

async function assignDefaultCategoryViaFunction() {
  console.log('🚀 Assignment de la catégorie par défaut via fonction SQL...\n');
  console.log(`📦 Taille des batches: ${BATCH_SIZE.toLocaleString()}\n`);

  try {
    let totalUpdated = 0;
    let batchNumber = 0;

    while (true) {
      batchNumber++;
      console.log(`\n📦 Batch ${batchNumber}...`);

      // Appeler la fonction SQL qui met à jour un batch
      const { data, error } = await supabase.rpc('update_categories_batch', {
        category_id: DEFAULT_CATEGORY_ID,
        batch_size: BATCH_SIZE
      });

      if (error) {
        console.error('❌ Erreur:', error);
        console.log('\n⚠️  Assurez-vous que la fonction SQL a été créée dans Supabase!');
        console.log('   Exécutez: supabase/update_categories_batch_function.sql');
        break;
      }

      const updated = data || 0;
      totalUpdated += updated;

      console.log(`   ✅ ${updated.toLocaleString()} businesses mises à jour`);
      console.log(`   📊 Total cumulatif: ${totalUpdated.toLocaleString()}`);

      // Si moins que le batch size, on a fini
      if (updated < BATCH_SIZE) {
        console.log('\n✅ Plus de businesses sans catégories!');
        break;
      }

      // Petite pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n\n🎉 TERMINÉ!');
    console.log(`📊 Total businesses mises à jour: ${totalUpdated.toLocaleString()}`);
    console.log(`📊 Batches traités: ${batchNumber}`);

    // Vérification finale
    console.log('\n🔍 Vérification finale...');

    const { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true });

    const { count: withoutCategories } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .or('categories.is.null,categories.eq.{}');

    const withCategories = totalBusinesses - withoutCategories;

    console.log(`\n🎯 Résumé final:`);
    console.log(`   Total businesses: ${totalBusinesses?.toLocaleString()}`);
    console.log(`   Avec catégories: ${withCategories?.toLocaleString()}`);
    console.log(`   Sans catégories: ${withoutCategories?.toLocaleString()}`);
    console.log(`   Pourcentage: ${((withCategories / totalBusinesses) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

assignDefaultCategoryViaFunction();
