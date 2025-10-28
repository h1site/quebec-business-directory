import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function listAllCategories() {
  console.log('📋 Liste de toutes les catégories avec comptage\n');

  // 1. Obtenir toutes les catégories
  const { data: categories, error } = await supabase
    .from('main_categories')
    .select('id, label_fr, slug')
    .order('label_fr');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`✅ ${categories.length} catégories trouvées\n`);

  // 2. Compter les entreprises pour chaque catégorie
  for (const cat of categories) {
    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('main_category_id', cat.id);

    console.log(`📊 ${cat.label_fr.padEnd(40)} : ${(count || 0).toLocaleString().padStart(6)} entreprises`);
  }

  // 3. Total avec catégorie
  const { count: totalWithCategory } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL avec catégorie: ${totalWithCategory.toLocaleString()} entreprises`);
}

listAllCategories().catch(console.error);
