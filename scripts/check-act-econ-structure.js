import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkStructure() {
  console.log('🔍 Vérification de la structure de act_econ_codes...\n');

  const { data, error } = await supabase
    .from('act_econ_codes')
    .select('*')
    .limit(5);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('Colonnes disponibles:', Object.keys(data[0]));
  console.log('\nÉchantillon des données:\n');
  data.forEach(row => {
    console.log(row);
  });
}

checkStructure();
