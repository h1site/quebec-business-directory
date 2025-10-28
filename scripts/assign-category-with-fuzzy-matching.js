import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BATCH_SIZE = 1000;

// Catégorie par défaut "Autre" pour les codes invalides
const DEFAULT_CATEGORY_ID = 'f8d2e3f4-6789-4abc-def0-123456789abc'; // À ajuster avec le vrai UUID de "Autre"

async function assignCategoriesWithFuzzyMatching() {
  console.log('🎯 Attribution des catégories avec matching fuzzy\n');
  console.log('='.repeat(80));

  // 1. Charger tous les mappings
  console.log('\n1️⃣ Chargement des mappings ACT_ECON...\n');

  const { data: mappings, error: mappingError } = await supabase
    .from('act_econ_to_main_category')
    .select('act_econ_code, main_category_id');

  if (mappingError || !mappings) {
    console.error('❌ Erreur lors du chargement des mappings:', mappingError);
    return;
  }

  console.log(`✅ ${mappings.length} mappings chargés`);

  // Créer un Map pour accès rapide
  const mappingMap = new Map();
  mappings.forEach(m => {
    mappingMap.set(m.act_econ_code, m.main_category_id);
  });

  // 2. Obtenir la catégorie "Autre" pour les codes invalides
  console.log('\n2️⃣ Recherche de la catégorie "Autre"...\n');

  const { data: autreCategory } = await supabase
    .from('main_categories')
    .select('id, name_fr')
    .ilike('name_fr', '%autre%')
    .limit(1)
    .single();

  const autreCategoryId = autreCategory?.id;
  console.log(`✅ Catégorie "Autre": ${autreCategory?.name_fr} (${autreCategoryId})`);

  // 3. Compter les entreprises sans catégorie
  console.log('\n3️⃣ Comptage des entreprises à traiter...\n');

  const { count: totalToProcess } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('main_category_id', null)
    .not('act_econ_code', 'is', null);

  console.log(`📊 ${totalToProcess.toLocaleString()} entreprises à traiter`);
  console.log(`   Taille du batch: ${BATCH_SIZE}`);
  console.log(`   Batches estimés: ${Math.ceil(totalToProcess / BATCH_SIZE)}\n`);

  // 4. Traiter par batches
  let processed = 0;
  let updated = 0;
  let assignedToAutre = 0;
  let roundedCodes = 0;

  while (processed < totalToProcess) {
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, act_econ_code')
      .is('main_category_id', null)
      .not('act_econ_code', 'is', null)
      .range(0, BATCH_SIZE - 1);

    if (fetchError || !businesses || businesses.length === 0) {
      break;
    }

    const updates = [];

    for (const biz of businesses) {
      let categoryId = null;
      let code = biz.act_econ_code;

      // Stratégie 1: Match exact
      if (mappingMap.has(code)) {
        categoryId = mappingMap.get(code);
      }
      // Stratégie 2: Code invalide "0001" → Autre
      else if (code === '0001') {
        categoryId = autreCategoryId;
        assignedToAutre++;
      }
      // Stratégie 3: Arrondir au code parent (7771 → 7700)
      else if (code.length === 4) {
        const parentCode = code.substring(0, 2) + '00';
        if (mappingMap.has(parentCode)) {
          categoryId = mappingMap.get(parentCode);
          roundedCodes++;
        } else {
          // Si même le parent n'existe pas, assigner à "Autre"
          categoryId = autreCategoryId;
          assignedToAutre++;
        }
      }

      if (categoryId) {
        updates.push({
          id: biz.id,
          main_category_id: categoryId
        });
      }
    }

    // Mise à jour par lot
    if (updates.length > 0) {
      for (let i = 0; i < updates.length; i += 100) {
        const chunk = updates.slice(i, i + 100);
        const ids = chunk.map(u => u.id);
        const categoryId = chunk[0].main_category_id;

        const { error: updateError } = await supabase
          .from('businesses')
          .update({ main_category_id: categoryId })
          .in('id', ids);

        if (!updateError) {
          updated += chunk.length;
        }
      }
    }

    processed += businesses.length;

    const progress = ((processed / totalToProcess) * 100).toFixed(1);
    console.log(`📊 Progrès: ${processed.toLocaleString()}/${totalToProcess.toLocaleString()} (${progress}%)`);
    console.log(`   ✅ Mis à jour: ${updated.toLocaleString()}`);
    console.log(`   🔄 Codes arrondis: ${roundedCodes.toLocaleString()}`);
    console.log(`   📝 Assignés à "Autre": ${assignedToAutre.toLocaleString()}\n`);

    // Pause pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TERMINÉ!\n');
  console.log(`📊 Résultat final:`);
  console.log(`   Traité: ${processed.toLocaleString()} entreprises`);
  console.log(`   Mis à jour: ${updated.toLocaleString()} entreprises`);
  console.log(`   Codes arrondis au parent: ${roundedCodes.toLocaleString()}`);
  console.log(`   Assignés à "Autre": ${assignedToAutre.toLocaleString()}`);
}

assignCategoriesWithFuzzyMatching().catch(console.error);
