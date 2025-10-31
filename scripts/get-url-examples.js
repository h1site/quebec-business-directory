/**
 * Obtenir 5 exemples d'URLs FR vs EN pour les entreprises avec catégories
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

// Helper function to generate slug
function generateSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

console.log('🔍 EXEMPLES D\'URLs FRANÇAIS vs ANGLAIS');
console.log('═'.repeat(80));

const { data: businesses, error } = await supabase
  .from('businesses')
  .select('name, slug, city, main_category_slug')
  .not('main_category_slug', 'is', null)
  .limit(5);

if (error) {
  console.error('❌ Erreur:', error);
  process.exit(1);
}

if (!businesses || businesses.length === 0) {
  console.log('⚠️  Aucune entreprise trouvée avec main_category_slug');
  process.exit(0);
}

businesses.forEach((biz, index) => {
  const citySlug = generateSlug(biz.city);
  const urlFr = `https://registreduquebec.com/entreprise/${citySlug}/${biz.slug}`;
  const urlEn = `https://registreduquebec.com/en/${biz.main_category_slug}/${citySlug}/${biz.slug}`;

  console.log(`\n${index + 1}. ${biz.name}`);
  console.log(`   Ville: ${biz.city}`);
  console.log(`   Catégorie: ${biz.main_category_slug}`);
  console.log(`   🇫🇷 FR: ${urlFr}`);
  console.log(`   🇬🇧 EN: ${urlEn}`);
});

console.log('\n' + '═'.repeat(80));
