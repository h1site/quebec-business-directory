import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  nomCsvLoaded: 0,
  filteredOut: 0,
  alreadyExists: 0,
  inserted: 0,
  errors: 0
};

// Générer un slug de base à partir du nom
function generateBaseSlug(name) {
  if (!name) return 'entreprise';

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, '-') // Espaces -> tirets
    .replace(/-+/g, '-') // Tirets multiples -> un seul
    .substring(0, 50); // Limiter à 50 caractères
}

// Vérifier si un nom ressemble à une compagnie à numéro
function isNumericCompanyName(name) {
  if (!name) return true;

  // Exemples: "13845567 CANADA", "1234567890", "123456 INC"
  const numericPattern = /^\d{7,}/; // Commence par 7+ chiffres
  return numericPattern.test(name.trim());
}

// Charger tous les NEQ existants dans la DB
async function loadExistingNEQs() {
  console.log('📥 Chargement des NEQ existants en mémoire...');
  const existingNEQs = new Set();

  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('businesses')
      .select('neq')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Erreur:', error.message);
      throw error;
    }

    if (data && data.length > 0) {
      data.forEach(b => {
        if (b.neq) existingNEQs.add(b.neq);
      });
      from += pageSize;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`✅ ${existingNEQs.size} NEQ existants chargés\n`);
  return existingNEQs;
}

// Charger Nom.csv et grouper par NEQ (garder le plus récent)
async function loadNomCsv() {
  console.log('📥 Chargement de Nom-sans-bom.csv...');
  const neqMap = new Map(); // NEQ -> { nom, date }

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Nom-sans-bom.csv', { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (row) => {
        const neq = row.NEQ?.trim();
        const nom = row.NOM_ASSUJ?.trim();
        const statut = row.STAT_NOM?.trim();
        const dateStr = row.DT_IMMAT?.trim(); // Format: YYYY-MM-DD

        // Filtrer: doit avoir NEQ, nom, statut valide
        if (!neq || !nom || statut !== 'V') {
          stats.filteredOut++;
          return;
        }

        // Filtrer: ignorer NEQ commençant par 3 ou 9
        if (neq.startsWith('3') || neq.startsWith('9')) {
          stats.filteredOut++;
          return;
        }

        // Filtrer: ignorer noms de compagnies à numéro
        if (isNumericCompanyName(nom)) {
          stats.filteredOut++;
          return;
        }

        // Filtrer: ignorer noms commençant par "9" ou "3" suivi de chiffres
        // Ex: "9000-9663 QUÉBEC INC." ou "3000-XXXX INC"
        if (/^[39]\d/.test(nom.trim())) {
          stats.filteredOut++;
          return;
        }

        stats.nomCsvLoaded++;

        // Garder le nom avec la date la plus récente pour chaque NEQ
        const existing = neqMap.get(neq);
        if (!existing || (dateStr && dateStr > existing.date)) {
          neqMap.set(neq, {
            nom,
            date: dateStr || '1900-01-01'
          });
        }
      })
      .on('end', () => {
        console.log(`✅ ${stats.nomCsvLoaded} noms chargés depuis CSV`);
        console.log(`⏩ ${stats.filteredOut} filtrés (3xxx, 9xxx, noms numériques)`);
        console.log(`📊 ${neqMap.size} NEQ uniques trouvés\n`);
        resolve(neqMap);
      })
      .on('error', reject);
  });
}

// Insérer les nouvelles entreprises
async function insertNewBusinesses(neqMap, existingNEQs) {
  console.log('🚀 Insertion des nouvelles entreprises...\n');

  const toInsert = [];

  // Filtrer les NEQ qui n'existent pas déjà
  for (const [neq, data] of neqMap.entries()) {
    if (existingNEQs.has(neq)) {
      stats.alreadyExists++;
      continue;
    }

    // Générer slug unique avec NEQ
    const baseSlug = generateBaseSlug(data.nom);
    const slug = `${baseSlug}-${neq}`;

    toInsert.push({
      neq,
      name: data.nom,
      slug,
      data_source: 'req'
    });
  }

  console.log(`📊 À insérer: ${toInsert.length} nouvelles entreprises`);
  console.log(`⏩ Déjà existantes: ${stats.alreadyExists}\n`);

  if (toInsert.length === 0) {
    console.log('✅ Aucune nouvelle entreprise à insérer');
    return;
  }

  // Insérer par batch de 100
  const batchSize = 100;
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const batch = toInsert.slice(i, i + batchSize);

    const { error } = await supabase
      .from('businesses')
      .insert(batch);

    if (error) {
      console.error(`❌ Erreur batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      stats.errors++;

      // En cas d'erreur, essayer de les insérer un par un pour identifier le problème
      for (const business of batch) {
        const { error: singleError } = await supabase
          .from('businesses')
          .insert([business]);

        if (singleError) {
          console.error(`  ❌ ${business.neq} - ${business.name}:`, singleError.message);
          stats.errors++;
        } else {
          stats.inserted++;
        }
      }
    } else {
      stats.inserted += batch.length;
      console.log(`   Inséré: ${stats.inserted} / ${toInsert.length}`);
    }

    // Petit délai entre les batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main
async function main() {
  console.log('🚀 Import depuis Nom.csv\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // 1. Charger les NEQ existants
    const existingNEQs = await loadExistingNEQs();

    // 2. Charger Nom.csv (avec filtre et date la plus récente)
    const neqMap = await loadNomCsv();

    // 3. Insérer les nouveaux
    await insertNewBusinesses(neqMap, existingNEQs);

    console.log('\n✅ IMPORT TERMINÉ!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 STATISTIQUES FINALES:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Noms lus depuis CSV: ${stats.nomCsvLoaded}`);
    console.log(`Filtrés (3xxx, 9xxx, numériques): ${stats.filteredOut}`);
    console.log(`Déjà existants: ${stats.alreadyExists}`);
    console.log(`Insérés: ${stats.inserted}`);
    console.log(`Erreurs: ${stats.errors}`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
