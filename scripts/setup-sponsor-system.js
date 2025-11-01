import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSponsorSystem() {
  console.log('🚀 Configuration du système de commandites...\n');

  try {
    // 1. Créer les tables sponsors et sponsor_stats
    console.log('📋 Étape 1: Création des tables...');
    const createTablesSql = readFileSync(
      join(__dirname, '../supabase/migrations/create_sponsors_tables.sql'),
      'utf8'
    );

    console.log('⚠️  IMPORTANT: Exécutez ce SQL dans Supabase SQL Editor:');
    console.log('─────────────────────────────────────────────────');
    console.log(createTablesSql);
    console.log('─────────────────────────────────────────────────\n');

    // 2. Créer les fonctions RPC de tracking
    console.log('📋 Étape 2: Création des fonctions RPC...');
    const rpcFunctionsSql = readFileSync(
      join(__dirname, '../supabase/functions/sponsor_tracking.sql'),
      'utf8'
    );

    console.log('⚠️  IMPORTANT: Exécutez ce SQL dans Supabase SQL Editor:');
    console.log('─────────────────────────────────────────────────');
    console.log(rpcFunctionsSql);
    console.log('─────────────────────────────────────────────────\n');

    // 3. Configurer le bucket Storage
    console.log('📋 Étape 3: Configuration du bucket Storage...');
    const storageSql = readFileSync(
      join(__dirname, '../supabase/migrations/setup_sponsor_storage.sql'),
      'utf8'
    );

    console.log('⚠️  IMPORTANT: Exécutez ce SQL dans Supabase SQL Editor:');
    console.log('─────────────────────────────────────────────────');
    console.log(storageSql);
    console.log('─────────────────────────────────────────────────\n');

    // 4. Vérifier que les tables existent
    console.log('📋 Étape 4: Vérification des tables...');

    const { data: sponsors, error: sponsorsError } = await supabase
      .from('sponsors')
      .select('*')
      .limit(1);

    if (sponsorsError) {
      console.log('⚠️  Table sponsors non trouvée - exécutez d\'abord les SQL ci-dessus');
    } else {
      console.log('✅ Table sponsors existe');
    }

    const { data: stats, error: statsError } = await supabase
      .from('sponsor_stats')
      .select('*')
      .limit(1);

    if (statsError) {
      console.log('⚠️  Table sponsor_stats non trouvée - exécutez d\'abord les SQL ci-dessus');
    } else {
      console.log('✅ Table sponsor_stats existe');
    }

    // 5. Vérifier le bucket Storage
    console.log('\n📋 Étape 5: Vérification du bucket Storage...');
    const { data: buckets } = await supabase.storage.listBuckets();

    const sponsorLogoBucket = buckets?.find(b => b.id === 'sponsor-logos');
    if (sponsorLogoBucket) {
      console.log('✅ Bucket sponsor-logos existe');
    } else {
      console.log('⚠️  Bucket sponsor-logos non trouvé - exécutez d\'abord les SQL ci-dessus');
    }

    console.log('\n📝 Instructions finales:');
    console.log('1. Allez sur: https://supabase.com/dashboard/project/tiaofyawimkckjgxdnbd/sql/new');
    console.log('2. Copiez et exécutez les 3 blocs SQL ci-dessus dans l\'ordre');
    console.log('3. Ajoutez le logo h1site dans: public/images/fiches/sponsors/h1site.svg');
    console.log('4. Testez en visitant une fiche entreprise');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

setupSponsorSystem();
