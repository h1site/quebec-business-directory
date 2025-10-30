import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkManualBusinesses() {
  console.log('🔍 Vérification des entreprises manuelles...\n');

  // Compter toutes les entreprises par data_source
  const { data: allSources, error: error1 } = await supabase
    .from('businesses')
    .select('data_source', { count: 'exact', head: false });

  if (error1) {
    console.error('Erreur:', error1);
    return;
  }

  // Grouper par data_source
  const sources = {};
  allSources.forEach(b => {
    const source = b.data_source || 'null';
    sources[source] = (sources[source] || 0) + 1;
  });

  console.log('📊 Répartition par data_source:');
  Object.entries(sources).forEach(([source, count]) => {
    console.log(`  ${source}: ${count}`);
  });

  // Récupérer les 3 dernières entreprises créées manuellement
  const { data: manual, error: error2 } = await supabase
    .from('businesses')
    .select('id, name, city, data_source, created_at')
    .eq('data_source', 'manual')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error2) {
    console.error('Erreur:', error2);
    return;
  }

  console.log('\n✅ 3 dernières entreprises manuelles:');
  if (manual && manual.length > 0) {
    manual.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.name} - ${b.city || 'N/A'} (${new Date(b.created_at).toLocaleDateString('fr-CA')})`);
    });
  } else {
    console.log('  ❌ Aucune entreprise avec data_source="manual"');
  }

  // Récupérer les 3 dernières entreprises créées (tous types)
  const { data: recent, error: error3 } = await supabase
    .from('businesses')
    .select('id, name, city, data_source, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n📅 5 dernières entreprises créées (tous types):');
  if (recent && recent.length > 0) {
    recent.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.name} - ${b.city || 'N/A'} [${b.data_source}] (${new Date(b.created_at).toLocaleDateString('fr-CA')})`);
    });
  }
}

checkManualBusinesses();
