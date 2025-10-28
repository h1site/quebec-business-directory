import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CSV_PATH = 'data/entreprise.csv';
const BATCH_SIZE = 100;

function cleanActEconCode(codeStr) {
  if (!codeStr || codeStr === 'NON DÉCLARÉ' || codeStr === '') {
    return null;
  }

  const num = parseInt(codeStr, 10);

  if (isNaN(num) || num < 100) {
    return null; // Codes invalides ou < 0100
  }

  return num.toString().padStart(4, '0');
}

async function syncActEconDirect() {
  console.log('🔄 Synchronisation ACT_ECON - Mise à jour directe par NEQ\n');
  console.log('='.repeat(80));

  console.log('\n1️⃣ Lecture et mise à jour en streaming...\n');

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let csvLines = 0;
  let updated = 0;
  let skipped = 0;
  let batchNum = 0;
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    csvLines++;
    const columns = line.split(',');

    if (columns.length < 19) {
      continue;
    }

    const neq = columns[0];
    const codActEconCae = columns[17];
    const noActEconAssuj = columns[18];

    let actEcon = cleanActEconCode(noActEconAssuj);
    if (!actEcon && codActEconCae) {
      actEcon = cleanActEconCode(codActEconCae);
    }

    if (actEcon && neq) {
      batch.push({ neq, act_econ_code: actEcon });
    } else {
      skipped++;
    }

    // Mise à jour par batch
    if (batch.length >= BATCH_SIZE) {
      batchNum++;

      for (const item of batch) {
        const { error } = await supabase
          .from('businesses')
          .update({ act_econ_code: item.act_econ_code })
          .eq('neq', item.neq);

        if (!error) {
          updated++;
        }
      }

      if (batchNum % 100 === 0) {
        console.log(`📦 Batch ${batchNum}`);
        console.log(`   Lignes CSV traitées: ${csvLines.toLocaleString()}`);
        console.log(`   ✅ Mis à jour: ${updated.toLocaleString()}`);
        console.log(`   ⏭️  Ignorés (code invalide): ${skipped.toLocaleString()}\n`);
      }

      batch = [];
    }
  }

  // Dernier batch
  if (batch.length > 0) {
    for (const item of batch) {
      const { error } = await supabase
        .from('businesses')
        .update({ act_econ_code: item.act_econ_code })
        .eq('neq', item.neq);

      if (!error) {
        updated++;
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ SYNCHRONISATION TERMINÉE!\n');
  console.log(`📊 Résultat final:`);
  console.log(`   Lignes CSV traitées: ${csvLines.toLocaleString()}`);
  console.log(`   ✅ Mis à jour: ${updated.toLocaleString()} entreprises`);
  console.log(`   ⏭️  Ignorés (code invalide): ${skipped.toLocaleString()}`);
}

syncActEconDirect().catch(console.error);
