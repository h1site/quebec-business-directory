import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xrmryfyhqrxzrhdbmwor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybXJ5ZnlocXJ4enJoZGJtd29yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzM0NDc3NSwiZXhwIjoyMDQ4OTIwNzc1fQ.BjrvRiLwC7O5yP9pXCP1AI1X_c2Qp1p0C48TvTPdRhc'
);

async function countNullLatitude() {
  console.log('\n📍 VÉRIFICATION COORDONNÉES GPS (LATITUDE)\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Total d'entreprises
    const { data: totalData, error: totalError, count: total } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true });

    if (totalError) {
      console.error('Erreur total:', totalError);
      throw totalError;
    }

    // Entreprises SANS latitude (NULL)
    const { count: withoutLat, error: err1 } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .is('latitude', null);

    if (err1) {
      console.error('Erreur sans lat:', err1);
      throw err1;
    }

    // Entreprises AVEC latitude
    const { count: withLat, error: err2 } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('latitude', 'is', null);

    if (err2) {
      console.error('Erreur avec lat:', err2);
      throw err2;
    }

    const pctWithout = total > 0 ? ((withoutLat / total) * 100).toFixed(2) : 0;
    const pctWith = total > 0 ? ((withLat / total) * 100).toFixed(2) : 0;

    console.log(`📊 TOTAL ENTREPRISES: ${total?.toLocaleString()}\n`);

    console.log(`❌ SANS LATITUDE (NULL):`);
    console.log(`   ${withoutLat?.toLocaleString()} entreprises`);
    console.log(`   ${pctWithout}% du total\n`);

    console.log(`✅ AVEC LATITUDE:`);
    console.log(`   ${withLat?.toLocaleString()} entreprises`);
    console.log(`   ${pctWith}% du total\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Vérifier aussi longitude
    const { count: withoutLon } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .is('longitude', null);

    const { count: withLon } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .not('longitude', 'is', null);

    const pctWithoutLon = total > 0 ? ((withoutLon / total) * 100).toFixed(2) : 0;

    console.log(`📍 BONUS - LONGITUDE:\n`);
    console.log(`❌ SANS LONGITUDE (NULL): ${withoutLon?.toLocaleString()} (${pctWithoutLon}%)`);
    console.log(`✅ AVEC LONGITUDE: ${withLon?.toLocaleString()}\n`);

    // Entreprises avec coordonnées complètes (lat ET lon)
    const { count: withBoth } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    const pctWithBoth = total > 0 ? ((withBoth / total) * 100).toFixed(2) : 0;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`🎯 COORDONNÉES GPS COMPLÈTES (LAT + LON):\n`);
    console.log(`✅ ${withBoth?.toLocaleString()} entreprises (${pctWithBoth}%)`);
    console.log(`❌ ${(total - withBoth)?.toLocaleString()} entreprises sans coordonnées complètes\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

countNullLatitude();
