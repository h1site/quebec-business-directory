import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xrmryfyhqrxzrhdbmwor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybXJ5ZnlocXJ4enJoZGJtd29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM0NDc3NSwiZXhwIjoyMDQ4OTIwNzc1fQ.BjrvRiLwC7O5yP9pXCP1AI1X_c2Qp1p0C48TvTPdRhc'
);

async function countGoogleEnriched() {
  console.log('\n📊 CALCUL DES APPELS API GOOGLE PLACES EFFECTUÉS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Total d'entreprises
    const { data: totalData, error: totalError } = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .limit(1);

    if (totalError) throw totalError;

    // On récupère le count exact depuis la requête
    const { count: total } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    console.log(`📋 TOTAL ENTREPRISES: ${total?.toLocaleString()}\n`);

    // Entreprises avec Google Place ID (= enrichies avec succès)
    const { count: withGoogleId } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .not('google_place_id', 'is', null);

    console.log(`✅ ENRICHIES AVEC GOOGLE:`);
    console.log(`   ${withGoogleId?.toLocaleString()} entreprises`);
    console.log(`   ${((withGoogleId / total) * 100).toFixed(2)}% du total\n`);

    // Entreprises SANS Google Place ID
    const notEnriched = total - withGoogleId;
    console.log(`⚠️  NON ENRICHIES:`);
    console.log(`   ${notEnriched?.toLocaleString()} entreprises`);
    console.log(`   ${((notEnriched / total) * 100).toFixed(2)}% du total\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`🔍 ESTIMATION APPELS API GOOGLE PLACES:`);

    // Chaque entreprise = 1 appel API (qu'elle soit trouvée ou non)
    // On estime que toutes les entreprises enrichies ont été interrogées
    // + un certain % de non trouvées

    // Si 88% de taux de succès moyen, alors:
    // Si X entreprises enrichies, il y a eu X / 0.88 = appels total
    const successRate = 0.88;
    const estimatedCalls = Math.round(withGoogleId / successRate);

    console.log(`   Minimum (seulement enrichies): ${withGoogleId?.toLocaleString()} appels`);
    console.log(`   Estimation réaliste (88% succès): ${estimatedCalls?.toLocaleString()} appels`);
    console.log(`   Maximum (toutes traitées): ${total?.toLocaleString()} appels\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`💰 COÛT ESTIMÉ:`);

    const freeLimit = 100000;
    const costPerCall = 0.017; // $0.017 par appel au-delà de la limite

    if (estimatedCalls <= freeLimit) {
      console.log(`   ✅ GRATUIT (${estimatedCalls?.toLocaleString()} / 100,000 appels)`);
      console.log(`   Restant dans limite gratuite: ${(freeLimit - estimatedCalls)?.toLocaleString()} appels\n`);
    } else {
      const excess = estimatedCalls - freeLimit;
      const cost = excess * costPerCall;
      console.log(`   ⚠️  AU-DELÀ DE LA LIMITE GRATUITE`);
      console.log(`   Appels gratuits: 100,000`);
      console.log(`   Appels payants: ${excess.toLocaleString()}`);
      console.log(`   Coût estimé: $${cost.toFixed(2)} USD\n`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

countGoogleEnriched();
