import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function countBusinesses() {
  console.log('📊 Comptage des entreprises par ACT_ECON...\n');

  // Total avec ACT_ECON (hors 0001 et NULL)
  const { count: totalWithActEcon, error: e1 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null)
    .not('act_econ_code', 'eq', '0001');

  if (e1) {
    console.error('❌ Erreur:', e1);
    return;
  }

  // Total avec code 0001
  const { count: total0001, error: e2 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('act_econ_code', '0001');

  if (e2) {
    console.error('❌ Erreur:', e2);
    return;
  }

  // Total avec code NULL
  const { count: totalNull, error: e3 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('act_econ_code', null);

  if (e3) {
    console.error('❌ Erreur:', e3);
    return;
  }

  // Total général
  const { count: totalAll, error: e4 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  if (e4) {
    console.error('❌ Erreur:', e4);
    return;
  }

  console.log('📊 RÉSULTATS:\n');
  console.log(`   • Total entreprises: ${totalAll}`);
  console.log(`   • Avec ACT_ECON (hors 0001 et NULL): ${totalWithActEcon}`);
  console.log(`   • Avec code 0001: ${total0001}`);
  console.log(`   • Avec code NULL: ${totalNull}`);
  console.log('');
  console.log(`   ✅ À catégoriser: ${totalWithActEcon} entreprises`);
}

countBusinesses();
