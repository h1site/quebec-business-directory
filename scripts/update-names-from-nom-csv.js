/**
 * ÉTAPE 1: Mettre à jour les noms officiels depuis Nom.csv
 *
 * Pour chaque entreprise dans notre DB:
 * 1. Lookup le NEQ dans Nom.csv
 * 2. Si le nom est différent, UPDATE avec le nom officiel
 *
 * Cela garantit qu'on a les noms d'entreprises officiels,
 * pas les noms d'établissements.
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

const stats = {
  nomsCsvLoaded: 0,
  businessesProcessed: 0,
  namesUpdated: 0,
  namesSame: 0,
  nomNotFound: 0,
  errors: 0
};

/**
 * Générer slug
 */
function generateSlug(name, neq, etablissement) {
  if (!name) return `entreprise-${neq}-${etablissement}`;

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `${slug}-${neq}-${etablissement}`;
}

/**
 * Charger Nom.csv en mémoire
 */
async function loadNomCsv() {
  console.log('📥 Chargement de Nom.csv...');
  const nomIndex = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Nom-sans-bom.csv', { encoding: 'utf8' })
      .pipe(csv())
      .on('data', (row) => {
        const neq = row.NEQ;
        const nom = row.NOM_ASSUJ;
        const statut = row.STAT_NOM;

        if (neq && nom && statut === 'V') {
          nomIndex.set(neq, nom);
          stats.nomsCsvLoaded++;

          if (stats.nomsCsvLoaded % 100000 === 0) {
            console.log(`   ${stats.nomsCsvLoaded} noms chargés...`);
          }
        }
      })
      .on('end', () => {
        console.log(`✅ ${stats.nomsCsvLoaded} noms chargés depuis Nom.csv`);
        console.log('');
        resolve(nomIndex);
      })
      .on('error', reject);
  });
}

/**
 * Mettre à jour les noms des entreprises existantes
 */
async function updateBusinessNames(nomIndex) {
  console.log('🔄 Mise à jour des noms d\'entreprises...');
  console.log('');

  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, neq, etablissement_number, name')
      .eq('data_source', 'req')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Erreur chargement:', error.message);
      stats.errors++;
      break;
    }

    if (!businesses || businesses.length === 0) {
      hasMore = false;
      break;
    }

    // Pour chaque entreprise, vérifier le nom
    for (const business of businesses) {
      const neq = business.neq;
      const currentName = business.name;
      const officialName = nomIndex.get(neq);

      stats.businessesProcessed++;

      if (!officialName) {
        stats.nomNotFound++;
        continue;
      }

      // Comparer les noms (ignorer casse et espaces)
      const currentNormalized = currentName.trim().toLowerCase();
      const officialNormalized = officialName.trim().toLowerCase();

      if (currentNormalized === officialNormalized) {
        stats.namesSame++;
        continue;
      }

      // UPDATE le nom et le slug
      const newSlug = generateSlug(officialName, neq, business.etablissement_number);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: officialName,
          slug: newSlug
        })
        .eq('id', business.id);

      if (updateError) {
        // Si erreur de slug dupliqué, ajouter un timestamp
        if (updateError.message.includes('businesses_slug_key')) {
          const uniqueSlug = `${newSlug}-${Date.now()}`;
          const { error: retryError } = await supabase
            .from('businesses')
            .update({
              name: officialName,
              slug: uniqueSlug
            })
            .eq('id', business.id);

          if (!retryError) {
            stats.namesUpdated++;
          } else {
            console.error(`❌ Erreur ${neq}:`, retryError.message);
            stats.errors++;
          }
        } else {
          console.error(`❌ Erreur ${neq}:`, updateError.message);
          stats.errors++;
        }
      } else {
        stats.namesUpdated++;
      }
    }

    console.log(`   Traité: ${stats.businessesProcessed} | Mis à jour: ${stats.namesUpdated} | Identiques: ${stats.namesSame} | Non trouvés: ${stats.nomNotFound}`);

    from += pageSize;
    hasMore = businesses.length === pageSize;

    // Petit délai pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('✅ Mise à jour terminée!');
}

/**
 * Main
 */
async function main() {
  try {
    const startTime = Date.now();

    // Charger Nom.csv
    const nomIndex = await loadNomCsv();

    // Mettre à jour les noms
    await updateBusinessNames(nomIndex);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('');
    console.log('═'.repeat(60));
    console.log('🎉 ÉTAPE 1 TERMINÉE!');
    console.log('═'.repeat(60));
    console.log('📊 Statistiques:');
    console.log(`   Noms chargés (Nom.csv): ${stats.nomsCsvLoaded}`);
    console.log(`   Entreprises traitées: ${stats.businessesProcessed}`);
    console.log(`   Noms mis à jour: ${stats.namesUpdated}`);
    console.log(`   Noms identiques: ${stats.namesSame}`);
    console.log(`   Noms non trouvés dans Nom.csv: ${stats.nomNotFound}`);
    console.log(`   Erreurs: ${stats.errors}`);
    console.log(`   Durée: ${duration}s (${Math.round(duration/60)}min)`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
