import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BATCH_SIZE = 1000; // Process 1000 businesses per batch
const CSV_PATH = path.join(process.cwd(), 'data', 'Entreprise.csv');

async function syncActEconStreaming() {
  console.log('🔄 Synchronisation des codes ACT_ECON (streaming)...\n');
  console.log('='.repeat(80));

  // 1. Lire le CSV en streaming et créer le mapping NEQ → ACT_ECON
  console.log('\n1️⃣ Lecture du CSV en streaming...');

  const neqToActEcon = new Map();
  let lineCount = 0;
  let neqIndex = -1;
  let actEconIndex = -1;

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lineCount++;

    if (lineCount === 1) {
      // Parse header
      const headers = line.replace(/^\uFEFF/, '').split(',');
      neqIndex = headers.indexOf('NEQ');
      actEconIndex = headers.indexOf('NO_ACT_ECON_ASSUJ');

      console.log(`   NEQ à l'index ${neqIndex}, ACT_ECON à l'index ${actEconIndex}`);

      if (neqIndex === -1 || actEconIndex === -1) {
        console.error('❌ Colonnes NEQ ou NO_ACT_ECON_ASSUJ non trouvées!');
        return;
      }
      continue;
    }

    if (!line.trim()) continue;

    const values = line.split(',');
    if (values.length > Math.max(neqIndex, actEconIndex)) {
      const neq = values[neqIndex]?.trim();
      const actEcon = values[actEconIndex]?.trim();

      if (neq && actEcon && neq !== '' && actEcon !== '') {
        // Format: Pad with 0 to get 4 digits (ex: 111 → 0111)
        const formattedCode = actEcon.padStart(4, '0');
        neqToActEcon.set(neq, formattedCode);
      }
    }

    if (lineCount % 100000 === 0) {
      console.log(`   Traité: ${lineCount.toLocaleString()} lignes...`);
    }
  }

  console.log(`✅ ${lineCount.toLocaleString()} lignes lues`);
  console.log(`✅ ${neqToActEcon.size.toLocaleString()} mappings NEQ → ACT_ECON créés`);

  // 2. Échantillon
  console.log('\n📋 Échantillon du mapping:');
  const sample = Array.from(neqToActEcon.entries()).slice(0, 5);
  sample.forEach(([neq, code]) => {
    console.log(`   ${neq} → ${code}`);
  });

  // 3. Compter les entreprises sans act_econ_code
  console.log('\n2️⃣ Comptage des entreprises à mettre à jour...');

  const { count: totalToUpdate } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('act_econ_code', null)
    .not('neq', 'is', null);

  console.log(`📊 ${totalToUpdate?.toLocaleString()} entreprises avec NEQ mais sans act_econ_code`);

  if (!totalToUpdate || totalToUpdate === 0) {
    console.log('✅ Aucune entreprise à mettre à jour!');
    return;
  }

  // 4. Traiter par batch
  console.log('\n3️⃣ Mise à jour par batch...');
  console.log(`   Taille du batch: ${BATCH_SIZE}`);
  console.log(`   Batches estimés: ${Math.ceil(totalToUpdate / BATCH_SIZE)}\n`);

  let processedCount = 0;
  let updatedCount = 0;
  let notFoundCount = 0;
  let batchNumber = 0;
  let errors = [];

  while (processedCount < totalToUpdate) {
    batchNumber++;

    // Fetch batch
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, neq, name')
      .is('act_econ_code', null)
      .not('neq', 'is', null)
      .range(0, BATCH_SIZE - 1);

    if (fetchError) {
      console.error(`❌ Erreur batch ${batchNumber}:`, fetchError);
      errors.push({ batch: batchNumber, error: fetchError.message });
      break;
    }

    if (!businesses || businesses.length === 0) {
      console.log('✅ Aucune entreprise restante');
      break;
    }

    console.log(`\n📦 Batch ${batchNumber} (${businesses.length} entreprises)`);

    // Update each business
    for (const business of businesses) {
      const actEconCode = neqToActEcon.get(business.neq);

      if (actEconCode) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ act_econ_code: actEconCode })
          .eq('id', business.id);

        if (updateError) {
          console.error(`   ❌ ${business.neq}:`, updateError.message);
          errors.push({ neq: business.neq, error: updateError.message });
        } else {
          updatedCount++;
        }
      } else {
        notFoundCount++;
      }
    }

    processedCount += businesses.length;

    const progress = ((processedCount / totalToUpdate) * 100).toFixed(1);
    console.log(`   ✅ Mis à jour: ${updatedCount.toLocaleString()}`);
    console.log(`   ⏭️  Non trouvé: ${notFoundCount.toLocaleString()}`);
    console.log(`   📊 Progrès: ${processedCount.toLocaleString()}/${totalToUpdate.toLocaleString()} (${progress}%)`);

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // 5. Résumé final
  console.log('\n' + '='.repeat(80));
  console.log('✅ SYNCHRONISATION TERMINÉE');
  console.log('='.repeat(80));
  console.log(`
📊 STATISTIQUES:
   Lignes CSV lues:              ${lineCount.toLocaleString()}
   Mappings NEQ→ACT_ECON:        ${neqToActEcon.size.toLocaleString()}

   Entreprises traitées:         ${processedCount.toLocaleString()}
   ✅ Mises à jour avec succès:  ${updatedCount.toLocaleString()}
   ⏭️  Non trouvées dans CSV:     ${notFoundCount.toLocaleString()}
   ❌ Erreurs:                    ${errors.length}

   Batches traités:              ${batchNumber}
  `);

  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Erreurs rencontrées:');
    errors.forEach(err => {
      console.log(`   - Batch ${err.batch || '?'}, NEQ ${err.neq || '?'}: ${err.error}`);
    });
  } else if (errors.length > 10) {
    console.log(`\n⚠️  ${errors.length} erreurs rencontrées (trop pour afficher)`);
  }

  // 6. Vérification finale
  console.log('\n4️⃣ Vérification finale...\n');

  const { count: finalNull } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('act_econ_code', null);

  const { count: finalTotal } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  const { count: finalWithCode } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  console.log(`📊 ÉTAT FINAL:`);
  console.log(`   Total entreprises:           ${finalTotal?.toLocaleString()}`);
  console.log(`   Avec act_econ_code:          ${finalWithCode?.toLocaleString()} (${((finalWithCode/finalTotal)*100).toFixed(2)}%)`);
  console.log(`   Sans act_econ_code (NULL):   ${finalNull?.toLocaleString()} (${((finalNull/finalTotal)*100).toFixed(2)}%)`);

  if (finalNull === 0) {
    console.log('\n🎉 COUVERTURE À 100%! Toutes les entreprises ont un act_econ_code!');
  } else {
    console.log(`\n⚠️  ${finalNull?.toLocaleString()} entreprises restent sans act_econ_code`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Script terminé!');
}

syncActEconStreaming().catch(console.error);
