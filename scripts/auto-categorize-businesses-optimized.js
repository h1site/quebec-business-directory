import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const BATCH_SIZE = 1000;

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

  return null;
}

async function autoCategorizeBusinesses() {
  console.log('\n🏷️  Auto-catégorisation des entreprises (OPTIMIZED)\n');
  console.log('Strategy:');
  console.log('1. Si categories[] existe → utiliser première catégorie');
  console.log('2. Si scian_description existe → utiliser SCIAN');
  console.log('3. Détecter catégorie par mots-clés (nom + description)');
  console.log('4. Fallback: "services-professionnels"\n');
  console.log('🚀 Using cursor pagination (ID-based) to avoid timeouts\n');

  let totalProcessed = 0;
  let categorizedFromPrimary = 0;
  let categorizedFromKeywords = 0;
  let categorizedAsFallback = 0;
  let alreadyHaveCategory = 0;
  let skippedNeedingCategory = 0;
  let errors = 0;

  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    console.log(`\n📦 Fetching batch (lastId: ${lastId || 'start'})...`);

    // Fetch ALL businesses using cursor pagination (no filter in query)
    let query = supabase
      .from('businesses')
      .select('id, slug, name, description, categories, scian_description, main_category_slug')
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: businesses, error } = await query;

    if (error) {
      console.error(`❌ Erreur fetch: ${error.message}`);
      errors++;
      break;
    }

    if (!businesses || businesses.length === 0) {
      hasMore = false;
      break;
    }

    // Filter in code for businesses WITHOUT main_category_slug
    const needsCategorization = businesses.filter(biz =>
      !biz.main_category_slug || biz.main_category_slug.trim().length === 0
    );

    console.log(`   📊 Batch: ${businesses.length} total, ${needsCategorization.length} need categorization`);

    // Process each business that needs categorization
    const updates = [];

    for (const biz of needsCategorization) {
      let newCategorySlug = null;

      // Method 1: Use categories array (first category)
      if (biz.categories && Array.isArray(biz.categories) && biz.categories.length > 0 && biz.categories[0]) {
        newCategorySlug = generateSlug(biz.categories[0]);
        categorizedFromPrimary++;
      }
      // Method 2: Use SCIAN description
      else if (biz.scian_description && biz.scian_description.trim().length > 0) {
        newCategorySlug = generateSlug(biz.scian_description);
        categorizedFromPrimary++;
      }
      // Method 3: Keyword detection
      else {
        const detected = detectCategory(biz.name, biz.description);
        if (detected) {
          newCategorySlug = detected;
          categorizedFromKeywords++;
        }
        // Method 4: Fallback
        else {
          newCategorySlug = 'services-professionnels';
          categorizedAsFallback++;
        }
      }

      if (newCategorySlug) {
        updates.push({
          id: biz.id,
          main_category_slug: newCategorySlug
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
    alreadyHaveCategory += (businesses.length - needsCategorization.length);
    skippedNeedingCategory += needsCategorization.length - updates.length;

    console.log(`   📊 Total traité: ${totalProcessed.toLocaleString()}`);
    console.log(`   ✅ Catégorisé depuis categories[]/SCIAN: ${categorizedFromPrimary.toLocaleString()}`);
    console.log(`   🔍 Catégorisé par mots-clés: ${categorizedFromKeywords.toLocaleString()}`);
    console.log(`   📋 Catégorisé comme fallback: ${categorizedAsFallback.toLocaleString()}`);

    // Move cursor forward
    lastId = businesses[businesses.length - 1].id;

    if (businesses.length < BATCH_SIZE) {
      hasMore = false;
    }

    // Small pause to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
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
