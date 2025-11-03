import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function findSlug() {
  const { data, error } = await supabase
    .from('businesses')
    .select('slug, name, city, description')
    .not('description', 'is', null)
    .neq('description', '')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Found businesses with descriptions:\n');
  data.forEach(b => {
    console.log(`Slug: ${b.slug}`);
    console.log(`Name: ${b.name}`);
    console.log(`City: ${b.city}`);
    console.log(`Description: ${b.description.substring(0, 80)}...`);
    console.log('---');
  });
}

findSlug();
