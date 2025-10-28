import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkMainCategorySlug() {
  console.log('🔍 Vérification de main_category_slug dans businesses...\n');
  console.log('='.repeat(80));

  // 1. Get a business with main_category_id
  console.log('\n1️⃣ Échantillon d\'entreprises avec main_category_id:\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, main_category_id')
    .eq('main_category_id', 'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9')
    .limit(3);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('Colonnes dans businesses:');
  if (businesses && businesses.length > 0) {
    console.log(Object.keys(businesses[0]).join(', '));
    console.log('');

    businesses.forEach(biz => {
      console.log(`- ${biz.name}`);
      console.log(`  main_category_id: ${biz.main_category_id}`);
      console.log(`  main_category_slug: ${biz.main_category_slug || 'MANQUANT'}`);
      console.log('');
    });
  }

  // 2. Check if main_category_slug column exists in businesses table
  console.log('\n2️⃣ Vérification de la colonne main_category_slug dans businesses:\n');

  const { data: singleBiz } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single();

  if (singleBiz) {
    const hasSlug = 'main_category_slug' in singleBiz;
    console.log(`Colonne main_category_slug existe: ${hasSlug ? '✅ OUI' : '❌ NON'}`);

    if (!hasSlug) {
      console.log('\n⚠️  La colonne main_category_slug N\'EXISTE PAS dans businesses!');
      console.log('   C\'est pour ça que les URLs utilisent l\'UUID.\n');
    }
  }

  // 3. Check businesses_enriched view
  console.log('\n3️⃣ Vérification de businesses_enriched (vue):\n');

  const { data: enrichedBiz, error: enrichedError } = await supabase
    .from('businesses_enriched')
    .select('*')
    .eq('main_category_id', 'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9')
    .limit(1)
    .single();

  if (enrichedError) {
    console.log('❌ businesses_enriched n\'existe pas ou erreur:', enrichedError.message);
  } else if (enrichedBiz) {
    console.log('✅ businesses_enriched existe');
    console.log(`Colonnes: ${Object.keys(enrichedBiz).join(', ')}`);

    const hasSlugInView = 'main_category_slug' in enrichedBiz ||
                          'primary_main_category_slug' in enrichedBiz;

    console.log(`\nContient main_category_slug: ${hasSlugInView ? '✅ OUI' : '❌ NON'}`);

    if (hasSlugInView) {
      console.log(`Valeur: ${enrichedBiz.main_category_slug || enrichedBiz.primary_main_category_slug}`);
    }
  }

  // 4. Recommandation
  console.log('\n' + '='.repeat(80));
  console.log('💡 DIAGNOSTIC ET SOLUTION');
  console.log('='.repeat(80));

  console.log('\n🔧 PROBLÈME:');
  console.log('   Les entreprises ont main_category_id (UUID) mais pas main_category_slug');
  console.log('   → Le code urlHelpers.js utilise main_category_slug en priorité');
  console.log('   → Quand il est absent, il fallback sur categories[0] qui contient l\'UUID');
  console.log('   → Résultat: URL avec UUID au lieu de slug\n');

  console.log('✅ SOLUTIONS:');
  console.log('\n   Option 1: Ajouter une colonne main_category_slug dans businesses');
  console.log('   ────────────────────────────────────────────────────────────────');
  console.log('   ALTER TABLE businesses ADD COLUMN main_category_slug TEXT;');
  console.log('   UPDATE businesses b');
  console.log('   SET main_category_slug = mc.slug');
  console.log('   FROM main_categories mc');
  console.log('   WHERE b.main_category_id = mc.id;\n');

  console.log('   Option 2: Modifier businesses_enriched pour inclure le slug');
  console.log('   ────────────────────────────────────────────────────────────────');
  console.log('   CREATE OR REPLACE VIEW businesses_enriched AS');
  console.log('   SELECT b.*, mc.slug as main_category_slug, mc.label_fr as main_category_name');
  console.log('   FROM businesses b');
  console.log('   LEFT JOIN main_categories mc ON b.main_category_id = mc.id;\n');

  console.log('   Option 3: Modifier le code front-end pour faire la jointure');
  console.log('   ────────────────────────────────────────────────────────────────');
  console.log('   Dans businessService.js, faire un SELECT avec jointure:');
  console.log('   .select(`*, main_category:main_categories(slug, label_fr)`)\n');

  console.log('🏆 RECOMMANDATION: Option 2 (Vue enrichie)');
  console.log('   → Pas de modification de la structure de la table');
  console.log('   → Centralisé dans la vue');
  console.log('   → Le code front-end utilise déjà businesses_enriched');

  console.log('\n' + '='.repeat(80));
}

checkMainCategorySlug().catch(console.error);
