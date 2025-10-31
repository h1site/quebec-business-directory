import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkCategoriesVsSlug() {
  console.log('🔍 COMPARAISON: categories (array) vs main_category_slug (text)\n');
  console.log('='.repeat(80));

  // 1. Businesses avec categories array rempli
  const { count: withCategoriesArray } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('categories', 'is', null);

  // Get sample with actual data
  const { data: sampleWithArray } = await supabase
    .from('businesses')
    .select('categories')
    .not('categories', 'is', null)
    .limit(1000);

  const nonEmptyArray = sampleWithArray?.filter(b => b.categories && b.categories.length > 0).length || 0;

  console.log('\n📊 Champ "categories" (array):');
  console.log(`   Total non-null: ${withCategoriesArray?.toLocaleString() || 0}`);
  console.log(`   Non-empty array: ~${nonEmptyArray} (sample de 1000)`);

  // 2. Businesses avec main_category_slug rempli
  const { count: withSlug } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_slug', 'is', null);

  console.log('\n📊 Champ "main_category_slug" (text):');
  console.log(`   Total: ${withSlug?.toLocaleString() || 0}`);

  // 3. Businesses avec main_category_id rempli
  const { count: withId } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  console.log('\n📊 Champ "main_category_id" (UUID):');
  console.log(`   Total: ${withId?.toLocaleString() || 0}`);

  // 4. Sample d'une entreprise avec les 3 champs
  console.log('\n📋 Exemple d\'entreprise:\n');

  const { data: sample } = await supabase
    .from('businesses')
    .select('name, act_econ_code, categories, main_category_id, main_category_slug')
    .not('act_econ_code', 'is', null)
    .limit(1)
    .single();

  if (sample) {
    console.log(`Entreprise: ${sample.name}`);
    console.log(`act_econ_code: ${sample.act_econ_code || 'NULL'}`);
    console.log(`categories (array): ${JSON.stringify(sample.categories)}`);
    console.log(`main_category_id: ${sample.main_category_id || 'NULL'}`);
    console.log(`main_category_slug: ${sample.main_category_slug || 'NULL'}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 ANALYSE');
  console.log('='.repeat(80));
  console.log(`
Le sitemap nécessite: main_category_slug (text)
Actuellement dans la DB:
  - categories (array): utilisé par l'app, mais contient des UUIDs
  - main_category_id: UUID, pas utilisable dans les URLs
  - main_category_slug: ${withSlug > 0 ? '✅ EXISTE' : '❌ MANQUANT'}

${withSlug === 0 ? '⚠️  Le champ main_category_slug doit être rempli pour que le sitemap fonctionne!' : '✅ Le champ main_category_slug est déjà rempli!'}
  `);

  console.log('='.repeat(80));
}

checkCategoriesVsSlug().catch(console.error);
