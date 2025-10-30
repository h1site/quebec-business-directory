import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkColumns() {
  console.log('🔍 Vérification des colonnes de la table businesses...\n');

  // Récupérer une entreprise pour voir toutes les colonnes disponibles
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('data_source', 'user_created')
    .limit(1)
    .single();

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log('📋 Colonnes disponibles:');
  Object.keys(data).sort().forEach(col => {
    const value = data[col];
    const type = typeof value;
    const preview = value === null ? 'NULL' : (type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value);
    console.log(`  ${col}: ${type} = ${preview}`);
  });

  console.log('\n🔎 Colonnes liées aux catégories:');
  Object.keys(data).filter(k => k.includes('category') || k.includes('categ')).forEach(col => {
    console.log(`  ${col}: ${data[col]}`);
  });
}

checkColumns();
