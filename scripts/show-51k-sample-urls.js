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

async function show51kSampleUrls() {
  console.log('🔍 EXEMPLES D\'URLs DANS LES 51K\n');
  console.log('='.repeat(80));

  // Get 5 businesses that have main_category_slug (the 51k that were already in sitemap)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, main_category_slug, city, name')
    .not('main_category_slug', 'is', null)
    .not('city', 'is', null)
    .not('slug', 'is', null)
    .limit(5);

  if (!businesses || businesses.length === 0) {
    console.log('❌ Aucune entreprise trouvée avec main_category_slug');
    return;
  }

  console.log('Ces 5 entreprises font partie des 51k déjà dans le sitemap:\n');

  businesses.forEach((biz, i) => {
    const citySlug = generateSlug(biz.city);
    const url = `https://registreduquebec.com/en/${biz.main_category_slug}/${citySlug}/${biz.slug}`;

    console.log(`${i + 1}. ${biz.name}`);
    console.log(`   Catégorie: ${biz.main_category_slug}`);
    console.log(`   Ville: ${biz.city}`);
    console.log(`   URL: ${url}`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('💡 FORMAT DES URLs AVEC SLUG:');
  console.log('   /en/{category-slug}/{city-slug}/{business-slug}');
  console.log('   Exemple: /en/restaurants/montreal/restaurant-xyz');
  console.log('='.repeat(80));
}

show51kSampleUrls().catch(console.error);
