import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BATCH_SIZE = 500; // Process 500 businesses per batch
const CSV_PATH = path.join(process.cwd(), 'data', 'Entreprise.csv');

async function syncActEconFromCSV() {
  console.log('🔄 Synchronisation des codes ACT_ECON depuis Entreprise.csv...\n');
  console.log('='.repeat(80));

  // 1. Lire le CSV (parsing manuel simple)
  console.log('\n1️⃣ Lecture du fichier CSV...');
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');

  // Parse CSV manually (simple split)
  const lines = csvContent.split('\n');
  const headers = lines[0].replace(/^\uFEFF/, '').split(','); // Remove BOM

  const neqIndex = headers.indexOf('NEQ');
  const actEconIndex = headers.indexOf('NO_ACT_ECON_ASSUJ');

  console.log(`   Colonnes trouvées: NEQ (index ${neqIndex}), NO_ACT_ECON_ASSUJ (index ${actEconIndex})`);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',');
    if (values.length > Math.max(neqIndex, actEconIndex)) {
      records.push({
        NEQ: values[neqIndex]?.trim() || '',
        NO_ACT_ECON_ASSUJ: values[actEconIndex]?.trim() || ''
      });
    }
  }

  console.log(`✅ ${records.length.toLocaleString()} lignes lues du CSV`);

  // 2. Filtrer les lignes avec NEQ et NO_ACT_ECON_ASSUJ
  console.log('\n2️⃣ Filtrage des données...');
  const validRecords = records.filter(row => {
    return row.NEQ &&
           row.NEQ.trim() !== '' &&
           row.NO_ACT_ECON_ASSUJ &&
           row.NO_ACT_ECON_ASSUJ.trim() !== '';
  });

  console.log(`✅ ${validRecords.length.toLocaleString()} lignes valides (NEQ + ACT_ECON)`);
  console.log(`❌ ${(records.length - validRecords.length).toLocaleString()} lignes ignorées (manque NEQ ou ACT_ECON)`);

  // 3. Créer un mapping NEQ → ACT_ECON code formaté
  console.log('\n3️⃣ Création du mapping NEQ → ACT_ECON...');
  const neqToActEcon = new Map();

  validRecords.forEach(row => {
    const neq = row.NEQ.trim();
    const actEconCode = row.NO_ACT_ECON_ASSUJ.trim();

    // Format: Pad with 0 to get 4 digits (ex: 111 → 0111)
    const formattedCode = actEconCode.padStart(4, '0');

    neqToActEcon.set(neq, formattedCode);
  });

  console.log(`✅ ${neqToActEcon.size.toLocaleString()} mappings NEQ → ACT_ECON créés`);

  // 4. Échantillon du mapping
  console.log('\n📋 Échantillon du mapping:');
  const sampleEntries = Array.from(neqToActEcon.entries()).slice(0, 5);
  sampleEntries.forEach(([neq, code]) => {
    console.log(`   ${neq} → ${code}`);
  });

  // 5. Récupérer les entreprises de Supabase avec NEQ mais sans act_econ_code
  console.log('\n4️⃣ Récupération des entreprises Supabase sans act_econ_code...');

  const { count: totalWithoutCode } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('act_econ_code', null)
    .not('neq', 'is', null);

  console.log(`📊 ${totalWithoutCode?.toLocaleString()} entreprises avec NEQ mais sans act_econ_code`);

  // 6. Traiter par batch
  console.log('\n5️⃣ Traitement par batch...');
  console.log(`   Taille du batch: ${BATCH_SIZE}`);
  console.log(`   Batches estimés: ${Math.ceil(totalWithoutCode / BATCH_SIZE)}\n`);

  let processedCount = 0;
  let updatedCount = 0;
  let notFoundCount = 0;
  let batchNumber = 0;

  while (processedCount < totalWithoutCode) {
    batchNumber++;

    // Fetch batch
    const { data: businesses, error: fetchError } = await supabase
      .from('businesses')
      .select('id, neq, name')
      .is('act_econ_code', null)
      .not('neq', 'is', null)
      .range(0, BATCH_SIZE - 1); // Always get first BATCH_SIZE that match

    if (fetchError) {
      console.error(`❌ Erreur batch ${batchNumber}:`, fetchError);
      break;
    }

    if (!businesses || businesses.length === 0) {
      console.log('✅ Aucune entreprise restante à traiter');
      break;
    }

    console.log(`\n📦 Batch ${batchNumber} (${businesses.length} entreprises)`);

    // Update each business in batch
    const updates = [];

    for (const business of businesses) {
      const actEconCode = neqToActEcon.get(business.neq);

      if (actEconCode) {
        updates.push({
          id: business.id,
          neq: business.neq,
          act_econ_code: actEconCode
        });
      } else {
        notFoundCount++;
      }
    }

    // Execute batch update
    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ act_econ_code: update.act_econ_code })
          .eq('id', update.id);

        if (updateError) {
          console.error(`   ❌ Erreur update ${update.neq}:`, updateError.message);
        } else {
          updatedCount++;
        }
      }

      console.log(`   ✅ Mis à jour: ${updates.length} entreprises`);
      console.log(`   ⏭️  Non trouvé dans CSV: ${businesses.length - updates.length}`);
    }

    processedCount += businesses.length;

    // Progress
    const progress = ((processedCount / totalWithoutCode) * 100).toFixed(1);
    console.log(`   📊 Progrès: ${processedCount.toLocaleString()}/${totalWithoutCode.toLocaleString()} (${progress}%)`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 7. Résumé final
  console.log('\n' + '='.repeat(80));
  console.log('✅ SYNCHRONISATION TERMINÉE');
  console.log('='.repeat(80));
  console.log(`
📊 STATISTIQUES:
   Lignes CSV lues:              ${records.length.toLocaleString()}
   Mappings NEQ→ACT_ECON:        ${neqToActEcon.size.toLocaleString()}

   Entreprises traitées:         ${processedCount.toLocaleString()}
   ✅ Mises à jour avec succès:  ${updatedCount.toLocaleString()}
   ⏭️  Non trouvées dans CSV:     ${notFoundCount.toLocaleString()}

   Batches traités:              ${batchNumber}
  `);

  // 8. Vérification finale
  console.log('6️⃣ Vérification finale...\n');

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
    console.log('   Raisons possibles:');
    console.log('   - NEQ absent dans le CSV');
    console.log('   - NEQ NULL dans Supabase');
    console.log('   - ACT_ECON absent dans le CSV gouvernemental');
  }

  console.log('\n' + '='.repeat(80));
}

syncActEconFromCSV().catch(console.error);
