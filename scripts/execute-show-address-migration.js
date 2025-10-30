import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function executeMigration() {
  console.log('🔧 Exécution de la migration show_address...\n');

  try {
    // Ajouter la colonne show_address avec DEFAULT TRUE
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE businesses
        ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT TRUE;

        CREATE INDEX IF NOT EXISTS idx_businesses_show_address
        ON businesses(show_address);
      `
    });

    if (error) {
      console.error('❌ Erreur lors de la migration:', error);
      console.log('\n⚠️  Veuillez exécuter cette migration manuellement dans Supabase SQL Editor:');
      console.log('\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT TRUE;');
      console.log('CREATE INDEX IF NOT EXISTS idx_businesses_show_address ON businesses(show_address);');
      return;
    }

    console.log('✅ Migration exécutée avec succès!');
    console.log('La colonne show_address a été ajoutée avec succès.');

  } catch (error) {
    console.error('❌ Erreur:', error);
    console.log('\n⚠️  Veuillez exécuter cette migration manuellement dans Supabase SQL Editor:');
    console.log('\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT TRUE;');
    console.log('CREATE INDEX IF NOT EXISTS idx_businesses_show_address ON businesses(show_address);');
  }
}

executeMigration();
