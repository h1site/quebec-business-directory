/**
 * Generate descriptions specifically for businesses WITH categories
 * This will show how templates work differently with category data
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

console.log('📝 GÉNÉRATION DE DESCRIPTIONS - ENTREPRISES AVEC CATÉGORIES');
console.log('═'.repeat(60));

// Import the description generator from the main script
import('./generate-descriptions.js');
