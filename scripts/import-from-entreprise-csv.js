/**
 * Import STREAMING depuis Entreprise.csv + Nom.csv
 *
 * Approche optimisée:
 * 1. Charger SEULEMENT les NEQ existants en mémoire (léger)
 * 2. Créer un index Nom.csv en lecture directe
 * 3. Stream Entreprise.csv ligne par ligne
 * 4. Insérer les entreprises manquantes par batches
 *
 * UTILISATION:
 * node scripts/import-from-entreprise-csv.js
 */

import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;
const dryRun = args.includes('--dry-run');

console.log('🚀 Import STREAMING Entreprise.csv + Nom.csv');
console.log('📊 Configuration:', { limit, dryRun });
console.log('');

const stats = {
  entreprisesRead: 0,
  namesLoaded: 0,
  alreadyExists: 0,
  inserted: 0,
  errors: 0
};

/**
 * Générer slug
 */
function generateSlug(name, neq) {
  if (!name) return `entreprise-${neq}`;

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug}-${neq}`;
}

/**
 * Charger les NEQ existants en mémoire (Set léger)
 */
async function loadExistingNEQs() {
  console.log('📥 Chargement des NEQ existants...');
  const existingNEQs = new Set();

  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data } = await supabase
      .from('businesses')
      .select('neq')
      .eq('data_source', 'req')
      .range(from, from + pageSize - 1);

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    data.forEach(b => existingNEQs.add(b.neq));
    from += pageSize;
    hasMore = data.length === pageSize;

    if (from % 10000 === 0) {
      console.log(`   Chargé ${from} NEQ...`);
    }
  }

  console.log(`✅ ${existingNEQs.size} NEQ existants chargés`);
  console.log('');
  return existingNEQs;
}

/**
 * Créer un index Nom.csv (Map NEQ -> Nom)
 */
async function buildNomIndex() {
  console.log('📥 Construction de l\'index Nom.csv...');
  const nomIndex = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Nom.csv')
      .pipe(csv())
      .on('data', (row) => {
        const neq = row.NEQ;
        const nom = row.NOM_ASSUJ;
        const statut = row.STAT_NOM;

        if (neq && nom && statut === 'V') {
          nomIndex.set(neq, nom);
          stats.namesLoaded++;

          if (stats.namesLoaded % 100000 === 0) {
            console.log(`   ${stats.namesLoaded} noms indexés...`);
          }
        }
      })
      .on('end', () => {
        console.log(`✅ ${stats.namesLoaded} noms indexés`);
        console.log('');
        resolve(nomIndex);
      })
      .on('error', reject);
  });
}

/**
 * Stream Entreprise.csv et insérer les nouvelles
 */
async function streamEntrepriseCsv(existingNEQs, nomIndex) {
  console.log('📊 Stream Entreprise.csv...');
  console.log('');

  let batch = [];
  const batchSize = 100;
  let processed = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Entreprise.csv')
      .pipe(csv())
      .on('data', async (row) => {
        const neq = row.NEQ;
        const statut = row.COD_STAT_IMMAT;
        const adrLigne1 = row.ADR_DOMCL_LIGN1_ADR;
        const adrLigne2 = row.ADR_DOMCL_LIGN2_ADR;
        const codePostal = row.ADR_DOMCL_LIGN4_ADR;

        stats.entreprisesRead++;

        // Filtrer: actif (IM) avec adresse
        if (statut !== 'IM' || !adrLigne1) {
          return;
        }

        // Skip si déjà existant
        if (existingNEQs.has(neq)) {
          stats.alreadyExists++;
          return;
        }

        // Lookup nom officiel
        const nom = nomIndex.get(neq) || `Entreprise ${neq}`;

        // Parser ville
        let ville = adrLigne2 || '';
        ville = ville.replace(/\s*\(Québec\)\s*/gi, '').replace(/\s*\(QC\)\s*/gi, '').trim();

        const business = {
          neq: neq,
          etablissement_number: '01',
          name: nom,
          address: adrLigne1,
          city: ville,
          postal_code: codePostal || '',
          province: 'QC',
          slug: generateSlug(nom, neq),
          data_source: 'req',
          is_claimed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        batch.push(business);

        // Insérer par batch
        if (batch.length >= batchSize) {
          if (!dryRun) {
            const { error } = await supabase
              .from('businesses')
              .insert([...batch]);

            if (error) {
              console.error(`❌ Erreur insertion:`, error.message);
              stats.errors++;
            } else {
              stats.inserted += batch.length;
            }
          } else {
            stats.inserted += batch.length;
          }

          console.log(`✅ Inséré: ${stats.inserted} | Lu: ${stats.entreprisesRead} | Exists: ${stats.alreadyExists}`);
          batch = [];
        }

        processed++;
        if (processed >= limit) {
          this.destroy();
        }

        // Log progression
        if (stats.entreprisesRead % 10000 === 0) {
          console.log(`📊 Progression: ${stats.entreprisesRead} lignes lues`);
        }
      })
      .on('end', async () => {
        // Dernier batch
        if (batch.length > 0 && !dryRun) {
          const { error } = await supabase
            .from('businesses')
            .insert(batch);

          if (!error) {
            stats.inserted += batch.length;
          }
        }

        console.log('');
        console.log('✅ Stream terminé!');
        resolve();
      })
      .on('error', reject);
  });
}

/**
 * Main
 */
async function main() {
  try {
    const startTime = Date.now();

    // 1. Charger NEQ existants (léger)
    const existingNEQs = await loadExistingNEQs();

    // 2. Build index Nom.csv
    const nomIndex = await buildNomIndex();

    // 3. Stream Entreprise.csv
    await streamEntrepriseCsv(existingNEQs, nomIndex);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('');
    console.log('═'.repeat(60));
    console.log('🎉 IMPORT TERMINÉ!');
    console.log('═'.repeat(60));
    console.log('📊 Statistiques:');
    console.log(`   Entreprises lues: ${stats.entreprisesRead}`);
    console.log(`   Noms indexés: ${stats.namesLoaded}`);
    console.log(`   Déjà existantes: ${stats.alreadyExists}`);
    console.log(`   Nouvelles insérées: ${stats.inserted}`);
    console.log(`   Erreurs: ${stats.errors}`);
    console.log(`   Durée: ${duration}s`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
