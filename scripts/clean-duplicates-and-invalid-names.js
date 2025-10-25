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

// 1. Supprimer les noms invalides (commençant par 9 ou 3, ou 7+ chiffres)
async function removeInvalidNames() {
  console.log('🧹 Suppression des noms invalides...\n');

  // Pattern: nom commence par "9" suivi de chiffres (ex: "9000-XXXX QUÉBEC INC")
  const { data: names9, error: err1 } = await supabase
    .from('businesses')
    .select('id, name')
    .like('name', '9%');

  if (!err1 && names9) {
    const toDelete = names9.filter(b => /^9\d/.test(b.name)).map(b => b.id);

    if (toDelete.length > 0) {
      const { error: delErr } = await supabase
        .from('businesses')
        .delete()
        .in('id', toDelete);

      if (!delErr) {
        stats.invalidNamesRemoved += toDelete.length;
        console.log(`✅ Supprimés ${toDelete.length} noms commençant par 9`);
      }
    }
  }

  // Pattern: nom commence par "3" suivi de chiffres
  const { data: names3, error: err2 } = await supabase
    .from('businesses')
    .select('id, name')
    .like('name', '3%');

  if (!err2 && names3) {
    const toDelete = names3.filter(b => /^3\d/.test(b.name)).map(b => b.id);

    if (toDelete.length > 0) {
      const { error: delErr } = await supabase
        .from('businesses')
        .delete()
        .in('id', toDelete);

      if (!delErr) {
        stats.invalidNamesRemoved += toDelete.length;
        console.log(`✅ Supprimés ${toDelete.length} noms commençant par 3`);
      }
    }
  }

  console.log('');
}

// 2. Supprimer les NEQ en double (garder le plus récent)
async function removeDuplicateNEQs() {
  console.log('🔍 Recherche des NEQ en double...\n');

  // Charger tous les NEQ
  const { data: allBusinesses, error } = await supabase
    .from('businesses')
    .select('id, neq, created_at')
    .not('neq', 'is', null)
    .order('neq', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

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

  console.log(`📊 Trouvé ${duplicates.length} NEQ en double`);

  if (duplicates.length === 0) {
    console.log('');
    return;
  }

  // Pour chaque groupe de doublons, garder le plus récent
  for (const [neq, businesses] of duplicates) {
    // Trier par created_at desc (le plus récent en premier)
    businesses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Garder le premier (plus récent), supprimer les autres
    const toKeep = businesses[0];
    const toDelete = businesses.slice(1).map(b => b.id);

    console.log(`  NEQ ${neq}: garder 1, supprimer ${toDelete.length}`);

    if (toDelete.length > 0) {
      const { error: delErr } = await supabase
        .from('businesses')
        .delete()
        .in('id', toDelete);

      if (!delErr) {
        stats.duplicatesRemoved += toDelete.length;
      } else {
        console.error(`    Erreur:`, delErr.message);
      }
    }
  }

  console.log('');
}

// Main
async function main() {
  console.log('🚀 Nettoyage des doublons et noms invalides\n');
  console.log('═══════════════════════════════════════════\n');

  await removeInvalidNames();
  await removeDuplicateNEQs();

  console.log('✅ NETTOYAGE TERMINÉ!\n');
  console.log('═══════════════════════════════════════════');
  console.log('📊 STATISTIQUES:');
  console.log('═══════════════════════════════════════════');
  console.log(`Noms invalides supprimés: ${stats.invalidNamesRemoved}`);
  console.log(`Doublons NEQ supprimés: ${stats.duplicatesRemoved}`);
  console.log(`TOTAL supprimés: ${stats.invalidNamesRemoved + stats.duplicatesRemoved}`);
  console.log('═══════════════════════════════════════════\n');
}

main();
