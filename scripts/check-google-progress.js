import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xrmryfyhqrxzrhdbmwor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybXJ5ZnlocXJ4enJoZGJtd29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NzgyNzUsImV4cCI6MjA1ODM1NDI3NX0.g9Qy2Rq8xtMYFFDsWBjkXMGtaHSZxbpkp26jlKPBNfM'
);

async function checkProgress() {
  console.log('📊 Vérification progression Google Places...\n');

  // Total d'entreprises
  const { count: total } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  // Entreprises enrichies avec Google
  const { count: enriched } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('google_place_id', 'is', null);

  const percentage = ((enriched / total) * 100).toFixed(2);

  console.log(`✅ Entreprises enrichies: ${enriched?.toLocaleString() || 0}`);
  console.log(`📋 Total entreprises: ${total?.toLocaleString() || 0}`);
  console.log(`📊 Pourcentage complété: ${percentage}%`);
  console.log(`⏳ Restant à enrichir: ${(total - enriched)?.toLocaleString() || 0}`);
}

checkProgress();
