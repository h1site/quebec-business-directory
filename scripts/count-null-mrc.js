import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function countNullMRC() {
  console.log('🔍 Comptage des entreprises avec MRC NULL...\n');

  // Count MRC NULL
  const { count: mrcNull, error: err1 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('mrc', null);

  // Count Region NULL
  const { count: regionNull, error: err2 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('region', null);

  // Count both NULL
  const { count: bothNull, error: err3 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('mrc', null)
    .is('region', null);

  // Total count
  const { count: total, error: err4 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  if (err1 || err2 || err3 || err4) {
    console.error('❌ Erreur:', err1 || err2 || err3 || err4);
    return;
  }

  console.log(`📊 Statistiques:`);
  console.log(`   Total entreprises: ${total?.toLocaleString()}`);
  console.log(`   MRC NULL: ${mrcNull?.toLocaleString()}`);
  console.log(`   Region NULL: ${regionNull?.toLocaleString()}`);
  console.log(`   Les deux NULL: ${bothNull?.toLocaleString()}`);
  console.log(`\n   Pourcentage MRC NULL: ${((mrcNull / total) * 100).toFixed(2)}%`);
  console.log(`   Pourcentage Region NULL: ${((regionNull / total) * 100).toFixed(2)}%`);
}

countNullMRC();
