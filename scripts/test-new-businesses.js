import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testNewBusinesses() {
  console.log('🧪 Test du composant ThanksPartners...\n');

  // Même requête que le composant (CORRIGÉE avec vraies colonnes)
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name, slug, city, categories, main_category_slug')
    .in('data_source', ['manual', 'user_created'])
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`✅ ${data.length} entreprises trouvées:\n`);

  data.forEach((business, i) => {
    console.log(`${i + 1}. ${business.name}`);
    console.log(`   Ville: ${business.city || 'N/A'}`);
    console.log(`   Slug: ${business.slug || 'N/A'}`);
    console.log(`   Catégories: ${business.categories || 'N/A'}`);
    console.log(`   Main Category Slug: ${business.main_category_slug || 'NULL'}`);

    // Test génération URL (comme dans le composant)
    const businessUrl = business.main_category_slug && business.city
      ? `/${business.main_category_slug}/${business.city.toLowerCase().replace(/\s+/g, '-')}/${business.slug}`
      : `/entreprise/${business.slug}`;

    console.log(`   URL générée: ${businessUrl}`);
    console.log('');
  });

  // Vérifier si le composant s'afficherait
  if (data.length === 0) {
    console.log('❌ Le composant ne s\'affichera pas (return null)');
  } else {
    console.log('✅ Le composant devrait s\'afficher avec ces données');
  }
}

testNewBusinesses();
