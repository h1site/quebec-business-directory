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

async function assignDefaultCategory() {
  console.log('🚀 Assignment de la catégorie par défaut aux businesses sans catégorie...\n');

  try {
    const BATCH_SIZE = 1000;
    let totalUpdated = 0;
    let offset = 0;

    while (true) {
      console.log(`\n📦 Batch ${Math.floor(offset / BATCH_SIZE) + 1} (offset: ${offset.toLocaleString()})...`);

      // Récupérer un batch de businesses sans catégories
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select('id')
        .or('categories.is.null,categories.eq.{}')
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError) {
        console.error('❌ Erreur lors de la récupération:', fetchError);
        break;
      }

      if (!businesses || businesses.length === 0) {
        console.log('\n✅ Plus de businesses à traiter!');
        break;
      }

      console.log(`   Trouvé ${businesses.length} businesses sans catégorie`);

      // Mettre à jour ce batch
      const ids = businesses.map(b => b.id);
      const { error: updateError, data } = await supabase
        .from('businesses')
        .update({ categories: [DEFAULT_CATEGORY_ID] })
        .in('id', ids)
        .select('id');

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError);
        offset += BATCH_SIZE;
        continue;
      }

      const count = data?.length || 0;
      totalUpdated += count;
      console.log(`   ✅ ${count.toLocaleString()} businesses mises à jour`);
      console.log(`   📊 Total: ${totalUpdated.toLocaleString()} businesses`);

      // Si on a moins que BATCH_SIZE, on a fini
      if (businesses.length < BATCH_SIZE) {
        console.log('\n✅ Dernier batch traité!');
        break;
      }

      offset += BATCH_SIZE;

      // Pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n\n✅ TERMINÉ!');
    console.log(`📊 Total businesses mises à jour: ${totalUpdated.toLocaleString()}`);

    // Vérification finale
    const { count: totalWithCategories } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('categories', 'is', null)
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

assignDefaultCategory();
