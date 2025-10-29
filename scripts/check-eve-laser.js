import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBusiness() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', 'eve-laser-brossard')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Business data:');
  console.log('Name:', data.name);
  console.log('Slug:', data.slug);
  console.log('Owner ID:', data.owner_id);
  console.log('Logo URL:', data.logo_url);
  console.log('Created At:', data.created_at);

  // Check for logo related fields
  console.log('\n🖼️ Checking logo:');
  console.log('logo_url:', data.logo_url);
  console.log('Has logo:', !!data.logo_url);
}

checkBusiness();
