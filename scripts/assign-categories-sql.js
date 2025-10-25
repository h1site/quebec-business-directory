import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  ASSIGNMENT DES CATÉGORIES EN MASSE (SQL Direct)\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🚀 Mise à jour des catégories pour toutes les entreprises avec ACT_ECON...\n');

// Utiliser une requête UPDATE avec JOIN
const updateQuery = `
  UPDATE businesses b
  SET
    category = c.slug,
    sub_category = m.sub_category_id
  FROM act_econ_category_mappings m
  JOIN categories c ON c.id = m.main_category_id
  WHERE
    b.act_econ_code = m.act_econ_code
    AND b.category IS NULL
    AND m.confidence_score >= 0.5
  RETURNING b.id;
`;

console.log('Exécution de la requête UPDATE...\n');
console.log('⏳ Cela peut prendre quelques secondes...\n');

try {
  // Utiliser le client SQL directement via rpc
  const { data, error } = await supabase.rpc('exec_sql', { query: updateQuery });

  if (error) {
    // Si la fonction n'existe pas, faire une approche alternative
    console.log('💡 Approche alternative: mise à jour par batches...\n');

    // Récupérer tous les mappings
    const { data: mappings } = await supabase
      .from('act_econ_category_mappings')
      .select(`
        act_econ_code,
        main_category_id,
        sub_category_id,
        categories:main_category_id (slug)
      `)
      .gte('confidence_score', 0.5);

    if (!mappings) {
      console.error('❌ Impossible de charger les mappings');
      process.exit(1);
    }

    console.log(`📊 ${mappings.length} mappings chargés\n`);

    let updated = 0;
    const BATCH_SIZE = 50;

    // Traiter par batch
    for (let i = 0; i < mappings.length; i += BATCH_SIZE) {
      const batch = mappings.slice(i, i + BATCH_SIZE);

      // Pour chaque mapping dans le batch
      for (const mapping of batch) {
        if (mapping.categories) {
          const { error: updateError } = await supabase
            .from('businesses')
            .update({
              category: mapping.categories.slug,
              sub_category: mapping.sub_category_id
            })
            .eq('act_econ_code', mapping.act_econ_code)
            .is('category', null);

          if (!updateError) {
            updated++;
            if (updated % 100 === 0) {
              console.log(`   ✅ ${updated} codes ACT_ECON traités...`);
            }
          }
        }
      }
    }

    console.log(`\n✅ Traitement terminé! ${updated} codes ACT_ECON traités\n`);
  } else {
    console.log('✅ Mise à jour terminée via SQL direct!\n');
  }
} catch (err) {
  console.error('❌ Erreur:', err.message);
}

// Vérifier les résultats
console.log('🔍 Vérification des statistiques...\n');

const { count: withCategory } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .not('category', 'is', null);

const { count: withActEcon } = await supabase
  .from('businesses')
  .select('*', { count: 'exact', head: true })
  .not('act_econ_code', 'is', null);

console.log('═══════════════════════════════════════════════════════════');
console.log(`Entreprises avec ACT_ECON: ${withActEcon?.toLocaleString() || 0}`);
console.log(`Entreprises avec catégorie: ${withCategory?.toLocaleString() || 0}`);
console.log(`Taux d'assignment: ${((withCategory / withActEcon) * 100).toFixed(1)}%`);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✅ Terminé!\n');
