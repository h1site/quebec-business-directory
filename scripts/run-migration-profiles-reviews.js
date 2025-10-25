import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

async function executeSql(sql) {
  const url = `${supabaseUrl}/rest/v1/rpc/exec`;

  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response;
}

async function runMigration() {
  console.log('🚀 Exécution de la migration via psql...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migration_user_profiles_and_reviews.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Écrire le SQL dans un fichier temporaire
    const tempSqlPath = join(__dirname, '..', 'temp_migration.sql');
    const fs = await import('fs');
    fs.writeFileSync(tempSqlPath, sql);

    console.log('📝 Fichier SQL créé:', tempSqlPath);
    console.log('\n⚠️  Pour exécuter la migration, utilisez psql:');
    console.log('\n1. Allez dans Supabase Dashboard > Settings > Database');
    console.log('2. Copiez la "Connection string" (mode Direct connection)');
    console.log('3. Exécutez cette commande:\n');
    console.log(`   psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f temp_migration.sql`);
    console.log('\nOU utilisez l\'éditeur SQL dans Supabase Dashboard et copiez-collez le contenu du fichier.\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

runMigration();
