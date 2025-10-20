import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkEnrichedView() {
  console.log('📊 VÉRIFICATION: businesses vs businesses_enriched');
  console.log('═'.repeat(60));

  // Compter les entreprises REQ avec région dans businesses
  const { data: fromBusinesses, error: businessesError } = await supabase
    .from('businesses')
    .select('region')
    .eq('data_source', 'req')
    .not('region', 'is', null);

  // Obtenir les IDs des entreprises REQ
  const { data: reqBusinessIds } = await supabase
    .from('businesses')
    .select('id')
    .eq('data_source', 'req');

  const reqIds = new Set(reqBusinessIds.map(b => b.id));

  // Compter toutes les entreprises dans businesses_enriched qui ont une région
  const { data: allEnriched, error: enrichedError } = await supabase
    .from('businesses_enriched')
    .select('id, region')
    .not('region', 'is', null);

  // Filtrer pour garder seulement les entreprises REQ
  const fromEnriched = allEnriched.filter(b => reqIds.has(b.id));

  if (enrichedError) {
    console.error('❌ Erreur businesses_enriched:', enrichedError.message);
    return;
  }

  if (businessesError) {
    console.error('❌ Erreur businesses:', businessesError.message);
    return;
  }

  const enrichedByRegion = {};
  const businessesByRegion = {};

  fromEnriched.forEach(b => {
    enrichedByRegion[b.region] = (enrichedByRegion[b.region] || 0) + 1;
  });

  fromBusinesses.forEach(b => {
    businessesByRegion[b.region] = (businessesByRegion[b.region] || 0) + 1;
  });

  console.log('businesses (table source):', fromBusinesses.length, 'entreprises');
  console.log('businesses_enriched (vue):', fromEnriched.length, 'entreprises\n');

  if (fromBusinesses.length !== fromEnriched.length) {
    console.log('⚠️  PROBLÈME: La vue businesses_enriched n\'est pas à jour!');
    console.log('   Manquant:', fromBusinesses.length - fromEnriched.length, 'entreprises\n');
  } else {
    console.log('✅ La vue est synchronisée!\n');
  }

  console.log('📍 Répartition par région:');
  console.log('   (businesses → businesses_enriched)\n');

  const allRegions = new Set([...Object.keys(enrichedByRegion), ...Object.keys(businessesByRegion)]);

  let totalDiff = 0;

  [...allRegions].sort().forEach(region => {
    const fromBiz = businessesByRegion[region] || 0;
    const fromEnr = enrichedByRegion[region] || 0;
    const diff = fromBiz - fromEnr;
    totalDiff += Math.abs(diff);

    const status = fromBiz === fromEnr ? '✅' : '❌';
    const diffStr = diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : '';
    console.log(`  ${status} ${region.padEnd(35)} : ${fromBiz} → ${fromEnr}${diffStr}`);
  });

  console.log('\n' + '═'.repeat(60));
  console.log('TOTAL:', fromBusinesses.length, '→', fromEnriched.length);

  if (totalDiff > 0) {
    console.log('\n⚠️  ACTION REQUISE: La vue businesses_enriched doit être rafraîchie!');
    console.log('   Exécutez la migration pour recréer la vue.');
  }
  console.log('═'.repeat(60));
}

checkEnrichedView();
