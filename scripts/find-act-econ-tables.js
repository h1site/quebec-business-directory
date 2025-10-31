import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function findActEconTables() {
  console.log('🔍 RECHERCHE DES TABLES ACT_ECON\n');
  console.log('='.repeat(80));

  const tablesToCheck = [
    'act_econ_main',
    'act_econ_categories',
    'act_econ_level1',
    'act_econ_level2',
    'act_econ_level3',
    'act_econ_to_main_category',
    'act_econ_category_mappings'
  ];

  for (const tableName of tablesToCheck) {
    console.log(`\n📋 Table: ${tableName}`);
    console.log('-'.repeat(80));

    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log(`❌ N'existe pas ou erreur: ${error.message}`);
    } else {
      console.log(`✅ Existe! ${count} lignes totales`);
      if (data && data.length > 0) {
        console.log(`\nColonnes: ${Object.keys(data[0]).join(', ')}`);
        console.log(`\nÉchantillon (3 premières lignes):`);
        data.slice(0, 3).forEach(row => {
          console.log(JSON.stringify(row, null, 2));
        });
      }
    }
  }

  console.log('\n' + '='.repeat(80));
}

findActEconTables().catch(console.error);
