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
  errors: 0,
  claimed: 0
};

console.log('🗑️  NETTOYAGE DES COMPAGNIES À NUMÉRO INVALIDES\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('Pattern ciblé: XXXX-XXXX Quebec Inc/Ltée (numéros avec tirets)\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('🔍 Chargement des entreprises...\n');

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

// Pattern TRÈS SPÉCIFIQUE pour les compagnies à numéro invalides:
// Format: chiffres-chiffres + Quebec/Canada + Inc/Ltée
// Exemples: "9158-8459 QUEBEC INC", "1234-5678 CANADA LTÉE"
const invalidNumberedPattern = /^\d{4,}-\d{4,}\s+(quebec|canada)\s+(inc\.?|ltée?\.?|limited|limitée)$/i;

const toDelete = allBusinesses.filter(b => {
  if (!b.name) return false;
  const name = b.name.trim();
  return invalidNumberedPattern.test(name);
});

stats.found = toDelete.length;
console.log(`✅ Trouvé ${stats.found} compagnies à numéro invalides\n`);

if (stats.found === 0) {
  console.log('🎉 Aucune compagnie à numéro invalide trouvée!');
  process.exit(0);
}

// Montrer des exemples
console.log('📋 Exemples (premiers 30):');
toDelete.slice(0, 30).forEach(b => {
  const claimed = b.is_claimed ? '⚠️  RÉCLAMÉE' : 'Non réclamée';
  console.log(`   - "${b.name}" (${b.city || 'N/A'}) - ${claimed}`);
});
console.log();

// Compter les réclamées
stats.claimed = toDelete.filter(b => b.is_claimed).length;
if (stats.claimed > 0) {
  console.log(`⚠️  ATTENTION: ${stats.claimed} entreprises sont RÉCLAMÉES!`);
  console.log(`   Ces entreprises ne seront PAS supprimées.\n`);
}

// Filtrer pour exclure les réclamées
const toDeleteFiltered = toDelete.filter(b => !b.is_claimed);
console.log(`📊 ${toDeleteFiltered.length} entreprises non réclamées à supprimer\n`);

if (toDeleteFiltered.length === 0) {
  console.log('✅ Aucune entreprise non réclamée à supprimer!');
  process.exit(0);
}

// Supprimer par batch
console.log('🗑️  Suppression en cours...\n');

const BATCH_SIZE = 100;
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
console.log(`Compagnies invalides trouvées: ${stats.found}`);
console.log(`Entreprises réclamées (conservées): ${stats.claimed}`);
console.log(`Entreprises supprimées: ${stats.deleted}`);
console.log(`Erreurs: ${stats.errors}`);
console.log(`Taux de succès: ${toDeleteFiltered.length > 0 ? ((stats.deleted / toDeleteFiltered.length) * 100).toFixed(2) : 0}%`);
console.log('═══════════════════════════════════════════════════════════');
