/**
 * Test script to show 10 description examples
 * 5 with categories, 5 without categories
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
  console.log('📝 EXEMPLES DE DESCRIPTIONS GÉNÉRÉES\n');
  console.log('═'.repeat(80));

  // Get 5 businesses WITH categories
  console.log('\n🏷️  5 ENTREPRISES AVEC CATÉGORIE:\n');

  const { data: withCategory } = await supabase
    .from('businesses_enriched')
    .select('name, city, region, primary_main_category_fr, primary_sub_category_fr, google_reviews_count, google_rating, website, description')
    .eq('is_claimed', false)
    .not('primary_main_category_fr', 'is', null)
    .neq('primary_main_category_fr', '')
    .not('description', 'is', null)
    .neq('description', '')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (withCategory && withCategory.length > 0) {
    withCategory.forEach((biz, i) => {
      console.log(`${i + 1}. ${biz.name} - ${biz.city}`);
      console.log(`   📍 Région: ${biz.region || 'N/A'}`);
      console.log(`   🏷️  Catégorie: ${biz.primary_main_category_fr}`);
      if (biz.primary_sub_category_fr) {
        console.log(`   📂 Sous-catégorie: ${biz.primary_sub_category_fr}`);
      }
      console.log(`   ⭐ Avis: ${biz.google_reviews_count || 0} (${biz.google_rating || 'N/A'})`);
      console.log(`   🌐 Site web: ${biz.website ? 'Oui' : 'Non'}`);
      console.log(`   📝 FR: ${biz.description}`);
      console.log('');
    });
  } else {
    console.log('   ❌ Aucune entreprise avec catégorie trouvée\n');
  }

  // Get 5 businesses WITHOUT categories
  console.log('═'.repeat(80));
  console.log('\n❌ 5 ENTREPRISES SANS CATÉGORIE:\n');

  const { data: withoutCategory } = await supabase
    .from('businesses_enriched')
    .select('name, city, region, google_reviews_count, google_rating, website, description')
    .eq('is_claimed', false)
    .or('primary_main_category_fr.is.null,primary_main_category_fr.eq.')
    .not('description', 'is', null)
    .neq('description', '')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (withoutCategory && withoutCategory.length > 0) {
    withoutCategory.forEach((biz, i) => {
      console.log(`${i + 1}. ${biz.name} - ${biz.city}`);
      console.log(`   📍 Région: ${biz.region || 'N/A'}`);
      console.log(`   🏷️  Catégorie: Aucune`);
      console.log(`   ⭐ Avis: ${biz.google_reviews_count || 0} (${biz.google_rating || 'N/A'})`);
      console.log(`   🌐 Site web: ${biz.website ? 'Oui' : 'Non'}`);
      console.log(`   📝 FR: ${biz.description}`);
      console.log('');
    });
  } else {
    console.log('   ❌ Aucune entreprise sans catégorie trouvée\n');
  }

  console.log('═'.repeat(80));
}

main().catch(console.error);
