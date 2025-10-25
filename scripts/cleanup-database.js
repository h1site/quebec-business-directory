import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  duplicatesRemoved: 0,
  invalidNamesRemoved: 0
};

// 1. Nettoyer les NEQ en double (garder le plus récent)
async function cleanDuplicateNEQs() {
  console.log('🧹 Nettoyage des NEQ en double...\n');

  // Charger tous les NEQ
  console.log('📥 Chargement de toutes les entreprises...');
  const { data: allBusinesses, error } = await supabase
    .from('businesses')
    .select('id, neq, created_at')
    .not('neq', 'is', null)
    .order('neq', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  console.log(`✅ ${allBusinesses.length} entreprises chargées\n`);

  // Grouper par NEQ
  const neqGroups = new Map();
  allBusinesses.forEach(b => {
    if (!neqGroups.has(b.neq)) {
      neqGroups.set(b.neq, []);
    }
    neqGroups.get(b.neq).push(b);
  });

  // Trouver les doublons
  const duplicates = Array.from(neqGroups.entries())
    .filter(([neq, businesses]) => businesses.length > 1);

  console.log(`📊 ${duplicates.length} NEQ avec doublons trouvés\n`);

  if (duplicates.length === 0) {
    console.log('✅ Aucun doublon!\n');
    return;
  }

  // Supprimer les doublons par batch
  let toDelete = [];

  for (const [neq, businesses] of duplicates) {
    // Garder le premier (plus récent), supprimer les autres
    const toKeep = businesses[0];
    const duplicatesToDelete = businesses.slice(1).map(b => b.id);
    toDelete.push(...duplicatesToDelete);
  }

  console.log(`🗑️  ${toDelete.length} doublons à supprimer\n`);

  // Supprimer par batch de 100
  const batchSize = 100;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);

    const { error: delErr } = await supabase
      .from('businesses')
      .delete()
      .in('id', batch);

    if (!delErr) {
      stats.duplicatesRemoved += batch.length;
      console.log(`   Supprimés: ${stats.duplicatesRemoved} / ${toDelete.length}`);
    } else {
      console.error(`❌ Erreur:`, delErr.message);
    }
  }

  console.log('');
}

// 2. Supprimer les noms qui commencent par des chiffres
async function removeInvalidNames() {
  console.log('🧹 Suppression des noms invalides...\n');

  // Charger toutes les entreprises
  const { data: allBusinesses, error } = await supabase
    .from('businesses')
    .select('id, name');

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  // Filtrer les noms qui commencent par des chiffres
  const toDelete = allBusinesses
    .filter(b => b.name && /^\d/.test(b.name.trim()))
    .map(b => b.id);

  console.log(`📊 ${toDelete.length} noms invalides trouvés\n`);

  if (toDelete.length === 0) {
    console.log('✅ Aucun nom invalide!\n');
    return;
  }

  // Supprimer par batch
  const batchSize = 100;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);

    const { error: delErr } = await supabase
      .from('businesses')
      .delete()
      .in('id', batch);

    if (!delErr) {
      stats.invalidNamesRemoved += batch.length;
      console.log(`   Supprimés: ${stats.invalidNamesRemoved} / ${toDelete.length}`);
    } else {
      console.error(`❌ Erreur:`, delErr.message);
    }
  }

  console.log('');
}

// Main
async function main() {
  console.log('🚀 NETTOYAGE DE LA BASE DE DONNÉES\n');
  console.log('═══════════════════════════════════════════\n');

  await cleanDuplicateNEQs();
  await removeInvalidNames();

  console.log('✅ NETTOYAGE TERMINÉ!\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 STATISTIQUES:');
  console.log('═══════════════════════════════════════════');
  console.log(`Doublons NEQ supprimés: ${stats.duplicatesRemoved}`);
  console.log(`Noms invalides supprimés: ${stats.invalidNamesRemoved}`);
  console.log(`TOTAL supprimés: ${stats.duplicatesRemoved + stats.invalidNamesRemoved}`);
  console.log('═══════════════════════════════════════════\n');
}

main();
