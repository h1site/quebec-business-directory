#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function assignCategoriesOneByOne() {
  console.log('🚀 Démarrage de l\'assignment des catégories (un code à la fois)...\n');

  try {
    // 1. Récupérer tous les mappings ACT_ECON
    const { data: mappings, error: mappingsError } = await supabase
      .from('act_econ_category_mappings')
      .select('act_econ_code, main_category_id, sub_category_id')
      .gte('confidence_score', 0.5)
      .order('act_econ_code');

    if (mappingsError) {
      console.error('❌ Erreur lors de la récupération des mappings:', mappingsError);
      return;
    }

    console.log(`📋 Trouvé ${mappings.length} codes ACT_ECON à traiter\n`);

    let totalUpdated = 0;
    let processedCodes = 0;

    // 2. Traiter chaque code ACT_ECON individuellement
    for (const mapping of mappings) {
      const { act_econ_code, main_category_id, sub_category_id } = mapping;

      // Construire l'array de catégories
      const categories = sub_category_id
        ? [main_category_id, sub_category_id]
        : [main_category_id];

      // Convertir le code en integer (enlever les zéros au début)
      const codeAsInt = parseInt(act_econ_code, 10);

      // Mettre à jour toutes les businesses avec ce code ACT_ECON
      const { error: updateError, data } = await supabase
        .from('businesses')
        .update({ categories })
        .eq('act_econ_code', codeAsInt)
        .select('id');

      if (updateError) {
        console.error(`❌ Erreur pour code ${act_econ_code}:`, updateError.message);
        continue;
      }

      if (data && data.length > 0) {
        totalUpdated += data.length;
      }

      processedCodes++;

      // Log progress tous les 50 codes
      if (processedCodes % 50 === 0) {
        console.log(`⏳ Traité ${processedCodes}/${mappings.length} codes | ${totalUpdated.toLocaleString()} businesses mises à jour`);
      }
    }

    console.log('\n✅ TERMINÉ!');
    console.log(`📊 Codes ACT_ECON traités: ${processedCodes}`);
    console.log(`📊 Businesses mises à jour: ${totalUpdated.toLocaleString()}`);

    // 3. Vérification finale
    const { count: totalWithCategories } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('act_econ_code', 'is', null)
      .not('categories', 'is', null);

    console.log(`\n🎯 Vérification: ${totalWithCategories?.toLocaleString()} businesses ont maintenant des catégories`);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

assignCategoriesOneByOne();
