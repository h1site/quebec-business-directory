/**
 * Script pour assigner automatiquement les catégories aux entreprises
 * basées sur leur code SCIAN
 *
 * UTILISATION:
 * node scripts/assign-categories-from-scian.js
 *
 * OPTIONS:
 * --limit=1000    Limiter à 1000 entreprises
 * --dry-run       Afficher les assignations sans les créer
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments en ligne de commande
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10000;
const dryRun = args.includes('--dry-run');

console.log('🏷️  Assignment automatique des catégories basées sur SCIAN');
console.log('📊 Configuration:', { limit, dryRun });
console.log('');

/**
 * Trouver la catégorie basée sur le code SCIAN
 */
async function findCategoryByScian(scianCode) {
  if (!scianCode) {
    return { main_category_id: null, sub_category_id: null, confidence: 0, scian_matched: null };
  }

  // Nettoyer le code SCIAN (retirer espaces, tirets, etc.)
  const cleanCode = scianCode.toString().replace(/[^0-9]/g, '');

  // Chercher mapping exact en commençant par le code le plus précis
  for (let digits = cleanCode.length; digits >= 2; digits--) {
    const code = cleanCode.substring(0, digits);

    const { data, error } = await supabase
      .from('scian_category_mapping')
      .select('scian_code, description_fr, main_category_id, sub_category_id, confidence_level')
      .eq('scian_code', code)
      .order('confidence_level', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      return {
        main_category_id: data.main_category_id,
        sub_category_id: data.sub_category_id,
        confidence: data.confidence_level,
        scian_matched: code,
        description_fr: data.description_fr
      };
    }
  }

  return { main_category_id: null, sub_category_id: null, confidence: 0, scian_matched: null };
}

/**
 * Assigner les catégories
 */
async function assignCategories() {
  console.log('🔍 Recherche des entreprises sans catégorie avec code SCIAN...');

  // Trouver toutes les entreprises avec SCIAN mais sans catégorie assignée
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, scian_code, city')
    .eq('data_source', 'req')
    .not('scian_code', 'is', null)
    .limit(limit);

  if (error) {
    console.error('❌ Erreur lors de la récupération des entreprises:', error);
    return;
  }

  console.log(`✅ Trouvé ${businesses.length} entreprises avec code SCIAN`);
  console.log('');

  let assigned = 0;
  let notFound = 0;
  let alreadyAssigned = 0;
  const batchSize = 50;
  let batch = [];

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];

    // Vérifier si déjà une catégorie assignée
    const { data: existing } = await supabase
      .from('business_categories')
      .select('id')
      .eq('business_id', biz.id)
      .limit(1)
      .single();

    if (existing) {
      alreadyAssigned++;
      continue;
    }

    // Trouver catégorie via SCIAN
    const category = await findCategoryByScian(biz.scian_code);

    // Si on a une main_category_id, trouver une sous-catégorie par défaut
    if (category.main_category_id && !category.sub_category_id) {
      const { data: defaultSub } = await supabase
        .from('sub_categories')
        .select('id')
        .eq('main_category_id', category.main_category_id)
        .limit(1)
        .single();

      if (defaultSub) {
        category.sub_category_id = defaultSub.id;
      }
    }

    if (category.sub_category_id) {
      if (dryRun) {
        console.log(`🔍 [DRY-RUN] ${biz.name} (${biz.city})`);
        console.log(`   SCIAN: ${biz.scian_code} → ${category.scian_matched} (${category.description_fr})`);
        console.log(`   Confidence: ${category.confidence}%`);
        console.log('');
      } else {
        batch.push({
          business_id: biz.id,
          sub_category_id: category.sub_category_id,
          is_primary: true
        });
      }

      assigned++;
    } else {
      notFound++;

      if (i < 10) { // Log premiers cas non trouvés
        console.log(`⚠️  Pas de mapping pour SCIAN ${biz.scian_code}: ${biz.name}`);
      }
    }

    // Insérer par batch
    if (batch.length >= batchSize) {
      const { error: insertError } = await supabase
        .from('business_categories')
        .insert(batch);

      if (insertError) {
        console.error('❌ Erreur insertion batch:', insertError.message);
      } else {
        console.log(`✅ Assigné ${assigned} catégories (${Math.round(assigned/businesses.length*100)}%)`);
      }

      batch = [];
    }

    // Log progression
    if ((i + 1) % 500 === 0) {
      console.log(`📊 Progression: ${i + 1}/${businesses.length}`);
    }
  }

  // Insérer dernier batch
  if (batch.length > 0 && !dryRun) {
    await supabase.from('business_categories').insert(batch);
  }

  console.log('');
  console.log('✅ Assignment terminé!');
  console.log('═'.repeat(50));
  console.log(`📊 Statistiques:`);
  console.log(`   Total traité:           ${businesses.length}`);
  console.log(`   Catégories assignées:   ${assigned} (${Math.round(assigned/businesses.length*100)}%)`);
  console.log(`   Déjà assignées:         ${alreadyAssigned}`);
  console.log(`   SCIAN non mappé:        ${notFound} (${Math.round(notFound/businesses.length*100)}%)`);
  console.log('═'.repeat(50));
  console.log('');

  if (notFound > 0) {
    console.log('💡 Conseil: Ajoutez plus de mappings SCIAN dans migration_add_req_import_support.sql');
    console.log('   pour améliorer le taux de catégorisation automatique.');
  }
}

// Exécuter
assignCategories()
  .then(() => {
    console.log('🎉 Script terminé avec succès!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
