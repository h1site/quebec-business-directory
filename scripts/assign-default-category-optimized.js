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

async function assignDefaultCategoryOptimized() {
  console.log('🚀 Assignment de la catégorie par défaut (version optimisée)...\n');

  try {
    const BATCH_SIZE = 10000; // Plus gros batch
    let totalUpdated = 0;
    let batchNumber = 0;

    while (true) {
      batchNumber++;
      console.log(`\n📦 Batch ${batchNumber} (${BATCH_SIZE.toLocaleString()} businesses max)...`);

      // Utiliser RPC pour faire un UPDATE SQL direct
      const { data, error } = await supabase.rpc('update_categories_batch', {
        category_id: DEFAULT_CATEGORY_ID,
        batch_size: BATCH_SIZE
      });

      if (error) {
        // Si la fonction n'existe pas, utiliser une approche alternative
        console.log('⚠️  Fonction RPC non disponible, utilisation méthode alternative...');

        // Méthode alternative: UPDATE simple avec LIMIT via une sous-requête
        const { count, error: altError } = await supabase
          .from('businesses')
          .update({ categories: [DEFAULT_CATEGORY_ID] })
          .or('categories.is.null,categories.eq.{}')
          .limit(BATCH_SIZE);

        if (altError) {
          console.error('❌ Erreur:', altError);
          break;
        }

        const updated = count || 0;
        totalUpdated += updated;
        console.log(`   ✅ ${updated.toLocaleString()} businesses mises à jour`);
        console.log(`   📊 Total: ${totalUpdated.toLocaleString()}`);

        if (updated < BATCH_SIZE) {
          console.log('\n✅ Plus de businesses à traiter!');
          break;
        }
      } else {
        const updated = data || 0;
        totalUpdated += updated;
        console.log(`   ✅ ${updated.toLocaleString()} businesses mises à jour`);
        console.log(`   📊 Total: ${totalUpdated.toLocaleString()}`);

        if (updated === 0) {
          console.log('\n✅ Plus de businesses à traiter!');
          break;
        }
      }

      // Pause courte entre les batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n\n🎉 TERMINÉ!');
    console.log(`📊 Total businesses mises à jour: ${totalUpdated.toLocaleString()}`);

    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    const { count: totalWithCategories } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('categories', 'is', null')
      .neq('categories', '[]');

    const { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true });

    console.log(`\n🎯 Résumé final:`);
    console.log(`   Total businesses: ${totalBusinesses?.toLocaleString()}`);
    console.log(`   Avec catégories: ${totalWithCategories?.toLocaleString()}`);
    console.log(`   Pourcentage: ${((totalWithCategories / totalBusinesses) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

assignDefaultCategoryOptimized();
