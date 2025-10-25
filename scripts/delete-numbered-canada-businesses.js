import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  found: 0,
  deleted: 0,
  errors: 0
};

console.log('🗑️  SUPPRESSION DES ENTREPRISES CANADA INC/LTÉE AVEC NUMÉROS\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Patterns à rechercher:
// - Commence par des chiffres
// - Se termine par "canada inc", "canada ltée", "canada ltee", etc.

console.log('🔍 Recherche des entreprises...\n');

// Charger toutes les entreprises
let allBusinesses = [];
let from = 0;
const pageSize = 1000;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, city, data_source, is_claimed')
    .range(from, from + pageSize - 1);

  if (error || !data || data.length === 0) {
    hasMore = false;
  } else {
    allBusinesses = allBusinesses.concat(data);
    from += pageSize;
    hasMore = data.length === pageSize;

    if (from % 100000 === 0) {
      console.log(`   Chargé: ${from} entreprises...`);
    }
  }
}

console.log(`✅ ${allBusinesses.length} entreprises chargées\n`);

// Filtrer celles qui correspondent au pattern:
// - Commence par 1+ chiffres (optionnel: espaces/tirets)
// - Se termine par "canada inc", "canada ltée", "canada ltee", etc.
const toDelete = allBusinesses.filter(b => {
  if (!b.name) return false;

  const name = b.name.toLowerCase().trim();

  // Pattern: commence par des chiffres
  const startsWithNumber = /^\d/.test(name);

  // Pattern: se termine par canada inc/ltée/ltee/limited/limitée
  const endsWithCanada = /canada\s*(inc\.?|ltée?\.?|limited|limitée|corporation|corp\.?)$/i.test(name);

  return startsWithNumber && endsWithCanada;
});

stats.found = toDelete.length;
console.log(`✅ Trouvé ${stats.found} entreprises à supprimer\n`);

if (stats.found === 0) {
  console.log('🎉 Aucune entreprise à supprimer!');
  process.exit(0);
}

// Montrer quelques exemples
console.log('📋 Exemples (premières 20):');
toDelete.slice(0, 20).forEach(b => {
  console.log(`   - ${b.name} (${b.city || 'N/A'}) - ${b.is_claimed ? '⚠️  RÉCLAMÉE' : 'Non réclamée'}`);
});
console.log();

// Compter les réclamées
const claimedCount = toDelete.filter(b => b.is_claimed).length;
if (claimedCount > 0) {
  console.log(`⚠️  ATTENTION: ${claimedCount} entreprises sont RÉCLAMÉES par des utilisateurs!`);
  console.log(`   Ces entreprises ne seront PAS supprimées.\n`);
}

// Filtrer pour exclure les entreprises réclamées
const toDeleteFiltered = toDelete.filter(b => !b.is_claimed);
console.log(`📊 ${toDeleteFiltered.length} entreprises non réclamées à supprimer\n`);

if (toDeleteFiltered.length === 0) {
  console.log('✅ Aucune entreprise non réclamée à supprimer!');
  process.exit(0);
}

// Supprimer par batch
console.log('🗑️  Suppression en cours...\n');

const BATCH_SIZE = 50;
const TOTAL_BATCHES = Math.ceil(toDeleteFiltered.length / BATCH_SIZE);

for (let i = 0; i < toDeleteFiltered.length; i += BATCH_SIZE) {
  const batch = toDeleteFiltered.slice(i, i + BATCH_SIZE);
  const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

  const promises = batch.map(business =>
    supabase
      .from('businesses')
      .delete()
      .eq('id', business.id)
      .then(({ error }) => {
        if (error) {
          console.error(`   ❌ Erreur pour ${business.name}: ${error.message}`);
          stats.errors++;
          return false;
        }
        stats.deleted++;
        return true;
      })
  );

  await Promise.all(promises);

  console.log(`   🗑️  Batch ${currentBatch}/${TOTAL_BATCHES} - ${stats.deleted}/${toDeleteFiltered.length} supprimées - Erreurs: ${stats.errors}`);
}

console.log('\n✅ SUPPRESSION TERMINÉE!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 STATISTIQUES FINALES:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Entreprises trouvées: ${stats.found}`);
console.log(`Entreprises réclamées (conservées): ${claimedCount}`);
console.log(`Entreprises supprimées: ${stats.deleted}`);
console.log(`Erreurs: ${stats.errors}`);
console.log(`Taux de succès: ${((stats.deleted / toDeleteFiltered.length) * 100).toFixed(2)}%`);
console.log('═══════════════════════════════════════════════════════════');
