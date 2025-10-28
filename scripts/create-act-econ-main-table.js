import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createActEconMainTable() {
  console.log('🔧 Création de la table act_econ_main...\n');

  // 1. Vérifier les données existantes dans act_econ_codes
  console.log('1️⃣ Vérification des données dans act_econ_codes...');
  const { data: sampleData, error: sampleError } = await supabase
    .from('act_econ_codes')
    .select('code, label_fr, categorie')
    .in('code', [100, 200, 300])
    .eq('categorie', 1);

  if (sampleError) {
    console.error('❌ Erreur lors de la lecture de act_econ:', sampleError);
    return;
  }

  console.log(`✅ Données trouvées (codes 100, 200, 300):`);
  sampleData.forEach(row => {
    console.log(`   - Code ${row.code}: ${row.label_fr} (catégorie ${row.categorie})`);
  });

  // 2. Créer la nouvelle table act_econ_main
  console.log('\n2️⃣ Création de la table act_econ_main via SQL...');

  const createTableSQL = `
    -- Supprimer la table si elle existe
    DROP TABLE IF EXISTS act_econ_main CASCADE;

    -- Créer la nouvelle table
    CREATE TABLE act_econ_main (
      code INTEGER PRIMARY KEY,
      label_fr TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Insérer les données des codes 100, 200, 300 de catégorie 1
    INSERT INTO act_econ_main (code, label_fr)
    SELECT code, label_fr
    FROM act_econ_codes
    WHERE code IN (100, 200, 300)
      AND categorie = 1
    ORDER BY code;

    -- Ajouter un index pour les recherches
    CREATE INDEX IF NOT EXISTS idx_act_econ_main_code ON act_econ_main(code);

    -- Commentaire sur la table
    COMMENT ON TABLE act_econ_main IS 'Table principale des activités économiques (catégorie 1, codes 100-300)';
  `;

  const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
    sql: createTableSQL
  });

  if (createError) {
    console.log('⚠️  La fonction exec_sql n\'existe pas, exécution manuelle requise');
    console.log('\n📋 Voici le SQL à exécuter dans Supabase SQL Editor:\n');
    console.log('='.repeat(70));
    console.log(createTableSQL);
    console.log('='.repeat(70));

    console.log('\n📝 Instructions:');
    console.log('1. Ouvre Supabase Dashboard');
    console.log('2. Va dans SQL Editor');
    console.log('3. Copie-colle le SQL ci-dessus');
    console.log('4. Exécute la requête');
    return;
  }

  console.log('✅ Table act_econ_main créée avec succès!');

  // 3. Vérifier les données insérées
  console.log('\n3️⃣ Vérification des données insérées...');
  const { data: newData, count, error: verifyError } = await supabase
    .from('act_econ_main')
    .select('*', { count: 'exact' })
    .order('code');

  if (verifyError) {
    console.error('❌ Erreur lors de la vérification:', verifyError);
    return;
  }

  console.log(`\n✅ ${count} lignes insérées dans act_econ_main:`);
  newData.forEach(row => {
    console.log(`   - Code ${row.code}: ${row.label_fr}`);
  });

  console.log('\n✅ TERMINÉ!');
}

createActEconMainTable();
