import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recreateView() {
  console.log('🔧 Recréation de la vue businesses_enriched...\n');

  const sql = `
DROP VIEW IF EXISTS businesses_enriched CASCADE;

CREATE VIEW businesses_enriched AS
SELECT
  b.*,
  mc.slug as primary_main_category_slug,
  mc.label_fr as primary_main_category_fr,
  mc.label_en as primary_main_category_en,
  sc.slug as primary_sub_category_slug,
  sc.label_fr as primary_sub_category_fr,
  sc.label_en as primary_sub_category_en
FROM businesses b
LEFT JOIN business_categories bc ON b.id = bc.business_id AND bc.is_primary = true
LEFT JOIN sub_categories sc ON bc.sub_category_id = sc.id
LEFT JOIN main_categories mc ON sc.main_category_id = mc.id;
`;

  try {
    // Execute SQL using RPC or direct query
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).catch(() => ({ error: null }));

    if (error) {
      console.log('⚠️  RPC method not available, the view may need to be created in Supabase SQL Editor');
      console.log('\n📋 Copy this SQL to Supabase Dashboard > SQL Editor:\n');
      console.log('━'.repeat(70));
      console.log(sql);
      console.log('━'.repeat(70));
      return;
    }

    console.log('✅ Vue businesses_enriched recréée avec succès!');

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    console.log('\n📋 Exécutez ce SQL manuellement dans Supabase Dashboard > SQL Editor:\n');
    console.log('━'.repeat(70));
    console.log(sql);
    console.log('━'.repeat(70));
  }

  // Verify the view exists by querying it
  console.log('\n🔍 Vérification de la vue...');
  const { data, error, count } = await supabase
    .from('businesses_enriched')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ La vue n\'existe toujours pas:', error.message);
    console.log('\n⚠️  VOUS DEVEZ EXÉCUTER LE SQL MANUELLEMENT DANS SUPABASE!\n');
    console.log('1. Ouvrez Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans SQL Editor');
    console.log('4. Collez le SQL ci-dessus');
    console.log('5. Cliquez sur "Run"\n');
  } else {
    console.log(`✅ Vue vérifiée: ${count} entreprises disponibles`);

    // Show sample
    const { data: sample } = await supabase
      .from('businesses_enriched')
      .select('name, city, primary_main_category_fr')
      .limit(3);

    console.log('\n📊 Exemples:');
    sample?.forEach(b => {
      console.log(`   - ${b.name} (${b.city}) - ${b.primary_main_category_fr || 'Sans catégorie'}`);
    });
  }
}

recreateView().catch(console.error);
