import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('📥 IMPORT DES CODES ACT_ECON\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Lire le fichier CSV
const csvContent = fs.readFileSync('data/domainevaleur.csv', 'utf-8');
const lines = csvContent.split('\n');

console.log(`📄 Fichier chargé: ${lines.length} lignes\n`);

// Parser le CSV
const actEconRecords = [];
lines.slice(1).forEach(line => {  // Skip header
  if (!line.trim()) return;

  const parts = line.split(',');
  if (parts.length < 3) return;

  const type = parts[0].trim().replace(/['"]/g, '');
  const code = parts[1].trim().replace(/['"]/g, '');
  const label = parts[2].trim().replace(/^["']|["']$/g, '');

  // Seulement les ACT_ECON
  if (type !== 'ACT_ECON') return;

  // Ignorer les codes bizarres (1, 2, etc.)
  if (code.length < 3 || !/^\d+$/.test(code)) return;

  actEconRecords.push({
    code,
    label_fr: label
  });
});

console.log(`✅ ${actEconRecords.length} codes ACT_ECON parsés\n`);

// Déterminer parent et niveau pour chaque code
actEconRecords.forEach(record => {
  const code = record.code;

  // Niveau 1: codes qui finissent par 00 (ex: 0100, 0200)
  if (code.endsWith('00')) {
    record.category_level = 1;
    record.parent_code = null;
  }
  // Niveau 2: codes qui finissent par X0 mais pas 00 (ex: 0110, 0120)
  else if (code.endsWith('0')) {
    record.category_level = 2;
    // Parent = le code XX00
    const prefix = code.substring(0, 2);
    record.parent_code = `${prefix}00`;
  }
  // Niveau 3: codes spécifiques (ex: 0111, 0162)
  else {
    record.category_level = 3;
    // Parent = le code XXY0
    const prefix = code.substring(0, 3);
    record.parent_code = `${prefix}0`;
  }
});

// Grouper par niveau pour affichage
const byLevel = {
  1: actEconRecords.filter(r => r.category_level === 1),
  2: actEconRecords.filter(r => r.category_level === 2),
  3: actEconRecords.filter(r => r.category_level === 3)
};

console.log('📊 Répartition par niveau:');
console.log(`   - Niveau 1 (majeur): ${byLevel[1].length}`);
console.log(`   - Niveau 2 (intermédiaire): ${byLevel[2].length}`);
console.log(`   - Niveau 3 (spécifique): ${byLevel[3].length}\n`);

console.log('📋 Exemples niveau 1 (premiers 10):');
byLevel[1].slice(0, 10).forEach(r => {
  console.log(`   ${r.code} - ${r.label_fr}`);
});
console.log();

console.log('📋 Exemples niveau 3 (premiers 20):');
byLevel[3].slice(0, 20).forEach(r => {
  console.log(`   ${r.code} → parent: ${r.parent_code} - ${r.label_fr}`);
});
console.log();

console.log('🔄 Insertion dans la base de données...\n');

// Insérer par batch de 100
const BATCH_SIZE = 100;
let inserted = 0;
let errors = 0;

for (let i = 0; i < actEconRecords.length; i += BATCH_SIZE) {
  const batch = actEconRecords.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;
  const totalBatches = Math.ceil(actEconRecords.length / BATCH_SIZE);

  const { data, error } = await supabase
    .from('act_econ_codes')
    .upsert(batch, { onConflict: 'code' });

  if (error) {
    console.error(`❌ Erreur batch ${batchNum}:`, error.message);
    errors += batch.length;
  } else {
    inserted += batch.length;
    console.log(`   ✅ Batch ${batchNum}/${totalBatches} - ${inserted} codes insérés`);
  }
}

console.log('\n✅ IMPORT TERMINÉ!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Codes insérés: ${inserted}`);
console.log(`Erreurs: ${errors}`);
console.log('═══════════════════════════════════════════════════════════');
