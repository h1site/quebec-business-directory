/**
 * Migration: Ajouter main_category_slug à la table businesses
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 MIGRATION: Ajouter main_category_slug à businesses');
console.log('═'.repeat(60));

async function runMigration() {
  try {
    // 1. Ajouter la colonne (si elle n'existe pas déjà)
    console.log('1️⃣  Vérification de la colonne main_category_slug...');

    // Note: Supabase ne permet pas d'exécuter ALTER TABLE directement via l'API
    // Il faut utiliser le SQL Editor ou une fonction RPC
    // Pour l'instant, on va juste mettre à jour les données

    // 2. Mettre à jour tous les businesses avec leur main_category_slug
    console.log('2️⃣  Mise à jour des main_category_slug...');

    const BATCH_SIZE = 500;
    let offset = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    while (true) {
      // Récupérer un lot de businesses
      const { data: businesses, error: fetchError } = await supabase
        .from('businesses')
        .select(`
          id,
          main_category_slug,
          business_categories!inner (
            is_primary,
            sub_categories!inner (
              main_categories!inner (
                slug
              )
            )
          )
        `)
        .eq('business_categories.is_primary', true)
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchError) {
        console.error(`   ❌ Erreur de récupération: ${fetchError.message}`);
        break;
      }

      if (!businesses || businesses.length === 0) {
        break;
      }

      // Mettre à jour chaque business
      for (const biz of businesses) {
        const categorySlug = biz.business_categories?.[0]?.sub_categories?.main_categories?.slug;

        if (!categorySlug) {
          console.log(`   ⚠️  Business ${biz.id}: pas de catégorie trouvée`);
          totalSkipped++;
          continue;
        }

        // Skip si déjà à jour
        if (biz.main_category_slug === categorySlug) {
          totalSkipped++;
          continue;
        }

        // Mettre à jour
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ main_category_slug: categorySlug })
          .eq('id', biz.id);

        if (updateError) {
          console.error(`   ❌ Erreur de mise à jour pour ${biz.id}: ${updateError.message}`);
        } else {
          totalUpdated++;
        }
      }

      console.log(`   ✅ Traité ${offset + businesses.length} businesses (${totalUpdated} mis à jour, ${totalSkipped} ignorés)`);

      if (businesses.length < BATCH_SIZE) {
        break;
      }

      offset += BATCH_SIZE;
    }

    console.log('');
    console.log('✅ MIGRATION TERMINÉE!');
    console.log('═'.repeat(60));
    console.log(`📊 Businesses mis à jour: ${totalUpdated}`);
    console.log(`⏭️  Businesses ignorés: ${totalSkipped}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Erreur durant la migration:', error);
    process.exit(1);
  }
}

runMigration();
