import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createActEconMainTable() {
  console.log('🔧 Création de la table act_econ_main...\n');

  // 1. Vérifier toutes les données de category_level 1
  console.log('1️⃣ Vérification des catégories principales (level 1)...');
  const { data: mainCategories, count, error: sampleError } = await supabase
    .from('act_econ_codes')
    .select('code, label_fr', { count: 'exact' })
    .eq('category_level', 1)
    .order('code');

  if (sampleError) {
    console.error('❌ Erreur lors de la lecture:', sampleError);
    return;
  }

  console.log(`✅ ${count} catégories principales trouvées:\n`);
  mainCategories.forEach(row => {
    console.log(`   - Code ${row.code}: ${row.label_fr}`);
  });

  // 2. Créer la table avec SQL direct
  console.log('\n2️⃣ SQL pour créer la table act_econ_main:\n');
  console.log('='.repeat(70));

  const createTableSQL = `
-- Supprimer la table si elle existe
DROP TABLE IF EXISTS act_econ_main CASCADE;

-- Créer la nouvelle table
CREATE TABLE act_econ_main (
  code TEXT PRIMARY KEY,
  label_fr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer toutes les catégories principales (level 1)
INSERT INTO act_econ_main (code, label_fr)
SELECT code, label_fr
FROM act_econ_codes
WHERE category_level = 1
ORDER BY code;

-- Ajouter un index pour les recherches
CREATE INDEX IF NOT EXISTS idx_act_econ_main_code ON act_econ_main(code);

-- Commentaire sur la table
COMMENT ON TABLE act_econ_main IS 'Catégories principales ACT_ECON (level 1 uniquement: 0100, 0200, ... 7700)';
`;

  console.log(createTableSQL);
  console.log('='.repeat(70));

  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Va dans Supabase Dashboard: https://tiaofyawimkckjgxdnbd.supabase.co');
  console.log('2. Clique sur "SQL Editor"');
  console.log('3. Crée une nouvelle requête');
  console.log('4. Copie-colle le SQL ci-dessus');
  console.log('5. Clique sur "Run" pour exécuter');

  console.log('\n✅ Résultat attendu:');
  console.log(`   - Table: act_econ_main`);
  console.log(`   - Colonnes: code (TEXT), label_fr (TEXT)`);
  console.log(`   - Lignes: ${count} catégories principales`);
  console.log(`   - Codes: 0100, 0200, 0300, ..., 7700`);
}

createActEconMainTable();
