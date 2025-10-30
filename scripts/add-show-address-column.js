import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function addShowAddressColumn() {
  console.log('🔧 Ajout de la colonne show_address...\n');

  try {
    // Utiliser RPC pour exécuter du SQL brut (nécessite une fonction RPC créée dans Supabase)
    // Ou utiliser l'API REST directement

    console.log('⚠️  Cette migration doit être exécutée dans Supabase SQL Editor:\n');
    console.log('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT TRUE;');
    console.log('\nCette colonne contrôle si l\'adresse est affichée sur la fiche publique.');
    console.log('Par défaut: TRUE (afficher l\'adresse pour toutes les entreprises existantes)');

  } catch (error) {
    console.error('Erreur:', error);
  }
}

addShowAddressColumn();
