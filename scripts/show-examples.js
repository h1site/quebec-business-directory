/**
 * Show 3 examples of generated descriptions (FR + EN)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function main() {
  console.log('📄 EXEMPLES DE DESCRIPTIONS GÉNÉRÉES (FR + EN)\n');
  console.log('═'.repeat(80));

  // Query businesses table directly since description_en is not in the view
  const { data: examples, error } = await supabase
    .from('businesses')
    .select('name, city, description, description_en')
    .not('description', 'is', null)
    .neq('description', '')
    .not('description_en', 'is', null)
    .neq('description_en', '')
    .order('updated_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  if (!examples || examples.length === 0) {
    console.log('❌ Aucun exemple trouvé');
    return;
  }

  examples.forEach((ex, i) => {
    console.log(`\n${i + 1}. ${ex.name} - ${ex.city}`);
    console.log('─'.repeat(80));
    console.log(`\n🇫🇷 FRANÇAIS:`);
    console.log(`${ex.description}`);
    console.log(`\n🇬🇧 ENGLISH:`);
    console.log(`${ex.description_en}`);
    console.log('\n' + '═'.repeat(80));
  });
}

main().catch(console.error);
