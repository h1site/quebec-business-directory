import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  ASSIGNMENT DES CATÉGORIES EN BATCH\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Récupérer toutes les entreprises avec ACT_ECON mais sans catégorie
console.log('📥 Chargement des entreprises avec ACT_ECON...\n');

const BATCH_SIZE = 1000;
let offset = 0;
let totalProcessed = 0;
let totalUpdated = 0;

while (true) {
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, act_econ_code')
    .not('act_econ_code', 'is', null)
    .is('category', null)
    .range(offset, offset + BATCH_SIZE - 1);

  if (error) {
    console.error('❌ Erreur:', error.message);
    break;
  }

  if (!businesses || businesses.length === 0) {
    console.log('\n✅ Toutes les entreprises ont été traitées!\n');
    break;
  }

  console.log(`📊 Traitement batch ${Math.floor(offset / BATCH_SIZE) + 1} - ${businesses.length} entreprises...`);

  // Pour chaque entreprise, récupérer la catégorie depuis le mapping
  for (const business of businesses) {
    // Récupérer le mapping
    const { data: mapping } = await supabase
      .from('act_econ_category_mappings')
      .select('main_category_id, sub_category_id')
      .eq('act_econ_code', business.act_econ_code)
      .order('confidence_score', { ascending: false })
      .limit(1)
      .single();

    if (mapping && mapping.main_category_id) {
      // Récupérer le slug de la catégorie
      const { data: category } = await supabase
        .from('categories')
        .select('slug')
        .eq('id', mapping.main_category_id)
        .single();

      if (category) {
        // Mettre à jour l'entreprise
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            category: category.slug,
            sub_category: mapping.sub_category_id
          })
          .eq('id', business.id);

        if (!updateError) {
          totalUpdated++;
          if (totalUpdated % 100 === 0) {
            console.log(`   ✅ ${totalUpdated} entreprises mises à jour...`);
          }
        }
      }
    }

    totalProcessed++;
  }

  offset += BATCH_SIZE;
}

console.log('═══════════════════════════════════════════════════════════');
console.log(`✅ Traitement terminé!`);
console.log(`   Entreprises traitées: ${totalProcessed}`);
console.log(`   Entreprises mises à jour: ${totalUpdated}`);
console.log('═══════════════════════════════════════════════════════════\n');
