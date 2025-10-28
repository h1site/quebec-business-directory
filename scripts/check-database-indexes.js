import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🔍 Vérification des index de performance...\n');

// Check existing indexes on businesses table
const checkIndexes = async () => {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename IN ('businesses', 'businesses_enriched')
      ORDER BY tablename, indexname;
    `
  });

  if (error) {
    console.log('❌ Impossible de vérifier les index via RPC');
    console.log('Suggestions d\'index à créer manuellement:\n');

    console.log('1️⃣ Index pour main_category_id:');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_main_category_id ON businesses(main_category_id);');

    console.log('\n2️⃣ Index pour sub_category_id:');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_sub_category_id ON businesses(sub_category_id);');

    console.log('\n3️⃣ Index pour city:');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);');

    console.log('\n4️⃣ Index pour region:');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_region ON businesses(region);');

    console.log('\n5️⃣ Index pour mrc:');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_mrc ON businesses(mrc);');

    console.log('\n6️⃣ Index composite pour filtres fréquents:');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_category_city ON businesses(main_category_id, city);');

    console.log('\n7️⃣ Index pour search_vector (full-text search):');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_search_vector ON businesses USING GIN(search_vector);');

    console.log('\n8️⃣ Index pour created_at (tri):');
    console.log('   CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON businesses(created_at DESC);');

    return;
  }

  console.log('📊 Index existants:\n');
  data?.forEach(idx => {
    console.log(`${idx.tablename}.${idx.indexname}`);
    console.log(`   ${idx.indexdef}\n`);
  });
};

// Test query performance
const testQueryPerformance = async () => {
  console.log('\n⏱️  Test de performance des requêtes...\n');

  // Test 1: Simple category filter
  const start1 = Date.now();
  const { data: test1, error: error1 } = await supabase
    .from('businesses_enriched')
    .select('*', { count: 'exact' })
    .eq('main_category_id', '60beba89-442b-43ff-8fee-96a28922d789')
    .range(0, 19);
  const time1 = Date.now() - start1;

  console.log(`1️⃣ Filtre par catégorie avec count exact: ${time1}ms (${test1?.length || 0} résultats)`);

  // Test 2: Same query without count
  const start2 = Date.now();
  const { data: test2, error: error2 } = await supabase
    .from('businesses_enriched')
    .select('*')
    .eq('main_category_id', '60beba89-442b-43ff-8fee-96a28922d789')
    .range(0, 19);
  const time2 = Date.now() - start2;

  console.log(`2️⃣ Filtre par catégorie SANS count: ${time2}ms (${test2?.length || 0} résultats)`);
  console.log(`   ⚡ Gain de performance: ${time1 - time2}ms (${((1 - time2/time1) * 100).toFixed(1)}%)\n`);

  // Test 3: Direct table vs view
  const start3 = Date.now();
  const { data: test3, error: error3 } = await supabase
    .from('businesses')
    .select('*')
    .eq('main_category_id', '60beba89-442b-43ff-8fee-96a28922d789')
    .range(0, 19);
  const time3 = Date.now() - start3;

  console.log(`3️⃣ Table businesses directe (sans enrichissement): ${time3}ms`);
  console.log(`   ⚡ Gain vs view enriched: ${time2 - time3}ms\n`);

  // Test 4: City filter
  const start4 = Date.now();
  const { data: test4 } = await supabase
    .from('businesses_enriched')
    .select('*')
    .ilike('city', '%Montreal%')
    .range(0, 19);
  const time4 = Date.now() - start4;

  console.log(`4️⃣ Filtre par ville (ILIKE): ${time4}ms`);

  // Test 5: Full-text search
  const start5 = Date.now();
  const { data: test5 } = await supabase
    .from('businesses_enriched')
    .select('*')
    .textSearch('search_vector', 'restaurant', { type: 'websearch', config: 'french' })
    .range(0, 19);
  const time5 = Date.now() - start5;

  console.log(`5️⃣ Recherche full-text: ${time5}ms\n`);
};

const main = async () => {
  await checkIndexes();
  await testQueryPerformance();

  console.log('\n💡 RECOMMANDATIONS:\n');
  console.log('1. Supprimer count: "exact" quand ce n\'est pas nécessaire');
  console.log('2. Utiliser la table businesses directement si pas besoin de jointures');
  console.log('3. Ajouter les index manquants (voir liste ci-dessus)');
  console.log('4. Considérer un cache Redis pour les requêtes fréquentes');
  console.log('5. Implémenter la pagination avec curseur au lieu d\'offset\n');
};

main().catch(console.error);
