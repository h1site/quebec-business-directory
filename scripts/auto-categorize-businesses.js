import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BATCH_SIZE = 1000; // Process 1000 at a time to avoid timeouts

// Helper to generate slug
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Keyword-based category detection
const CATEGORY_KEYWORDS = {
  'restauration': ['restaurant', 'cafe', 'bistro', 'brasserie', 'cantine', 'traiteur', 'pizzeria', 'bar'],
  'construction': ['construction', 'entrepreneur', 'renovation', 'plomberie', 'electricite', 'charpentier', 'menuisier'],
  'sante-et-bien-etre': ['sante', 'clinique', 'medecin', 'dentiste', 'physiotherapie', 'massotherapie', 'yoga'],
  'commerce-de-detail': ['boutique', 'magasin', 'commerce', 'vente', 'detail'],
  'services-professionnels': ['comptable', 'avocat', 'notaire', 'consultant', 'gestion', 'conseil'],
  'immobilier': ['immobilier', 'courtier', 'agence immobiliere', 'evaluation'],
  'automobile': ['automobile', 'mecanique', 'garage', 'pneu', 'carrosserie'],
  'education-et-formation': ['ecole', 'formation', 'education', 'cours', 'enseignement', 'college'],
  'technologie': ['informatique', 'developpement', 'web', 'logiciel', 'technologie', 'it'],
  'beaute-et-soins': ['coiffure', 'esthetique', 'spa', 'beaute', 'salon'],
  'transport-et-logistique': ['transport', 'livraison', 'demenagement', 'logistique', 'entreposage'],
  'finance-et-assurance': ['banque', 'assurance', 'finance', 'investissement', 'pret'],
  'hebergement': ['hotel', 'motel', 'auberge', 'hebergement', 'gite'],
  'agriculture': ['ferme', 'agricole', 'agriculture', 'elevage', 'maraicher'],
  'industrie-manufacturiere': ['fabrication', 'manufacture', 'usine', 'production', 'industriel']
};

// Detect category from text (name + description)
function detectCategory(name, description) {
  const text = `${name} ${description || ''}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return null; // No match found
}

async function autoCategorizeBusinesses() {
  console.log('\n🏷️  Auto-catégorisation des entreprises\n');
  console.log('Strategy:');
  console.log('1. Si categories[] existe → utiliser première catégorie');
  console.log('2. Si scian_description existe → utiliser SCIAN');
  console.log('3. Détecter catégorie par mots-clés (nom + description)');
  console.log('4. Fallback: "services-professionnels"\n');

  let totalProcessed = 0;
  let categorizedFromPrimary = 0;
  let categorizedFromKeywords = 0;
  let categorizedAsFallback = 0;
  let alreadyHaveCategory = 0;
  let errors = 0;

  // Count total businesses without main_category_slug
  const { count: totalWithout } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .or('main_category_slug.is.null,main_category_slug.eq.');

  console.log(`📊 Total entreprises sans main_category_slug: ${totalWithout?.toLocaleString()}\n`);

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`\n📦 Batch offset ${offset.toLocaleString()}...`);

    // Fetch businesses without main_category_slug
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, slug, name, description, categories, scian_description, main_category_slug')
      .or('main_category_slug.is.null,main_category_slug.eq.')
      .order('id', { ascending: true })
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      console.error(`❌ Erreur fetch: ${error.message}`);
      errors++;
      offset += BATCH_SIZE;
      continue;
    }

    if (!businesses || businesses.length === 0) {
      hasMore = false;
      break;
    }

    // Process each business
    const updates = [];

    for (const biz of businesses) {
      let newCategorySlug = null;
      let method = '';

      // Skip if already has category (data changed during script execution)
      if (biz.main_category_slug && biz.main_category_slug.trim().length > 0) {
        alreadyHaveCategory++;
        continue;
      }

      // Method 1: Use categories array (first category)
      if (biz.categories && Array.isArray(biz.categories) && biz.categories.length > 0 && biz.categories[0]) {
        newCategorySlug = generateSlug(biz.categories[0]);
        method = 'categories_array';
        categorizedFromPrimary++;
      }
      // Method 2: Use SCIAN description
      else if (biz.scian_description && biz.scian_description.trim().length > 0) {
        newCategorySlug = generateSlug(biz.scian_description);
        method = 'scian';
        categorizedFromPrimary++;
      }
      // Method 3: Keyword detection
      else {
        const detected = detectCategory(biz.name, biz.description);
        if (detected) {
          newCategorySlug = detected;
          method = 'keyword';
          categorizedFromKeywords++;
        }
        // Method 4: Fallback
        else {
          newCategorySlug = 'services-professionnels';
          method = 'fallback';
          categorizedAsFallback++;
        }
      }

      if (newCategorySlug) {
        updates.push({
          id: biz.id,
          main_category_slug: newCategorySlug,
          method
        });
      }
    }

    // Batch update
    if (updates.length > 0) {
      console.log(`   ⚙️  Mise à jour de ${updates.length} entreprises...`);

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ main_category_slug: update.main_category_slug })
          .eq('id', update.id);

        if (updateError) {
          console.error(`   ❌ Erreur update ${update.id}: ${updateError.message}`);
          errors++;
        }
      }

      console.log(`   ✅ ${updates.length} mises à jour effectuées`);
    }

    totalProcessed += businesses.length;
    console.log(`   📊 Total traité: ${totalProcessed.toLocaleString()}`);

    offset += BATCH_SIZE;

    if (businesses.length < BATCH_SIZE) {
      hasMore = false;
    }

    // Pause to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('\n\n🎉 TERMINÉ!\n');
  console.log('📊 Statistiques:');
  console.log(`   Total traité: ${totalProcessed.toLocaleString()}`);
  console.log(`   Déjà catégorisé: ${alreadyHaveCategory.toLocaleString()}`);
  console.log(`   Catégorisé depuis categories[] ou SCIAN: ${categorizedFromPrimary.toLocaleString()}`);
  console.log(`   Catégorisé par mots-clés: ${categorizedFromKeywords.toLocaleString()}`);
  console.log(`   Catégorisé comme fallback (services-professionnels): ${categorizedAsFallback.toLocaleString()}`);
  console.log(`   Erreurs: ${errors.toLocaleString()}\n`);

  // Verify final count
  const { count: remaining } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .or('main_category_slug.is.null,main_category_slug.eq.');

  console.log(`✅ Entreprises restantes sans catégorie: ${remaining?.toLocaleString()}\n`);
}

autoCategorizeBusinesses()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
  });
