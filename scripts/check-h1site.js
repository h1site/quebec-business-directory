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

async function checkH1Site() {
  console.log('Checking businesses_enriched view (all columns):');
  const { data: enriched, error: enrichedError } = await supabase
    .from('businesses_enriched')
    .select('*')
    .eq('slug', 'h1site')
    .single();

  if (enrichedError) {
    console.error('Error from businesses_enriched:', enrichedError);
  } else {
    console.log('H1Site data from businesses_enriched (category fields only):');
    const categoryFields = {
      name: enriched.name,
      slug: enriched.slug,
      primary_main_category_fr: enriched.primary_main_category_fr,
      primary_main_category_en: enriched.primary_main_category_en,
      primary_sub_category_fr: enriched.primary_sub_category_fr,
      primary_sub_category_en: enriched.primary_sub_category_en,
      primary_main_category_slug: enriched.primary_main_category_slug,
      primary_sub_category_slug: enriched.primary_sub_category_slug,
      main_category_id: enriched.main_category_id,
      sub_category_ids: enriched.sub_category_ids
    };
    console.log(JSON.stringify(categoryFields, null, 2));
  }
}

checkH1Site();
