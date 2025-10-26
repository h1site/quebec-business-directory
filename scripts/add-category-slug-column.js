/**
 * Ajoute la colonne main_category_slug à la table businesses
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Il faut la clé SERVICE_ROLE pour exécuter du SQL brut
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Ajout de la colonne main_category_slug');
console.log('═'.repeat(60));

async function addColumn() {
  try {
    // Exécuter le SQL via RPC (si une fonction existe) ou via le client Postgres
    const sql = `
      -- Ajouter la colonne
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS main_category_slug TEXT;

      -- Créer un index
      CREATE INDEX IF NOT EXISTS idx_businesses_main_category_slug ON businesses(main_category_slug);
    `;

    console.log('Exécution du SQL...');
    console.log(sql);
    console.log('');
    console.log('⚠️  IMPORTANT: Cette commande doit être exécutée manuellement dans le SQL Editor de Supabase');
    console.log('              car l\'API JavaScript ne permet pas d\'exécuter ALTER TABLE directement.');
    console.log('');
    console.log('📋 Étapes:');
    console.log('   1. Allez sur https://supabase.com/dashboard');
    console.log('   2. Sélectionnez votre projet');
    console.log('   3. Cliquez sur "SQL Editor" dans le menu de gauche');
    console.log('   4. Copiez-collez le SQL ci-dessus');
    console.log('   5. Cliquez sur "Run"');
    console.log('   6. Exécutez ensuite: node scripts/migrate-add-category-slug.js');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addColumn();
