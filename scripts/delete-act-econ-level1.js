import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function deleteLevel1Codes() {
  console.log('🗑️  Suppression des codes ACT_ECON de level 1...\n');

  // 1. Compter combien de codes level 1 existent
  console.log('1️⃣ Vérification des codes à supprimer...');
  const { data: codesToDelete, count, error: countError } = await supabase
    .from('act_econ_codes')
    .select('code, label_fr', { count: 'exact' })
    .eq('category_level', 1)
    .order('code');

  if (countError) {
    console.error('❌ Erreur:', countError);
    return;
  }

  console.log(`📋 ${count} codes de level 1 trouvés:\n`);
  codesToDelete.forEach(row => {
    console.log(`   - ${row.code}: ${row.label_fr}`);
  });

  // 2. Vérifier les enfants (level 2) qui ont ces codes comme parent
  console.log('\n2️⃣ Vérification des codes enfants (level 2)...');
  const parentCodes = codesToDelete.map(c => c.code);

  const { count: childrenCount, error: childrenError } = await supabase
    .from('act_econ_codes')
    .select('*', { count: 'exact', head: true })
    .in('parent_code', parentCodes);

  if (childrenError) {
    console.error('❌ Erreur:', childrenError);
    return;
  }

  console.log(`⚠️  ${childrenCount} codes de level 2+ ont ces codes comme parent`);
  console.log(`   Ces codes enfants vont devenir orphelins si parent_code a ON DELETE CASCADE`);
  console.log(`   Sinon ils vont avoir un parent_code NULL\n`);

  // 3. SQL pour supprimer
  console.log('3️⃣ SQL pour supprimer les codes de level 1:\n');
  console.log('='.repeat(70));

  const deleteSQL = `
-- Supprimer tous les codes de category_level 1
-- Cela va supprimer 74 codes: 0100, 0200, 0300, ..., 9900

DELETE FROM act_econ_codes
WHERE category_level = 1;

-- Vérification
SELECT count(*) as remaining_level1
FROM act_econ_codes
WHERE category_level = 1;
`;

  console.log(deleteSQL);
  console.log('='.repeat(70));

  console.log('\n⚠️  ATTENTION:');
  console.log(`   - ${count} codes level 1 seront SUPPRIMÉS`);
  console.log(`   - ${childrenCount} codes enfants seront affectés`);
  console.log(`   - Les codes sont maintenant dans la table act_econ_main`);

  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Va dans Supabase Dashboard: https://tiaofyawimkckjgxdnbd.supabase.co');
  console.log('2. Clique sur "SQL Editor"');
  console.log('3. Crée une nouvelle requête');
  console.log('4. Copie-colle le SQL ci-dessus');
  console.log('5. Clique sur "Run" pour exécuter');

  console.log('\n✅ Résultat attendu:');
  console.log(`   - ${count} lignes supprimées de act_econ_codes`);
  console.log(`   - Les codes level 1 existent maintenant uniquement dans act_econ_main`);
}

deleteLevel1Codes();
