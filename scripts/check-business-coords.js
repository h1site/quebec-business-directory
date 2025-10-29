import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const slug = 'ia-gestion-privee-de-patrimoine-inc-1176472687-22';

const { data, error } = await supabase
  .from('businesses_enriched')
  .select('id, name, slug, latitude, longitude, city, address')
  .eq('slug', slug)
  .single();

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log('✅ Business found:');
  console.log('   Name:', data.name);
  console.log('   City:', data.city);
  console.log('   Address:', data.address);
  console.log('   Latitude:', data.latitude);
  console.log('   Longitude:', data.longitude);
  console.log('   Has coordinates:', !!(data.latitude && data.longitude));

  if (data.latitude && data.longitude) {
    const wazeUrl = `https://waze.com/ul?ll=${data.latitude},${data.longitude}&navigate=yes&utm_source=registreduquebec`;
    console.log('\n🚗 Waze URL:', wazeUrl);
  } else {
    console.log('\n⚠️  No coordinates - Waze button will NOT appear');
  }
}
