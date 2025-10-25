import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  invalidNamesDeleted: 0,
  slugsUpdated: 0,
  errors: 0
};

// Générer un slug propre SANS le NEQ
function generateCleanSlug(name) {
  if (!name) return 'entreprise';

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, '-') // Espaces -> tirets
    .replace(/-+/g, '-') // Tirets multiples -> un seul
    .replace(/^-+|-+$/g, '') // Enlever tirets début/fin
    .substring(0, 50); // Limiter à 50 caractères
}

// 1. Supprimer les entreprises avec des noms invalides
async function deleteInvalidNames() {
  console.log('🧹 Suppression des noms invalides (commençant par des chiffres)...\n');

  // Charger toutes les entreprises
  const { data: allBusinesses, error } = await supabase
    .from('businesses')
    .select('id, name');

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  // Filtrer ceux avec des noms invalides (commencent par chiffres)
  const toDelete = [];
  allBusinesses.forEach(b => {
    if (b.name && /^\d/.test(b.name.trim())) {
      toDelete.push(b.id);
      if (toDelete.length <= 10) {
        console.log(`  ❌ ${b.name}`);
      }
    }
  });

  if (toDelete.length > 10) {
    console.log(`  ... et ${toDelete.length - 10} autres\n`);
  }

  console.log(`\n📊 Total à supprimer: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('✅ Aucun nom invalide trouvé\n');
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

    if (delErr) {
      console.error(`❌ Erreur batch:`, delErr.message);
      stats.errors++;
    } else {
      stats.invalidNamesDeleted += batch.length;
      console.log(`   Supprimés: ${stats.invalidNamesDeleted} / ${toDelete.length}`);
    }
  }

  console.log('');
}

// 2. Régénérer tous les slugs SANS le NEQ
async function regenerateAllSlugs() {
  console.log('🔄 Régénération de TOUS les slugs (sans NEQ)...\n');

  // Charger toutes les entreprises
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  const slugMap = new Map(); // baseSlug -> count

  while (hasMore) {
    console.log(`📥 Chargement ${from} à ${from + pageSize}...`);

    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name')
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('❌ Erreur:', error.message);
      break;
    }

    if (!businesses || businesses.length === 0) {
      hasMore = false;
      break;
    }

    // Générer les nouveaux slugs
    const updates = [];

    for (const business of businesses) {
      const baseSlug = generateCleanSlug(business.name);

      // Vérifier si ce slug existe déjà
      const count = slugMap.get(baseSlug) || 0;
      slugMap.set(baseSlug, count + 1);

      // Si doublon, ajouter -2, -3, etc.
      const finalSlug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;

      updates.push({
        id: business.id,
        slug: finalSlug
      });
    }

    // Mettre à jour par batch
    for (const update of updates) {
      const { error: updateErr } = await supabase
        .from('businesses')
        .update({ slug: update.slug })
        .eq('id', update.id);

      if (updateErr) {
        console.error(`❌ Erreur mise à jour ID ${update.id}:`, updateErr.message);
        stats.errors++;
      } else {
        stats.slugsUpdated++;
      }
    }

    console.log(`   Slugs mis à jour: ${stats.slugsUpdated}`);

    from += pageSize;
    hasMore = businesses.length === pageSize;
  }

  console.log('');
}

// Main
async function main() {
  console.log('🚀 Nettoyage des noms invalides + Régénération des slugs\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Supprimer les noms invalides
  await deleteInvalidNames();

  // 2. Régénérer tous les slugs
  await regenerateAllSlugs();

  console.log('✅ TERMINÉ!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES FINALES:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Noms invalides supprimés: ${stats.invalidNamesDeleted}`);
  console.log(`Slugs mis à jour: ${stats.slugsUpdated}`);
  console.log(`Erreurs: ${stats.errors}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main();
