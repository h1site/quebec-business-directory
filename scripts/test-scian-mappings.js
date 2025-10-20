import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMappings() {
  console.log('🔍 Test des mappings SCIAN dans la base de données\n');

  // Codes SCIAN de nos entreprises test
  const testCodes = ['4573', '6013', '7759', '8631', '4299', '7739', '9726', '1992'];

  for (const code of testCodes) {
    const { data, error } = await supabase
      .from('scian_category_mapping')
      .select('scian_code, description_fr, main_category_id, sub_category_id, confidence_level')
      .eq('scian_code', code)
      .single();

    if (data) {
      console.log(`✅ ${code}: ${data.description_fr}`);
      console.log(`   Main: ${data.main_category_id ? 'OUI' : 'NON'}, Sub: ${data.sub_category_id ? 'OUI' : 'NON'}, Confidence: ${data.confidence_level}%`);
    } else {
      console.log(`❌ ${code}: PAS TROUVÉ`);
    }
  }

  // Compter total
  const { count } = await supabase
    .from('scian_category_mapping')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total mappings dans la DB: ${count}`);
}

testMappings()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });
