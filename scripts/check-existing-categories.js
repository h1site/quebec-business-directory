import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCategories() {
  console.log('🔍 Vérification des catégories existantes...\n');

  const { data: categories, error } = await supabase
    .from('main_categories')
    .select('id, label_fr, label_en, slug')
    .order('label_fr');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Total catégories trouvées: ${categories?.length || 0}\n`);

  if (categories && categories.length > 0) {
    console.log('📋 LISTE DES CATÉGORIES:\n');
    categories.forEach(cat => {
      console.log(`   • ${cat.label_fr}`);
      console.log(`     EN: ${cat.label_en}`);
      console.log(`     Slug: ${cat.slug}`);
      console.log(`     ID: ${cat.id}`);
      console.log('');
    });
  } else {
    console.log('⚠️  Aucune catégorie trouvée dans main_categories');
  }

  // Vérifier aussi les slugs utilisés dans les businesses
  console.log('\n🔍 Vérification des slugs utilisés dans businesses...\n');

  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select('main_category_slug')
    .not('main_category_slug', 'is', null)
    .limit(1000);

  if (bizError) {
    console.error('❌ Erreur:', bizError);
    return;
  }

  const uniqueSlugs = [...new Set(businesses?.map(b => b.main_category_slug) || [])];
  console.log(`📊 Slugs uniques trouvés: ${uniqueSlugs.length}\n`);
  uniqueSlugs.sort().forEach(slug => {
    console.log(`   • ${slug}`);
  });
}

checkCategories();
