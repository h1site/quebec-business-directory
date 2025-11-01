/**
 * Script pour créer les tables sponsors et sponsor_stats dans Supabase
 * Usage: node scripts/setup-sponsors-tables.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSponsors() {
  try {
    console.log('🚀 Création des tables sponsors...\n');

    // Lire le fichier SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'create_sponsors_tables.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    // Exécuter le SQL (Note: Supabase JS ne supporte pas directement l'exécution de SQL brut)
    // Il faut utiliser la fonction RPC ou exécuter via le dashboard Supabase
    console.log('📄 SQL à exécuter dans Supabase SQL Editor:');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(sqlContent);
    console.log('\n════════════════════════════════════════════════════════════');

    console.log('\n📝 Instructions:');
    console.log('1. Va sur: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql');
    console.log('2. Copie-colle le SQL ci-dessus');
    console.log('3. Clique sur "Run"');

    console.log('\n✅ Ou exécute directement avec psql si tu as accès:');
    console.log(`   psql "${supabaseUrl.replace('https://', 'postgresql://postgres:PASSWORD@').replace('.supabase.co', '.supabase.co:5432')}/postgres" -f supabase/migrations/create_sponsors_tables.sql`);

    // Vérifier si les tables existent déjà
    console.log('\n🔍 Vérification des tables...');

    const { data: sponsors, error: sponsorsError } = await supabase
      .from('sponsors')
      .select('count')
      .limit(1);

    if (!sponsorsError) {
      console.log('✅ Table "sponsors" existe déjà');

      const { data: sponsorsList } = await supabase
        .from('sponsors')
        .select('*')
        .eq('is_active', true);

      console.log(`📊 ${sponsorsList?.length || 0} commanditaire(s) actif(s)`);
      if (sponsorsList && sponsorsList.length > 0) {
        console.log('\n📋 Commanditaires:');
        sponsorsList.forEach(sponsor => {
          console.log(`   - ${sponsor.company_name}: ${sponsor.slogan}`);
        });
      }
    } else {
      console.log('⚠️  Table "sponsors" n\'existe pas encore - exécutez le SQL ci-dessus');
    }

    const { data: stats, error: statsError } = await supabase
      .from('sponsor_stats')
      .select('count')
      .limit(1);

    if (!statsError) {
      console.log('✅ Table "sponsor_stats" existe déjà');
    } else {
      console.log('⚠️  Table "sponsor_stats" n\'existe pas encore - exécutez le SQL ci-dessus');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setupSponsors();
