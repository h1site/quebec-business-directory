import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🏷️  ASSIGNMENT DES CATÉGORIES - VERSION RAPIDE SQL\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Utiliser une requête SQL directe pour faire le mapping en masse
console.log('🚀 Exécution de la requête SQL d\'assignment en masse...\n');

const { data, error } = await supabase.rpc('assign_categories_from_act_econ');

if (error) {
  console.error('❌ Erreur:', error.message);
  console.log('\n💡 Si la fonction n\'existe pas, créez-la avec cette requête SQL:\n');
  console.log(`
CREATE OR REPLACE FUNCTION assign_categories_from_act_econ()
RETURNS TABLE(updated_count bigint) AS $$
BEGIN
  UPDATE businesses b
  SET
    category = c.slug,
    sub_category = m.sub_category_id,
    updated_at = NOW()
  FROM act_econ_category_mappings m
  JOIN categories c ON c.id = m.main_category_id
  WHERE
    b.act_econ_code = m.act_econ_code
    AND b.category IS NULL
    AND m.confidence_score >= 0.5;

  RETURN QUERY SELECT COUNT(*)::bigint FROM businesses WHERE category IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
  `);
  process.exit(1);
}

console.log('✅ Assignment terminé!\n');
console.log(`   Entreprises avec catégorie: ${data?.[0]?.updated_count || 0}\n`);
console.log('═══════════════════════════════════════════════════════════\n');
