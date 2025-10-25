import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const stats = {
  found: 0,
  updated: 0,
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

console.log('🔧 CORRECTION DES SLUGS RESTANTS AVEC NEQ\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Trouver toutes les entreprises dont le slug se termine par un NEQ (10 chiffres)
console.log('🔍 Recherche des slugs avec NEQ...\n');

// Charger TOUTES les entreprises (il faut les scanner toutes)
let allBusinesses = [];
let from = 0;
const pageSize = 1000;
let hasMore = true;

while (hasMore) {
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, neq')
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

// Filtrer pour garder SEULEMENT ceux qui ont un NEQ à la fin (10 chiffres après le dernier tiret)
const businessesWithNEQ = allBusinesses.filter(b => {
  const parts = b.slug.split('-');
  const lastPart = parts[parts.length - 1];
  return /^\d{10}$/.test(lastPart); // Exactement 10 chiffres
});

stats.found = businessesWithNEQ.length;
console.log(`✅ Trouvé ${stats.found} entreprises avec NEQ dans le slug\n`);

if (stats.found === 0) {
  console.log('🎉 Aucune correction nécessaire!');
  process.exit(0);
}

// Montrer quelques exemples
console.log('📋 Exemples:');
businessesWithNEQ.slice(0, 5).forEach(b => {
  console.log(`   - ${b.name}: ${b.slug}`);
});
console.log();

// Générer les nouveaux slugs
console.log('🔄 Génération des nouveaux slugs...\n');

const slugCounter = new Map();
const updates = [];

for (const business of businessesWithNEQ) {
  const baseSlug = generateCleanSlug(business.name);
  const count = slugCounter.get(baseSlug) || 0;
  slugCounter.set(baseSlug, count + 1);

  const finalSlug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  updates.push({ id: business.id, oldSlug: business.slug, newSlug: finalSlug });
}

console.log(`📊 ${updates.length} slugs à corriger\n`);

// Mettre à jour par batch
console.log('⚡ Correction en cours...\n');

const BATCH_SIZE = 50;
const TOTAL_BATCHES = Math.ceil(updates.length / BATCH_SIZE);

for (let i = 0; i < updates.length; i += BATCH_SIZE) {
  const batch = updates.slice(i, i + BATCH_SIZE);
  const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

  const promises = batch.map(update =>
    supabase
      .from('businesses')
      .update({ slug: update.newSlug })
      .eq('id', update.id)
      .then(({ error }) => {
        if (error) {
          console.error(`   ❌ Erreur pour ${update.oldSlug}: ${error.message}`);
          stats.errors++;
          return false;
        }
        stats.updated++;
        return true;
      })
  );

  await Promise.all(promises);

  console.log(`   ⚡ Batch ${currentBatch}/${TOTAL_BATCHES} - ${stats.updated}/${updates.length} corrigés - Erreurs: ${stats.errors}`);
}

console.log('\n✅ CORRECTION TERMINÉE!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('📊 STATISTIQUES FINALES:');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Entreprises trouvées: ${stats.found}`);
console.log(`Slugs corrigés: ${stats.updated}`);
console.log(`Erreurs: ${stats.errors}`);
console.log(`Taux de succès: ${((stats.updated / stats.found) * 100).toFixed(2)}%`);
console.log('═══════════════════════════════════════════════════════════');
