import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

async function previewNewSitemapUrls() {
  console.log('🔍 PREVIEW: 5 EXEMPLES D\'URLs POUR LES 429K ENTREPRISES\n');
  console.log('='.repeat(80));

  const baseUrl = 'https://registreduquebec.com';

  // Get 5 businesses WITHOUT main_category_slug (the 429k)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, main_category_slug, city, categories, name')
    .is('main_category_slug', null)
    .not('city', 'is', null)
    .not('slug', 'is', null)
    .limit(5);

  if (!businesses || businesses.length === 0) {
    console.log('❌ Aucune entreprise trouvée sans main_category_slug');
    return;
  }

  console.log('Ces 5 entreprises font partie des 429k qui seront AJOUTÉES au sitemap:\n');

  businesses.forEach((biz, i) => {
    // Use main_category_slug if available, otherwise use first category UUID
    let categoryPart = biz.main_category_slug;
    if (!categoryPart && biz.categories && biz.categories.length > 0) {
      categoryPart = biz.categories[0]; // UUID fallback
    }

    if (!categoryPart) {
      console.log(`${i + 1}. ❌ SKIP: ${biz.name} (pas de catégorie du tout)\n`);
      return;
    }

    const citySlug = generateSlug(biz.city);
    const url = `${baseUrl}/en/${categoryPart}/${citySlug}/${biz.slug}`;

    console.log(`${i + 1}. ${biz.name}`);
    console.log(`   Ville: ${biz.city}`);
    console.log(`   Catégorie: ${categoryPart} ${categoryPart.length === 36 ? '(UUID fallback)' : '(slug)'}`);
    console.log(`   URL: ${url}`);
    console.log(`   Longueur: ${url.length} caractères`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('📊 STATISTIQUES PRÉVUES:\n');

  const { count: withSlug } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_slug', 'is', null)
    .not('city', 'is', null)
    .not('slug', 'is', null);

  const { count: withoutSlugButHasCategory } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('main_category_slug', null)
    .not('city', 'is', null)
    .not('slug', 'is', null);

  console.log(`   Entreprises avec main_category_slug:    ${withSlug?.toLocaleString() || 0} (déjà dans sitemap)`);
  console.log(`   Entreprises sans main_category_slug:    ${withoutSlugButHasCategory?.toLocaleString() || 0} (à ajouter)`);
  console.log(`   TOTAL PRÉVU:                            ${((withSlug || 0) + (withoutSlugButHasCategory || 0)).toLocaleString()} URLs`);

  console.log('\n='.repeat(80));
  console.log('🎯 FORMAT DES URLs:\n');
  console.log('   Avec slug de catégorie:  /en/{category-slug}/{city}/{business}');
  console.log('   Avec UUID (fallback):    /en/{uuid}/{city}/{business}');
  console.log('\n   Les URLs avec UUID fonctionneront car ton routeur accepte déjà les UUIDs!');
  console.log('   Quand l\'entreprise sera claimée, main_category_slug sera assigné.');
  console.log('='.repeat(80));
}

previewNewSitemapUrls().catch(console.error);
