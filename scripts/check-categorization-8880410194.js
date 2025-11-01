/**
 * Vérifier comment NEQ 8880410194 a été catégorisé
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Vérification NEQ 8880410194 - Office d\'habitation du Sud des Appalaches\n');

const { data: biz, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('neq', '8880410194')
  .single();

if (error) {
  console.log('❌ Erreur:', error.message);
  process.exit(1);
}

console.log('📋 INFORMATIONS ENTREPRISE:');
console.log('Nom:', biz.name);
console.log('Description:', biz.description?.substring(0, 300) || 'NULL');
console.log('');
console.log('📂 CATÉGORISATION:');
console.log('act_econ_code:', biz.act_econ_code);
console.log('main_category_slug:', biz.main_category_slug || 'NULL');
console.log('categories (UUIDs):', JSON.stringify(biz.categories));
console.log('');

// Si categories contient des UUIDs, récupérer les noms
if (biz.categories && biz.categories.length > 0) {
  console.log('🔎 Récupération des noms de catégories...\n');

  const { data: cats } = await supabase
    .from('main_categories')
    .select('id, name_fr, name_en, slug')
    .in('id', biz.categories);

  if (cats && cats.length > 0) {
    cats.forEach(cat => {
      console.log(`  ✓ ${cat.name_fr} (${cat.name_en})`);
      console.log(`    Slug: ${cat.slug}`);
      console.log(`    UUID: ${cat.id}`);
      console.log('');
    });
  }
}

console.log('🔤 MOTS-CLÉS ET SEO:');
console.log('seo_primary_keyword:', biz.seo_primary_keyword || 'NULL');
console.log('seo_secondary_keywords:', biz.seo_secondary_keywords || 'NULL');
console.log('');

// Chercher d'autres entreprises avec code 0001 dans la catégorie technologie
console.log('📊 Vérification: Combien d\'entreprises avec act_econ_code="0001" sont dans "technologie"?\n');

const { data: techCat } = await supabase
  .from('main_categories')
  .select('id, name_fr, slug')
  .eq('slug', 'technologie-et-information')
  .single();

if (techCat) {
  console.log('Catégorie Technologie UUID:', techCat.id);

  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('act_econ_code', '0001')
    .contains('categories', [techCat.id]);

  console.log('Nombre d\'entreprises avec code "0001" dans technologie:', count);

  // Échantillon
  const { data: sample } = await supabase
    .from('businesses')
    .select('neq, name, act_econ_code, description')
    .eq('act_econ_code', '0001')
    .contains('categories', [techCat.id])
    .limit(10);

  if (sample && sample.length > 0) {
    console.log('\n📋 Échantillon 10 entreprises "0001" catégorisées en technologie:\n');
    sample.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name} (NEQ: ${b.neq})`);
      console.log(`   Description: ${b.description?.substring(0, 150) || 'NULL'}`);
      console.log('');
    });
  }
}
