import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function viewSamples() {
  console.log('📋 Recherche d\'exemples avec la nouvelle description...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, city, description')
    .ilike('description', 'Il est possible%')
    .limit(5);

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  if (!businesses || businesses.length === 0) {
    console.log('Aucune entreprise trouvée avec la nouvelle description.');
    return;
  }

  console.log(`✅ ${businesses.length} exemples trouvés:\n`);

  businesses.forEach((b, i) => {
    console.log(`${i + 1}. ${b.name} - ${b.city}`);
    console.log(`   ${b.description}\n`);
  });
}

viewSamples();
