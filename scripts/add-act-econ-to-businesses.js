import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function addActEconField() {
  console.log('🔧 Ajout du champ act_econ_code dans la table businesses...\n');

  // Vérifier si le champ existe déjà
  console.log('1️⃣ Vérification de la structure actuelle...');
  const { data: sample, error: sampleError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single();

  if (sample) {
    const columns = Object.keys(sample);
    console.log(`Colonnes actuelles (${columns.length} total)`);

    if (columns.includes('act_econ_code')) {
      console.log('✅ Le champ act_econ_code existe déjà!');
      return;
    } else {
      console.log('❌ Le champ act_econ_code n\'existe pas encore');
    }
  }

  console.log('\n2️⃣ SQL pour ajouter le champ act_econ_code:\n');
  console.log('='.repeat(70));

  const addColumnSQL = `
-- Ajouter le champ act_econ_code dans la table businesses
-- Ce champ stockera le code d'activité économique (ex: 0100, 1000, etc.)

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS act_econ_code TEXT;

-- Ajouter un index pour les recherches par act_econ_code
CREATE INDEX IF NOT EXISTS idx_businesses_act_econ_code
ON businesses(act_econ_code);

-- Ajouter un commentaire
COMMENT ON COLUMN businesses.act_econ_code IS 'Code d''activité économique (ACT_ECON) - référence vers act_econ_main ou act_econ_codes';

-- Vérification
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'businesses'
  AND column_name = 'act_econ_code';
`;

  console.log(addColumnSQL);
  console.log('='.repeat(70));

  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Va dans Supabase SQL Editor');
  console.log('2. Copie-colle le SQL ci-dessus');
  console.log('3. Exécute la requête');

  console.log('\n✅ Résultat attendu:');
  console.log('   - Nouvelle colonne: act_econ_code (TEXT, nullable)');
  console.log('   - Index créé pour performance');
  console.log('   - Prêt à stocker les codes ACT_ECON (0100, 0110, 0111, etc.)');

  console.log('\n💡 Utilisation future:');
  console.log('   - Codes principaux (level 1): 0100, 0200, 0300... → depuis act_econ_main');
  console.log('   - Codes détaillés (level 2-3): 0110, 0111... → depuis act_econ_codes');
}

addActEconField();
