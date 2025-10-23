/**
 * Restaurer les noms corrects depuis Etablissements.csv
 *
 * Matching par NEQ + adresse pour trouver le bon nom d'établissement
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
  etablissementsLoaded: 0,
  businessesProcessed: 0,
  namesRestored: 0,
  notFound: 0,
  errors: 0
};

/**
 * Normaliser adresse pour matching
 */
function normalizeAddress(addr) {
  if (!addr) return '';
  return addr
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,/g, '')
    .replace(/\./g, '')
    .replace(/[àâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .trim();
}

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
 * Charger Etablissements.csv en mémoire avec index par NEQ + adresse
 */
async function loadEtablissements() {
  console.log('📥 Chargement de Etablissements.csv...');
  const index = new Map();

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/Etablissements-sans-bom.csv')
      .pipe(csv())
      .on('data', (row) => {
        const neq = row.NEQ;
        const nomEtab = row.NOM_ETAB;
        const adrLigne1 = row.LIGN1_ADR;

        if (neq && nomEtab && adrLigne1) {
          const normalizedAddr = normalizeAddress(adrLigne1);
          const key = `${neq}|${normalizedAddr}`;
          index.set(key, nomEtab);
          stats.etablissementsLoaded++;

          if (stats.etablissementsLoaded % 10000 === 0) {
            console.log(`   ${stats.etablissementsLoaded} établissements chargés...`);
          }
        }
      })
      .on('end', () => {
        console.log(`✅ ${stats.etablissementsLoaded} établissements indexés`);
        console.log('');
        resolve(index);
      })
      .on('error', reject);
  });
}

/**
 * Restaurer les noms
 */
async function restoreNames(etablissementsIndex) {
  console.log('🔄 Restauration des noms depuis Etablissements.csv...');
  console.log('');

  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, neq, etablissement_number, name, address')
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

    for (const business of businesses) {
      const neq = business.neq;
      const address = business.address;
      const currentName = business.name;

      stats.businessesProcessed++;

      if (!address) {
        stats.notFound++;
        continue;
      }

      // Lookup dans l'index
      const normalizedAddr = normalizeAddress(address);
      const key = `${neq}|${normalizedAddr}`;
      const correctName = etablissementsIndex.get(key);

      if (!correctName) {
        stats.notFound++;
        continue;
      }

      // Si le nom est déjà correct, skip
      if (currentName === correctName) {
        continue;
      }

      // UPDATE avec le nom correct
      const newSlug = generateSlug(correctName, neq, business.etablissement_number);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          name: correctName,
          slug: newSlug
        })
        .eq('id', business.id);

      if (updateError) {
        // Si slug dupliqué, ajouter timestamp
        if (updateError.message.includes('businesses_slug_key')) {
          const uniqueSlug = `${newSlug}-${Date.now()}`;
          const { error: retryError } = await supabase
            .from('businesses')
            .update({
              name: correctName,
              slug: uniqueSlug
            })
            .eq('id', business.id);

          if (!retryError) {
            stats.namesRestored++;
          } else {
            console.error(`❌ Erreur ${neq}:`, retryError.message);
            stats.errors++;
          }
        } else {
          console.error(`❌ Erreur ${neq}:`, updateError.message);
          stats.errors++;
        }
      } else {
        stats.namesRestored++;
      }
    }

    console.log(`   Traité: ${stats.businessesProcessed} | Restaurés: ${stats.namesRestored} | Non trouvés: ${stats.notFound}`);

    from += pageSize;
    hasMore = businesses.length === pageSize;

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('✅ Restauration terminée!');
}

/**
 * Main
 */
async function main() {
  try {
    const startTime = Date.now();

    const etablissementsIndex = await loadEtablissements();
    await restoreNames(etablissementsIndex);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('');
    console.log('═'.repeat(60));
    console.log('🎉 RESTAURATION TERMINÉE!');
    console.log('═'.repeat(60));
    console.log('📊 Statistiques:');
    console.log(`   Établissements chargés: ${stats.etablissementsLoaded}`);
    console.log(`   Entreprises traitées: ${stats.businessesProcessed}`);
    console.log(`   Noms restaurés: ${stats.namesRestored}`);
    console.log(`   Non trouvés: ${stats.notFound}`);
    console.log(`   Erreurs: ${stats.errors}`);
    console.log(`   Durée: ${duration}s (${Math.round(duration/60)}min)`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
