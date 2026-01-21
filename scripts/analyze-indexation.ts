import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

async function analyze() {
  // Stats from DB
  const { count: totalWithWebsite } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('slug', 'is', null)
    .not('website', 'is', null);

  const { count: websiteAndRating } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('slug', 'is', null)
    .not('website', 'is', null)
    .not('google_rating', 'is', null);

  const { count: alreadyEnriched } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('slug', 'is', null)
    .not('ai_description', 'is', null);

  const { count: websiteNoAi } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('slug', 'is', null)
    .not('website', 'is', null)
    .is('ai_description', null);

  // CSV has 1148 URLs with impressions (pages Google has seen)
  const csvPagesWithImpressions = 1148;

  console.log('=== RÉSUMÉ INDEXATION ===\n');

  console.log('📊 BASE DE DONNÉES:');
  console.log(`   Total avec site web: ${totalWithWebsite?.toLocaleString()}`);
  console.log(`   Avec site web + rating Google: ${websiteAndRating?.toLocaleString()}`);
  console.log(`   Déjà enrichies (AI): ${alreadyEnriched?.toLocaleString()}`);
  console.log(`   À enrichir (site web, pas d'AI): ${websiteNoAi?.toLocaleString()}`);

  console.log('\n📈 GOOGLE SEARCH CONSOLE (CSV):');
  console.log(`   Pages avec impressions: ${csvPagesWithImpressions}`);
  console.log(`   Top page: / (8,155 impressions)`);
  console.log(`   Top article: /blogue/neq-quebec (2,538 impressions)`);

  console.log('\n🎯 STRATÉGIE RECOMMANDÉE:');
  console.log(`   Priorité 1: ${alreadyEnriched} fiches déjà enrichies → INDEX`);
  console.log(`   Priorité 2: ${websiteAndRating?.toLocaleString()} fiches avec site + rating → ENRICHIR puis INDEX`);
  console.log(`   Reste: NOINDEX (pas de site web ou pas de données qualité)`);

  console.log('\n📝 PLAN D\'ACTION:');
  console.log(`   1. Garder index: ${alreadyEnriched} fiches enrichies`);
  console.log(`   2. Enrichir avec OpenAI: ~${(websiteAndRating || 0) - (alreadyEnriched || 0)} fiches (site + rating, pas encore AI)`);
  console.log(`   3. NoIndex: tout le reste (~${480000 - (websiteAndRating || 0)} fiches)`);
}

analyze();
