import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

async function preview5Examples() {
  console.log('📋 PREVIEW: 5 EXEMPLES AVANT/APRÈS\n');
  console.log('='.repeat(80));

  // Get 5 businesses with act_econ != "0000" and no main_category_slug
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, act_econ_code, main_category_slug, city, slug, categories')
    .is('main_category_slug', null)
    .not('act_econ_code', 'is', null)
    .neq('act_econ_code', '0000')
    .neq('act_econ_code', '0001')
    .not('city', 'is', null)
    .not('slug', 'is', null)
    .limit(5);

  if (!businesses || businesses.length === 0) {
    console.log('❌ Aucune entreprise trouvée');
    return;
  }

  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];

    // Calculate rounded code
    const first2Digits = parseInt(biz.act_econ_code.substring(0, 2));
    const roundedCode = (first2Digits * 100).toString().padStart(4, '0');

    // Find mapping
    const { data: mapping } = await supabase
      .from('act_econ_to_main_category')
      .select('act_econ_code, main_category_id')
      .eq('act_econ_code', roundedCode)
      .single();

    if (!mapping) {
      console.log(`${i + 1}. ❌ ${biz.name}`);
      console.log(`   act_econ: ${biz.act_econ_code} → ${roundedCode} (pas de mapping)`);
      console.log('');
      continue;
    }

    // Get category details
    const { data: category } = await supabase
      .from('main_categories')
      .select('slug, label_fr')
      .eq('id', mapping.main_category_id)
      .single();

    if (!category) {
      console.log(`${i + 1}. ❌ ${biz.name} (catégorie introuvable)`);
      console.log('');
      continue;
    }

    const citySlug = generateSlug(biz.city);
    const baseUrl = 'https://registreduquebec.com';

    // Calculate BEFORE URL (with UUID fallback)
    let beforeCategoryPart = biz.main_category_slug;
    if (!beforeCategoryPart && biz.categories && biz.categories.length > 0) {
      beforeCategoryPart = biz.categories[0]; // UUID
    }
    if (!beforeCategoryPart) {
      beforeCategoryPart = '[PAS DE CATÉGORIE]';
    }

    const urlBefore = `${baseUrl}/en/${beforeCategoryPart}/${citySlug}/${biz.slug}`;
    const urlAfter = `${baseUrl}/en/${category.slug}/${citySlug}/${biz.slug}`;

    console.log(`${i + 1}. ✅ ${biz.name}`);
    console.log(`   Ville: ${biz.city}`);
    console.log(`   ACT_ECON: ${biz.act_econ_code} → ${roundedCode}`);
    console.log(`   Catégorie: ${category.label_fr}`);
    console.log('');
    console.log(`   📍 URL AVANT:  ${urlBefore}`);
    console.log(`   📍 URL APRÈS:  ${urlAfter}`);
    console.log(`   Longueur: ${urlBefore.length} → ${urlAfter.length} caractères`);
    console.log('');
  }

  console.log('='.repeat(80));
  console.log('📊 RÉSUMÉ DU CHANGEMENT\n');

  const { count: totalToChange } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('main_category_slug', null)
    .not('act_econ_code', 'is', null)
    .neq('act_econ_code', '0000')
    .neq('act_econ_code', '0001');

  const { count: total0000 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('act_econ_code', '0000');

  const { count: total0001 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('act_econ_code', '0001');

  console.log(`✅ Entreprises qui recevront une catégorie:    ${totalToChange?.toLocaleString() || 0}`);
  console.log(`⚠️  Entreprises ignorées (code 0000):          ${total0000?.toLocaleString() || 0}`);
  console.log(`⚠️  Entreprises ignorées (code 0001):          ${total0001?.toLocaleString() || 0}`);
  console.log('');
  console.log('💡 Les URLs avec UUID seront remplacées par des URLs avec slug de catégorie');
  console.log('💡 Les entreprises avec code 0000/0001 garderont UUID (pas de catégorie assignée)');
  console.log('='.repeat(80));
}

preview5Examples().catch(console.error);
