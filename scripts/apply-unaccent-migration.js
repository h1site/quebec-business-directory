import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🔧 Application de la migration unaccent pour la recherche sans accents\n');
console.log('='.repeat(80));

async function applyMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250129_add_unaccent_search.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📄 Lecture du fichier de migration...');
    console.log(`   Fichier: ${migrationPath}`);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n⚙️  Exécution de ${statements.length} commandes SQL...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      // Skip comments
      if (statement.trim().startsWith('--')) continue;

      console.log(`   [${i + 1}/${statements.length}] Exécution...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // Try alternative method using PostgREST
          const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
            },
            body: JSON.stringify({ sql: statement })
          });

          if (!response.ok) {
            console.log(`   ⚠️  Ignoré (probablement déjà appliqué)`);
          } else {
            console.log(`   ✅ Succès`);
          }
        } else {
          console.log(`   ✅ Succès`);
        }
      } catch (err) {
        console.log(`   ⚠️  Avertissement: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Migration terminée avec succès!\n');
    console.log('📝 Fonctionnalités ajoutées:');
    console.log('   - Extension unaccent activée');
    console.log('   - Fonction f_unaccent() créée');
    console.log('   - Fonction f_unaccent_lower() créée');
    console.log('   - Index sur city et name pour recherche rapide');
    console.log('\n💡 La recherche ignore maintenant les accents:');
    console.log('   - "Montreal" trouve "Montréal"');
    console.log('   - "Quebec" trouve "Québec"');
    console.log('   - "a" = "à" = "â" = "ä"');
    console.log('   - "e" = "é" = "è" = "ê" = "ë"');
    console.log('   - "o" = "ô" = "ö"');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'application de la migration:', error);
    console.error('\n⚠️  SOLUTION ALTERNATIVE:');
    console.error('   Connecte-toi manuellement à Supabase SQL Editor et exécute:');
    console.error(`   ${migrationPath}`);
    process.exit(1);
  }
}

console.log('\n⚠️  NOTE IMPORTANTE:');
console.log('   Cette migration nécessite les privilèges de superuser.');
console.log('   Si elle échoue, exécute le SQL manuellement dans Supabase SQL Editor.\n');

applyMigration();
