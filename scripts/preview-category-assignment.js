import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function previewCategoryAssignment() {
  console.log('🔍 PREVIEW: ASSIGNATION DE CATÉGORIES\n');
  console.log('='.repeat(80));

  // Get 5 businesses with act_econ != "0001" and no main_category_slug
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, act_econ_code, main_category_slug, city, slug')
    .is('main_category_slug', null)
    .not('act_econ_code', 'is', null)
    .neq('act_econ_code', '0001')
    .not('city', 'is', null)
    .not('slug', 'is', null)
    .limit(5);

  if (!businesses || businesses.length === 0) {
    console.log('❌ Aucune entreprise trouvée avec act_econ valide');
    return;
  }

  console.log('Ces 5 entreprises recevront une catégorie basée sur act_econ:\n');

  for (const biz of businesses) {
    // Try to find mapping with first 4 digits
    const code4 = biz.act_econ_code.substring(0, 4);
    const code3 = biz.act_econ_code.substring(0, 3);
    const code2 = biz.act_econ_code.substring(0, 2);

    // Try exact match first
    let { data: mapping } = await supabase
      .from('act_econ_category_mappings')
      .select('act_econ_code, main_category_id')
      .eq('act_econ_code', biz.act_econ_code)
      .single();

    // Try 4 digits
    if (!mapping) {
      const result = await supabase
        .from('act_econ_category_mappings')
        .select('act_econ_code, main_category_id')
        .eq('act_econ_code', code4)
        .single();
      mapping = result.data;
    }

    // Try 3 digits
    if (!mapping) {
      const result = await supabase
        .from('act_econ_category_mappings')
        .select('act_econ_code, main_category_id')
        .eq('act_econ_code', code3)
        .single();
      mapping = result.data;
    }

    // Try 2 digits
    if (!mapping) {
      const result = await supabase
        .from('act_econ_category_mappings')
        .select('act_econ_code, main_category_id')
        .eq('act_econ_code', code2)
        .single();
      mapping = result.data;
    }

    if (mapping) {
      // Get the category slug
      const { data: category } = await supabase
        .from('main_categories')
        .select('slug, label_fr')
        .eq('id', mapping.main_category_id)
        .single();

      if (category) {
        console.log(`✅ ${biz.name}`);
        console.log(`   act_econ: ${biz.act_econ_code} → ${mapping.act_econ_code} (${code4 === mapping.act_econ_code ? 'exact' : 'approx'})`);
        console.log(`   Catégorie: ${category.label_fr}`);
        console.log(`   Slug: ${category.slug}`);
        console.log(`   URL AVANT: /en/{UUID}/${biz.city}/${biz.slug}`);
        console.log(`   URL APRÈS: /en/${category.slug}/${biz.city}/${biz.slug}`);
        console.log('');
      }
    } else {
      console.log(`❌ ${biz.name}`);
      console.log(`   act_econ: ${biz.act_econ_code} → PAS DE MAPPING`);
      console.log(`   Restera avec UUID dans l'URL`);
      console.log('');
    }
  }

  // Count how many will be assigned
  console.log('='.repeat(80));
  console.log('📊 STATISTIQUES ESTIMÉES:\n');

  const { count: total } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('main_category_slug', null)
    .not('act_econ_code', 'is', null)
    .neq('act_econ_code', '0001');

  const { count: with0001 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('main_category_slug', null)
    .eq('act_econ_code', '0001');

  console.log(`   Entreprises avec act_econ valide (≠ 0001):  ${total?.toLocaleString() || 0}`);
  console.log(`   Entreprises avec act_econ = "0001":         ${with0001?.toLocaleString() || 0} (seront ignorées)`);
  console.log(`   Total à traiter:                             ${total?.toLocaleString() || 0}`);

  console.log('\n='.repeat(80));
  console.log('💡 LOGIQUE D\'ASSIGNATION:\n');
  console.log('   1. Cherche mapping exact pour le code complet');
  console.log('   2. Si pas trouvé, cherche avec premiers 4 chiffres');
  console.log('   3. Si pas trouvé, cherche avec premiers 3 chiffres');
  console.log('   4. Si pas trouvé, cherche avec premiers 2 chiffres');
  console.log('   5. Si aucun match, garde UUID dans l\'URL');
  console.log('\n   Les codes "0001" sont ignorés (placeholder)');
  console.log('='.repeat(80));
}

previewCategoryAssignment().catch(console.error);
