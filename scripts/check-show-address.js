import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkShowAddress() {
  console.log('🔍 Vérification de la colonne show_address...\n');

  // Récupérer une entreprise pour voir les colonnes
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log('Colonnes liées à "show":');
  Object.keys(data).filter(k => k.includes('show')).forEach(col => {
    console.log(`  ${col}: ${data[col]}`);
  });

  if (Object.keys(data).includes('show_address')) {
    console.log('\n✅ La colonne show_address existe déjà');
  } else {
    console.log('\n❌ La colonne show_address n\'existe PAS - il faut l\'ajouter');
  }
}

checkShowAddress();
