import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('💾 INSERTION DES MAPPINGS ACT_ECON\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Charger le fichier JSON généré
const mappingsFile = 'data/act-econ-mappings-generated.json';

if (!fs.existsSync(mappingsFile)) {
  console.error(`❌ Fichier non trouvé: ${mappingsFile}`);
  console.log('\n💡 Lancez d\'abord: node scripts/auto-generate-act-econ-mappings.js\n');
  process.exit(1);
}

const mappings = JSON.parse(fs.readFileSync(mappingsFile, 'utf-8'));

console.log(`📥 ${mappings.length} mappings chargés depuis ${mappingsFile}\n`);

// Insérer dans la base de données
console.log('🔄 Insertion dans la base de données...\n');

const BATCH_SIZE = 100;
let inserted = 0;
let errors = 0;

for (let i = 0; i < mappings.length; i += BATCH_SIZE) {
  const batch = mappings.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(mappings.length / BATCH_SIZE);

  const { data, error } = await supabase
    .from('act_econ_category_mappings')
    .upsert(batch, {
      onConflict: 'act_econ_code,main_category_id,sub_category_id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error(`❌ Erreur batch ${batchNum}:`, error.message);
    errors += batch.length;
  } else {
    inserted += batch.length;
    console.log(`   ✅ Batch ${batchNum}/${totalBatches} - ${inserted} mappings insérés`);
  }
}

console.log('\n✅ INSERTION TERMINÉE!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Mappings insérés: ${inserted}`);
console.log(`Erreurs: ${errors}`);
console.log('═══════════════════════════════════════════════════════════\n');

// Vérifier quelques exemples
console.log('🔍 Vérification - Exemples de mappings dans la base:\n');

const { data: examples } = await supabase
  .from('act_econ_mappings_view')
  .select('*')
  .limit(20);

if (examples) {
  examples.forEach(ex => {
    console.log(`   ${ex.act_econ_code} "${ex.act_econ_label}"`);
    console.log(`   → ${ex.main_category_slug || 'non mappé'} (confiance: ${(ex.confidence_score * 100).toFixed(0)}%)\n`);
  });
}

console.log('═══════════════════════════════════════════════════════════\n');
console.log('✅ PROCHAINE ÉTAPE:\n');
console.log('Les entreprises avec un code ACT_ECON seront automatiquement');
console.log('assignées à leurs catégories grâce au trigger!\n');
