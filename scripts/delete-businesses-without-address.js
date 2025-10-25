#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function deleteBusinessesWithoutAddress() {
  console.log('🗑️  Suppression des businesses SANS adresse...\n');

  try {
    const BATCH_SIZE = 1000;
    let totalDeleted = 0;
    let batchNumber = 0;

    // Comptage initial
    const { count: totalWithoutAddress } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .or('address.is.null,city.is.null,address.eq.,city.eq.');

    console.log(`📊 Total businesses sans adresse: ${totalWithoutAddress?.toLocaleString()}\n`);

    while (true) {
      batchNumber++;
      console.log(`\n🗑️  Batch ${batchNumber}...`);

      // Récupérer un batch d'IDs de businesses sans adresse
      const { data: businessesToDelete, error: fetchError } = await supabase
        .from('businesses')
        .select('id')
        .or('address.is.null,city.is.null,address.eq.,city.eq.')
        .limit(BATCH_SIZE);

      if (fetchError) {
        console.error('❌ Erreur:', fetchError);
        break;
      }

      if (!businessesToDelete || businessesToDelete.length === 0) {
        console.log('\n✅ Plus de businesses à supprimer!');
        break;
      }

      console.log(`   Trouvé ${businessesToDelete.length} businesses à supprimer`);

      // Supprimer ce batch
      const ids = businessesToDelete.map(b => b.id);
      const { error: deleteError } = await supabase
        .from('businesses')
        .delete()
        .in('id', ids);

      if (deleteError) {
        console.error('❌ Erreur lors de la suppression:', deleteError);
        break;
      }

      totalDeleted += businessesToDelete.length;
      console.log(`   ✅ ${businessesToDelete.length.toLocaleString()} businesses supprimées`);
      console.log(`   📊 Total supprimé: ${totalDeleted.toLocaleString()}`);

      // Si moins que BATCH_SIZE, on a fini
      if (businessesToDelete.length < BATCH_SIZE) {
        break;
      }

      // Petite pause
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n\n🎉 TERMINÉ!');
    console.log(`📊 Total businesses supprimées: ${totalDeleted.toLocaleString()}`);

    // Vérification finale
    const { count: remaining } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true });

    const { count: withAddress } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('address', 'is', null)
      .not('city', 'is', null);

    console.log(`\n🎯 Résumé final:`);
    console.log(`   Total businesses restantes: ${remaining?.toLocaleString()}`);
    console.log(`   Avec adresse: ${withAddress?.toLocaleString()}`);
    console.log(`   Pourcentage: ${((withAddress / remaining) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

deleteBusinessesWithoutAddress();
