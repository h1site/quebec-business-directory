/**
 * PHASE 1: Synchroniser les noms officiels et adresses depuis Nom.csv et Entreprise.csv
 *
 * Ce script:
 * 1. UPDATE les noms des entreprises existantes avec Nom.csv (noms officiels)
 * 2. UPDATE les adresses manquantes depuis Entreprise.csv
 * 3. INSERT les nouvelles entreprises de Entreprise.csv qui ont une adresse
 *
 * UTILISATION:
 * node scripts/phase1-sync-names-addresses.js
 *
 * OPTIONS:
 * --limit=1000    Limiter le nombre d'entreprises à traiter (pour test)
 * --dry-run       Afficher les données sans les sauvegarder
 */

import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;
const dryRun = args.includes('--dry-run');

console.log('🚀 PHASE 1: Synchronisation Nom.csv + Entreprise.csv');
console.log('📊 Configuration:', { limit, dryRun });
console.log('');

// Statistiques
const stats = {
  nomCsvLoaded: 0,
  entrepriseCsvLoaded: 0,
  existingBusinesses: 0,
  namesUpdated: 0,
  addressesAdded: 0,
  newBusinessesInserted: 0,
  errors: 0
};

/**
 * Charger Nom.csv en mémoire (Map NEQ -> Nom officiel)
 */
async function loadNomCsv() {
  console.log('📥 Chargement de Nom.csv...');
  const nomMap = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Nom.csv')
      .pipe(csv())
      .on('data', (row) => {
        const neq = row.NEQ;
        const nom = row.NOM_ASSUJ;
        const statut = row.STAT_NOM; // V = valide

        if (neq && nom && statut === 'V') {
          nomMap.set(neq, nom);
          stats.nomCsvLoaded++;
        }

        if (stats.nomCsvLoaded % 100000 === 0) {
          console.log(`   Chargé ${stats.nomCsvLoaded} noms...`);
        }
      })
      .on('end', () => {
        console.log(`✅ ${stats.nomCsvLoaded} noms chargés depuis Nom.csv`);
        console.log('');
        resolve(nomMap);
      })
      .on('error', reject);
  });
}

/**
 * Charger Entreprise.csv en mémoire (Map NEQ -> {adresse, actEcon})
 */
async function loadEntrepriseCsv() {
  console.log('📥 Chargement de Entreprise.csv...');
  const entrepriseMap = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Entreprise.csv')
      .pipe(csv())
      .on('data', (row) => {
        const neq = row.NEQ;
        const statut = row.COD_STAT_IMMAT; // IM = Immatriculé (actif)
        const adrLigne1 = row.ADR_DOMCL_LIGN1_ADR; // Numéro + rue
        const adrLigne2 = row.ADR_DOMCL_LIGN2_ADR; // Ville + (Québec)
        const codePostal = row.ADR_DOMCL_LIGN4_ADR;
        const actEcon = row.COD_ACT_ECON_CAE;

        // Filtrer: seulement entreprises actives avec adresse
        if (neq && statut === 'IM' && adrLigne1) {
          // Parser ville (enlever " (Québec)" ou " (QC)")
          let ville = adrLigne2 || '';
          ville = ville.replace(/\s*\(Québec\)\s*/gi, '').replace(/\s*\(QC\)\s*/gi, '').trim();

          entrepriseMap.set(neq, {
            address: adrLigne1,
            city: ville,
            postal_code: codePostal || '',
            act_econ: actEcon || null
          });
          stats.entrepriseCsvLoaded++;
        }

        if (stats.entrepriseCsvLoaded % 100000 === 0) {
          console.log(`   Chargé ${stats.entrepriseCsvLoaded} entreprises...`);
        }
      })
      .on('end', () => {
        console.log(`✅ ${stats.entrepriseCsvLoaded} entreprises chargées depuis Entreprise.csv`);
        console.log('');
        resolve(entrepriseMap);
      })
      .on('error', reject);
  });
}

/**
 * Générer un slug unique
 */
function generateSlug(name, neq) {
  if (!name) return `entreprise-${neq}`;

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug}-${neq}`;
}

/**
 * Mettre à jour les entreprises existantes
 */
async function updateExistingBusinesses(nomMap, entrepriseMap) {
  console.log('🔄 Mise à jour des entreprises existantes...');
  console.log('');

  // Charger toutes les entreprises REQ existantes par batches
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore && stats.existingBusinesses < limit) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, neq, name, address, city, postal_code')
      .eq('data_source', 'req')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Erreur lors du chargement des entreprises:', error.message);
      stats.errors++;
      break;
    }

    if (!businesses || businesses.length === 0) {
      hasMore = false;
      break;
    }

    // Pour chaque entreprise, mettre à jour le nom et l'adresse si nécessaire
    for (const business of businesses) {
      const neq = business.neq;
      const updates = {};

      // 1. Mettre à jour le nom depuis Nom.csv
      const officialName = nomMap.get(neq);
      if (officialName && officialName !== business.name) {
        updates.name = officialName;
        updates.slug = generateSlug(officialName, neq);
        stats.namesUpdated++;
      }

      // 2. Ajouter l'adresse si manquante depuis Entreprise.csv
      if (!business.address || !business.city) {
        const entrepriseData = entrepriseMap.get(neq);
        if (entrepriseData) {
          if (!business.address && entrepriseData.address) {
            updates.address = entrepriseData.address;
          }
          if (!business.city && entrepriseData.city) {
            updates.city = entrepriseData.city;
          }
          if (!business.postal_code && entrepriseData.postal_code) {
            updates.postal_code = entrepriseData.postal_code;
          }
          if (Object.keys(updates).length > 0) {
            stats.addressesAdded++;
          }
        }
      }

      // Mettre à jour si nécessaire
      if (Object.keys(updates).length > 0 && !dryRun) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update(updates)
          .eq('id', business.id);

        if (updateError) {
          console.error(`❌ Erreur mise à jour ${neq}:`, updateError.message);
          stats.errors++;
        }
      }

      stats.existingBusinesses++;
    }

    console.log(`   Traité ${stats.existingBusinesses} entreprises | Noms: ${stats.namesUpdated} | Adresses: ${stats.addressesAdded}`);

    from += pageSize;
    hasMore = businesses.length === pageSize;
  }

  console.log('');
  console.log(`✅ Mise à jour terminée: ${stats.existingBusinesses} entreprises traitées`);
  console.log('');
}

/**
 * Insérer les nouvelles entreprises
 */
async function insertNewBusinesses(nomMap, entrepriseMap) {
  console.log('➕ Insertion des nouvelles entreprises...');
  console.log('');

  // Charger tous les NEQ existants
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
  }

  console.log(`✅ ${existingNEQs.size} NEQ existants chargés`);
  console.log('');

  // Insérer les nouvelles entreprises par batch
  const batch = [];
  const batchSize = 100;
  let processed = 0;

  for (const [neq, entrepriseData] of entrepriseMap.entries()) {
    // Skip si déjà existant
    if (existingNEQs.has(neq)) continue;

    // Skip si pas d'adresse
    if (!entrepriseData.address) continue;

    const officialName = nomMap.get(neq) || `Entreprise ${neq}`;
    const slug = generateSlug(officialName, neq);

    const business = {
      neq: neq,
      etablissement_number: '01', // Principal par défaut
      name: officialName,
      address: entrepriseData.address,
      city: entrepriseData.city,
      postal_code: entrepriseData.postal_code,
      province: 'QC',
      slug: slug,
      data_source: 'req',
      is_claimed: false,
      owner_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    batch.push(business);

    // Insérer par batch
    if (batch.length >= batchSize) {
      if (!dryRun) {
        const { error } = await supabase
          .from('businesses')
          .insert(batch);

        if (error) {
          console.error(`❌ Erreur insertion batch:`, error.message);
          stats.errors++;
        } else {
          stats.newBusinessesInserted += batch.length;
        }
      } else {
        stats.newBusinessesInserted += batch.length;
      }

      console.log(`   Inséré ${stats.newBusinessesInserted} nouvelles entreprises`);
      batch.length = 0;
    }

    processed++;
    if (processed >= limit) break;
  }

  // Insérer dernier batch
  if (batch.length > 0 && !dryRun) {
    const { error } = await supabase
      .from('businesses')
      .insert(batch);

    if (!error) {
      stats.newBusinessesInserted += batch.length;
    }
  }

  console.log('');
  console.log(`✅ Insertion terminée: ${stats.newBusinessesInserted} nouvelles entreprises`);
  console.log('');
}

/**
 * Main
 */
async function main() {
  try {
    // Charger les CSV en mémoire
    const [nomMap, entrepriseMap] = await Promise.all([
      loadNomCsv(),
      loadEntrepriseCsv()
    ]);

    // Mettre à jour les entreprises existantes
    await updateExistingBusinesses(nomMap, entrepriseMap);

    // Insérer les nouvelles entreprises
    await insertNewBusinesses(nomMap, entrepriseMap);

    // Statistiques finales
    console.log('');
    console.log('✅ PHASE 1 TERMINÉE!');
    console.log('═'.repeat(50));
    console.log('📊 Statistiques:');
    console.log(`   Noms chargés (Nom.csv): ${stats.nomCsvLoaded}`);
    console.log(`   Entreprises chargées (Entreprise.csv): ${stats.entrepriseCsvLoaded}`);
    console.log(`   Entreprises existantes traitées: ${stats.existingBusinesses}`);
    console.log(`   Noms mis à jour: ${stats.namesUpdated}`);
    console.log(`   Adresses ajoutées: ${stats.addressesAdded}`);
    console.log(`   Nouvelles entreprises insérées: ${stats.newBusinessesInserted}`);
    console.log(`   Erreurs: ${stats.errors}`);
    console.log('═'.repeat(50));
    console.log('');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
