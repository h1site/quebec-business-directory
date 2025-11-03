/**
 * Add description_en column to businesses table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  console.log('🔧 Ajout de la colonne description_en...\n');

  // Note: We need to use the service role key for DDL operations
  // For now, let's just check if the column exists
  const { data, error } = await supabase
    .from('businesses')
    .select('description_en')
    .limit(1);

  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.log('❌ La colonne description_en n\'existe pas encore.');
      console.log('\n📝 Pour l\'ajouter, exécutez ce SQL dans votre console Supabase:');
      console.log('\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS description_en TEXT;');
      console.log('CREATE INDEX IF NOT EXISTS idx_businesses_description_en ON businesses(description_en) WHERE description_en IS NOT NULL;');
      console.log('\n');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  } else {
    console.log('✅ La colonne description_en existe déjà!');
  }
}

main().catch(console.error);
