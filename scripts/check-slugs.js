import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSlugs() {
  console.log('🔍 Checking for existing slugs...\n');

  // Check for the specific slugs we're trying to insert
  const testSlugs = [
    'la-societe-cooperative-de-frais-funeraires-inc-neq-1140000093',
    '9000-0084-quebec-inc-neq-1140000135',
    'le-shack-du-mont-tremblant-neq-1140000564'
  ];

  for (const slug of testSlugs) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, neq')
      .eq('slug', slug)
      .single();

    if (data) {
      console.log(`❌ FOUND: ${slug}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   NEQ: ${data.neq}`);
      console.log('');
    } else {
      console.log(`✅ NOT FOUND: ${slug}`);
    }
  }

  // Check all businesses
  console.log('\n📊 All businesses in database:');
  const { data: allBiz, error: allError } = await supabase
    .from('businesses')
    .select('id, name, slug, neq, data_source');

  console.log(`Total businesses: ${allBiz?.length || 0}`);
  if (allBiz && allBiz.length > 0) {
    console.table(allBiz);
  }
}

checkSlugs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
