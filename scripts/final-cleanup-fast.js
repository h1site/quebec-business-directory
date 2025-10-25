import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  slugsUpdated: 0,
  errors: 0
};

// Générer slug propre SANS le NEQ
function generateCleanSlug(name) {
  if (!name) return 'entreprise';

  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

console.log('🚀 RÉGÉNÉRATION RAPIDE DES SLUGS (SANS NEQ)\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Charger TOUS les businesses restants
console.log('📥 Chargement des entreprises...\n');

let allBusinesses = [];
let from = 0;
const pageSize = 1000;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name')
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

// Générer les nouveaux slugs avec compteur pour doublons
console.log('🔄 Génération des slugs...\n');
const slugCounter = new Map();
const updates = [];

for (const business of allBusinesses) {
  const baseSlug = generateCleanSlug(business.name);
  const count = slugCounter.get(baseSlug) || 0;
  slugCounter.set(baseSlug, count + 1);

  const finalSlug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  updates.push({ id: business.id, slug: finalSlug });
}

console.log(`📊 ${updates.length} slugs à mettre à jour\n`);

// RAPIDE: Mettre à jour par batch avec Promise.all
console.log('⚡ Mise à jour RAPIDE avec Promise.all...\n');

const BATCH_SIZE = 50; // 50 updates parallèles
const TOTAL_BATCHES = Math.ceil(updates.length / BATCH_SIZE);

for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = updates.slice(i, i + BATCH_SIZE);
  const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

  // Exécuter toutes les updates du batch EN PARALLÈLE
  const promises = batch.map(update =>
    supabase
      .from('businesses')
      .update({ slug: update.slug })
      .eq('id', update.id)
      .then(({ error }) => {
        if (error) {
          stats.errors++;
          return false;
        }
        stats.slugsUpdated++;
        return true;
      })
  );

  await Promise.all(promises);

  // Log toutes les 10 batches (500 updates)
  if (currentBatch % 10 === 0 || currentBatch === TOTAL_BATCHES) {
    const percent = ((stats.slugsUpdated / updates.length) * 100).toFixed(1);
    console.log(`   ⚡ Batch ${currentBatch}/${TOTAL_BATCHES} - ${stats.slugsUpdated}/${updates.length} (${percent}%) - Erreurs: ${stats.errors}`);
  }
}

console.log('\n✅ RÉGÉNÉRATION TERMINÉE!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 STATISTIQUES FINALES:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Slugs régénérés: ${stats.slugsUpdated}`);
console.log(`Erreurs: ${stats.errors}`);
console.log(`Taux de succès: ${((stats.slugsUpdated / updates.length) * 100).toFixed(2)}%`);
console.log('═══════════════════════════════════════════════════════════\n');
