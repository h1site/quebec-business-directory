import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkView() {
  console.log('🔍 Checking businesses_enriched view for eve-laser-brossard...\n');

  const { data, error } = await supabase
    .from('businesses_enriched')
    .select('id, name, slug, logo_url')
    .eq('slug', 'eve-laser-brossard')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Data from businesses_enriched view:');
  console.log('ID:', data.id);
  console.log('Name:', data.name);
  console.log('Slug:', data.slug);
  console.log('Logo URL:', data.logo_url);
  console.log('\n✅ Logo exists in view:', !!data.logo_url);
}

checkView();
