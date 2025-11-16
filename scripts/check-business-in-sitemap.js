import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const slug = process.argv[2];

if (!slug) {
  console.log('Usage: node scripts/check-business-in-sitemap.js <slug>');
  process.exit(1);
}

async function checkBusiness() {
  console.log(`\n🔍 Recherche de l'entreprise avec slug: ${slug}\n`);

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  if (!business) {
    console.log('❌ Entreprise non trouvée');
    return;
  }

  console.log('✅ Entreprise trouvée:\n');
  console.log(`Nom: ${business.name}`);
  console.log(`ID: ${business.id}`);
  console.log(`Ville: ${business.city}`);
  console.log(`Catégorie principale: ${business.main_category_slug || 'N/A'}`);
  console.log(`Primary main category: ${business.primary_main_category_slug || 'N/A'}`);
  console.log(`Créé le: ${business.created_at}`);
  console.log(`Mis à jour le: ${business.updated_at}`);
  console.log(`\nURL correcte devrait être:`);

  const categorySlug = business.main_category_slug || business.primary_main_category_slug || 'entreprise';
  const citySlug = business.city
    ? business.city.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    : 'quebec';

  const correctUrl = `https://registreduquebec.com/${categorySlug}/${citySlug}/${slug}`;
  console.log(correctUrl);
}

checkBusiness().then(() => process.exit(0));
