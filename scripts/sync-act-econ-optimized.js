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
const BATCH_SIZE = 500; // Plus gros batch pour moins de requêtes

function cleanActEconCode(codeStr) {
  if (!codeStr || codeStr === 'NON DÉCLARÉ' || codeStr === '') {
    return null;
  }

  const num = parseInt(codeStr, 10);

  if (isNaN(num) || num < 100) {
    return null;
  }

  return num.toString().padStart(4, '0');
}

async function syncActEconOptimized() {
  console.log('🚀 Synchronisation ACT_ECON OPTIMISÉE\n');
  console.log('='.repeat(80));

  console.log('\n1️⃣ Lecture du CSV et création du mapping...\n');

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const neqToActEcon = new Map();
  let csvLines = 0;
  let validCodes = 0;
  let invalidCodes = 0;
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    csvLines++;

    if (csvLines % 100000 === 0) {
      console.log(`   Traité: ${csvLines.toLocaleString()} lignes...`);
    }

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
      neqToActEcon.set(neq, actEcon);
      validCodes++;
    } else {
      invalidCodes++;
    }
  }

  console.log(`\n✅ CSV traité:`);
  console.log(`   Total lignes: ${csvLines.toLocaleString()}`);
  console.log(`   Codes valides: ${validCodes.toLocaleString()}`);
  console.log(`   Codes invalides/manquants: ${invalidCodes.toLocaleString()}`);
  console.log(`   Mapping créé: ${neqToActEcon.size.toLocaleString()} NEQ → ACT_ECON`);

  // Récupérer tous les NEQ de la base de données par batches
  console.log('\n2️⃣ Récupération des entreprises depuis Supabase...\n');

  let allBusinesses = [];
  let offset = 0;
  const FETCH_BATCH = 10000;

  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, neq')
      .not('neq', 'is', null)
      .range(offset, offset + FETCH_BATCH - 1);

    if (error) {
      console.error('❌ Erreur:', error);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    allBusinesses.push(...data);
    offset += FETCH_BATCH;

    console.log(`   Récupéré: ${allBusinesses.length.toLocaleString()} entreprises...`);

    if (data.length < FETCH_BATCH) {
      break;
    }
  }

  console.log(`\n✅ ${allBusinesses.length.toLocaleString()} entreprises récupérées au total`);

  // Mise à jour par batches
  console.log('\n3️⃣ Mise à jour des codes ACT_ECON par batch...\n');

  let updated = 0;
  let notFound = 0;
  const totalBatches = Math.ceil(allBusinesses.length / BATCH_SIZE);

  console.log(`   ${totalBatches} batches à traiter\n`);

  for (let i = 0; i < allBusinesses.length; i += BATCH_SIZE) {
    const batch = allBusinesses.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    // Construire les updates pour ce batch
    const updates = [];
    for (const business of batch) {
      const actEconCode = neqToActEcon.get(business.neq);
      if (actEconCode) {
        updates.push({
          id: business.id,
          act_econ_code: actEconCode
        });
      } else {
        notFound++;
      }
    }

    // Faire les updates en parallèle avec Promise.all pour plus de vitesse
    if (updates.length > 0) {
      const updatePromises = updates.map(update =>
        supabase
          .from('businesses')
          .update({ act_econ_code: update.act_econ_code })
          .eq('id', update.id)
      );

      const results = await Promise.all(updatePromises);

      const successCount = results.filter(r => !r.error).length;
      updated += successCount;
    }

    if (batchNum % 10 === 0 || batchNum === totalBatches) {
      const progress = ((i + batch.length) / allBusinesses.length * 100).toFixed(1);
      console.log(`📦 Batch ${batchNum}/${totalBatches} (${progress}%)`);
      console.log(`   ✅ Total mis à jour: ${updated.toLocaleString()}`);
      console.log(`   ⏭️  Total non trouvés: ${notFound.toLocaleString()}\n`);
    }
  }

  console.log('='.repeat(80));
  console.log('✅ SYNCHRONISATION TERMINÉE!\n');
  console.log('📊 Résultat final:');
  console.log(`   ✅ Mis à jour: ${updated.toLocaleString()} entreprises`);
  console.log(`   ⏭️  Non trouvés dans CSV: ${notFound.toLocaleString()}`);
  console.log(`   📈 Taux de mise à jour: ${(updated / allBusinesses.length * 100).toFixed(2)}%`);
}

syncActEconOptimized().catch(console.error);
