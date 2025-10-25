import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🚀 ENRICHISSEMENT MASSIF DEPUIS ENTREPRISE.CSV\n');
console.log('═══════════════════════════════════════════════════════════\n');

const stats = {
  totalLines: 0,
  processed: 0,
  matched: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
  startTime: Date.now()
};

// ===========================================================================
// ÉTAPE 1: CHARGER TOUTES LES ENTREPRISES DEPUIS SUPABASE
// ===========================================================================
console.log('📥 ÉTAPE 1: Chargement des entreprises depuis Supabase...\n');

const neqMap = new Map(); // NEQ → business object
let from = 0;
const pageSize = 1000;

while (true) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, neq, address, city, postal_code, act_econ_code')
    .range(from, from + pageSize - 1);

  if (error) {
    console.error('❌ Erreur Supabase:', error);
    break;
  }

  if (!data || data.length === 0) break;

  data.forEach(biz => {
    if (biz.neq) {
      neqMap.set(biz.neq, biz);
    }
  });

  from += pageSize;

  if (from % 100000 === 0) {
    console.log(`   Chargé: ${from} entreprises...`);
  }

  if (data.length < pageSize) break;
}

console.log(`\n✅ ${neqMap.size} entreprises chargées avec NEQ\n`);

// ===========================================================================
// ÉTAPE 2: TRAITER LE CSV PAR CHUNKS
// ===========================================================================
console.log('📄 ÉTAPE 2: Lecture du fichier entreprise.csv...\n');

const CSV_FILE = 'data/entreprise.csv';
const BATCH_SIZE = 50; // Updates par batch
const LOG_INTERVAL = 10000; // Log tous les 10k lignes

const fileStream = fs.createReadStream(CSV_FILE);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let header = null;
let updateBatch = [];

// Fonction pour nettoyer la ville (enlever "(Québec)")
function cleanCity(cityString) {
  if (!cityString) return null;
  return cityString
    .replace(/\s*\(Québec\)\s*/gi, '')
    .replace(/\s*\(QUÉBEC\)\s*/gi, '')
    .trim();
}

// Fonction pour extraire l'adresse (sans guillemets)
function cleanAddress(addr) {
  if (!addr) return null;
  return addr.replace(/^"|"$/g, '').trim();
}

// Fonction pour traiter un batch d'updates
async function processBatch(batch) {
  if (batch.length === 0) return;

  const promises = batch.map(update =>
    supabase
      .from('businesses')
      .update(update.data)
      .eq('id', update.id)
      .then(({ error }) => {
        if (error) {
          stats.errors++;
          console.error(`   ❌ Erreur NEQ ${update.neq}:`, error.message);
          return false;
        }
        stats.updated++;
        return true;
      })
  );

  await Promise.all(promises);
}

// Traiter chaque ligne du CSV
for await (const line of rl) {
  stats.totalLines++;

  // Première ligne = header
  if (!header) {
    header = line.split(',');
    continue;
  }

  // Parser la ligne CSV (attention aux virgules dans les guillemets)
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current); // Dernier champ

  // Extraire les colonnes importantes
  const neq = values[0]?.trim();
  const actEconCode = values[17]?.trim(); // COD_ACT_ECON_CAE
  const adrLign1 = values[33]?.trim(); // ADR_DOMCL_LIGN1_ADR (rue)
  const adrLign2 = values[34]?.trim(); // ADR_DOMCL_LIGN2_ADR (ville)
  const adrLign4 = values[36]?.trim(); // ADR_DOMCL_LIGN4_ADR (code postal)

  stats.processed++;

  // Log de progression
  if (stats.processed % LOG_INTERVAL === 0) {
    const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    const rate = (stats.processed / elapsed).toFixed(0);
    console.log(`   📊 Ligne ${stats.processed}: ${stats.matched} matchés, ${stats.updated} enrichis (${rate} lignes/sec)`);
  }

  // Vérifier si on a ce NEQ dans Supabase
  if (!neq || !neqMap.has(neq)) {
    stats.skipped++;
    continue;
  }

  const business = neqMap.get(neq);
  const updateData = {};
  let hasUpdate = false;

  // SKIP ACT_ECON pour l'instant (contrainte FK problématique)
  // TODO: Réactiver après avoir retiré la contrainte FK
  // if (actEconCode && actEconCode !== '' && actEconCode !== '0' && actEconCode !== '1' && actEconCode !== '2' && actEconCode.length >= 4) {
  //   if (!business.act_econ_code || business.act_econ_code !== actEconCode) {
  //     updateData.act_econ_code = actEconCode;
  //     hasUpdate = true;
  //   }
  // }

  // Enrichir l'adresse si disponible et non déjà remplie
  if (adrLign1 && (!business.address || business.address === '')) {
    updateData.address = cleanAddress(adrLign1);
    hasUpdate = true;
  }

  // Enrichir la ville si disponible
  if (adrLign2 && (!business.city || business.city === '')) {
    updateData.city = cleanCity(adrLign2);
    hasUpdate = true;
  }

  // Enrichir le code postal si disponible
  if (adrLign4 && (!business.postal_code || business.postal_code === '')) {
    updateData.postal_code = adrLign4;
    hasUpdate = true;
  }

  // Si on a des updates, ajouter au batch
  if (hasUpdate) {
    stats.matched++;
    updateBatch.push({
      id: business.id,
      neq: neq,
      data: updateData
    });

    // Mettre à jour le business dans le map pour éviter re-updates
    Object.assign(business, updateData);
  }

  // Traiter le batch s'il est plein
  if (updateBatch.length >= BATCH_SIZE) {
    await processBatch(updateBatch);
    updateBatch = [];

    // Petit délai pour ne pas surcharger Supabase
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Traiter le dernier batch
if (updateBatch.length > 0) {
  await processBatch(updateBatch);
}

// ===========================================================================
// STATISTIQUES FINALES
// ===========================================================================
const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
const rate = (stats.processed / elapsed).toFixed(0);

console.log('\n✅ ENRICHISSEMENT TERMINÉ!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 STATISTIQUES FINALES:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Lignes CSV traitées: ${stats.processed.toLocaleString()}`);
console.log(`Entreprises dans Supabase: ${neqMap.size.toLocaleString()}`);
console.log(`NEQ matchés: ${stats.matched.toLocaleString()}`);
console.log(`Entreprises enrichies: ${stats.updated.toLocaleString()}`);
console.log(`Ignorées (pas de match): ${stats.skipped.toLocaleString()}`);
console.log(`Erreurs: ${stats.errors}`);
console.log();
console.log(`Temps total: ${elapsed}s (${rate} lignes/sec)`);
console.log('═══════════════════════════════════════════════════════════\n');

console.log('💡 Les catégories seront automatiquement assignées via le trigger!');
console.log('   Vérifiez avec: SELECT COUNT(*) FROM businesses WHERE act_econ_code IS NOT NULL;\n');
