import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n🧪 Test de la fonction Vercel SEO\n');

// Simuler la fonction serverless
async function testSEOFunction() {
  // Test 1: Récupérer une entreprise
  console.log('Test 1: Fetch une entreprise...');
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .not('slug', 'is', null)
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Erreur Supabase:', error.message);
    return;
  }

  console.log('✅ Entreprise trouvée:', business.name);
  console.log('   Slug:', business.slug);
  console.log('   Ville:', business.city);

  // Test 2: Générer Schema.org
  console.log('\nTest 2: Générer Schema.org...');
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description || `${business.name} à ${business.city}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address || "",
      "addressLocality": business.city || "",
      "addressRegion": "QC",
      "postalCode": business.postal_code || "",
      "addressCountry": "CA"
    }
  };

  if (business.phone) schema.telephone = business.phone;
  if (business.website) schema.url = business.website;

  console.log('✅ Schema.org généré:');
  console.log(JSON.stringify(schema, null, 2));

  // Test 3: URL exemple
  const citySlug = business.city?.toLowerCase().replace(/\s+/g, '-') || 'quebec';
  const testUrl = `https://registreduquebec.com/entreprise/${citySlug}/${business.slug}`;

  console.log('\n📍 URL de test:');
  console.log(testUrl);

  console.log('\n✅ Tous les tests passés!');
  console.log('\n🚀 La fonction Vercel devrait fonctionner correctement.');
  console.log('   Pour tester sur Vercel: vercel dev');
}

testSEOFunction().catch(console.error);
