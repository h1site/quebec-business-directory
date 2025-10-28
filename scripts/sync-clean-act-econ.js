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
const BATCH_SIZE = 500;

function cleanActEconCode(codeStr) {
  if (!codeStr || codeStr === 'NON DÉCLARÉ' || codeStr === '') {
    return null;
  }

  // Convertir en nombre puis en string pour enlever les zéros de tête
  const num = parseInt(codeStr, 10);

  if (isNaN(num) || num < 100) {
    return null; // Codes invalides ou < 0100
  }

  // Formater avec padding à 4 chiffres
  return num.toString().padStart(4, '0');
}

async function syncCleanActEcon() {
  console.log('🔄 Synchronisation et nettoyage ACT_ECON depuis entreprise.csv\n');
  console.log('='.repeat(80));

  // Étape 1: Lire le CSV et créer un mapping NEQ → ACT_ECON
  console.log('\n1️⃣ Lecture du CSV...\n');

  const neqToActEcon = new Map();
  let csvLines = 0;
  let validCodes = 0;
  let invalidCodes = 0;

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip header
    }

    csvLines++;

    // Parse CSV (simple split - assume no commas in quoted fields for these columns)
    const columns = line.split(',');

    if (columns.length < 19) {
      continue;
    }

    const neq = columns[0];
    const codActEconCae = columns[17]; // COD_ACT_ECON_CAE (index 17)
    const noActEconAssuj = columns[18]; // NO_ACT_ECON_ASSUJ (index 18)

    // Priorité: COD_ACT_ECON_CAE, sinon NO_ACT_ECON_ASSUJ
    let actEcon = cleanActEconCode(noActEconAssuj);

    if (!actEcon && codActEconCae) {
      actEcon = cleanActEconCode(codActEconCae);
    }

    if (actEcon) {
      neqToActEcon.set(neq, actEcon);
      validCodes++;
    } else {
      invalidCodes++;
    }

    // Progress
    if (csvLines % 100000 === 0) {
      console.log(`   Traité: ${csvLines.toLocaleString()} lignes...`);
    }
  }

  console.log(`\n✅ CSV traité:`);
  console.log(`   Total lignes: ${csvLines.toLocaleString()}`);
  console.log(`   Codes valides: ${validCodes.toLocaleString()}`);
  console.log(`   Codes invalides/manquants: ${invalidCodes.toLocaleString()}`);
  console.log(`   Mapping créé: ${neqToActEcon.size.toLocaleString()} NEQ → ACT_ECON\n`);

  // Étape 2: Récupérer tous les NEQ de la base (avec pagination)
  console.log('2️⃣ Récupération des NEQ depuis Supabase...\n');

  let businesses = [];
  let offset = 0;
  const fetchLimit = 10000;

  while (true) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, neq')
      .range(offset, offset + fetchLimit - 1);

    if (error) {
      console.error('❌ Erreur:', error);
      break;
    }

    if (!data || data.length === 0) {
      break;
    }

    businesses = businesses.concat(data);
    offset += fetchLimit;

    console.log(`   Récupéré: ${businesses.length.toLocaleString()} entreprises...`);

    if (data.length < fetchLimit) {
      break; // Dernière page
    }
  }

  console.log(`\n✅ ${businesses.length.toLocaleString()} entreprises récupérées au total\n`);

  // Étape 3: Mise à jour par batches
  console.log('3️⃣ Synchronisation des codes ACT_ECON...\n');

  let updated = 0;
  let notFound = 0;
  let alreadyCorrect = 0;
  let cleaned = 0; // Codes nettoyés (< 0100 → null ou corrigé)

  const batches = [];
  for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
    batches.push(businesses.slice(i, i + BATCH_SIZE));
  }

  console.log(`   ${batches.length} batches à traiter\n`);

  for (let batchNum = 0; batchNum < batches.length; batchNum++) {
    const batch = batches[batchNum];
    const updates = [];

    for (const biz of batch) {
      if (!biz.neq) {
        continue;
      }

      const csvActEcon = neqToActEcon.get(biz.neq);

      if (csvActEcon) {
        updates.push({
          id: biz.id,
          act_econ_code: csvActEcon
        });
      }
    }

    // Mise à jour par lot
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ act_econ_code: update.act_econ_code })
          .eq('id', update.id);

        if (!updateError) {
          updated++;
        }
      }
    }

    notFound += batch.length - updates.length;

    if ((batchNum + 1) % 10 === 0) {
      const progress = ((batchNum + 1) / batches.length * 100).toFixed(1);
      console.log(`📦 Batch ${batchNum + 1}/${batches.length} (${progress}%)`);
      console.log(`   ✅ Mis à jour: ${updated.toLocaleString()}`);
      console.log(`   ⏭️  Non trouvés dans CSV: ${notFound.toLocaleString()}\n`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ SYNCHRONISATION TERMINÉE!\n');
  console.log(`📊 Résultat final:`);
  console.log(`   ✅ Mis à jour: ${updated.toLocaleString()} entreprises`);
  console.log(`   ⏭️  Non trouvés dans CSV: ${notFound.toLocaleString()}`);
  console.log(`   📈 Taux de mise à jour: ${((updated / businesses.length) * 100).toFixed(2)}%`);
}

syncCleanActEcon().catch(console.error);
