import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase
  .from('businesses')
  .select('*')
  .limit(1);

if (error) {
  console.error('Error:', error);
} else if (data && data[0]) {
  console.log('Available columns:');
  console.log(Object.keys(data[0]).sort().join('\n'));
}
