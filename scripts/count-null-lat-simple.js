import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.xrmryfyhqrxzrhdbmwor:ZTXLpLgvQP3UF6Zv@aws-0-ca-central-1.pooler.supabase.com:6543/postgres'
});

async function countNullLat() {
  const client = await pool.connect();

  try {
    console.log('\n📍 VÉRIFICATION COORDONNÉES GPS\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Total
    const totalRes = await client.query('SELECT COUNT(*) as count FROM businesses');
    const total = parseInt(totalRes.rows[0].count);

    // Sans latitude
    const nullLatRes = await client.query('SELECT COUNT(*) as count FROM businesses WHERE latitude IS NULL');
    const nullLat = parseInt(nullLatRes.rows[0].count);

    // Avec latitude
    const withLatRes = await client.query('SELECT COUNT(*) as count FROM businesses WHERE latitude IS NOT NULL');
    const withLat = parseInt(withLatRes.rows[0].count);

    // Sans longitude
    const nullLonRes = await client.query('SELECT COUNT(*) as count FROM businesses WHERE longitude IS NULL');
    const nullLon = parseInt(nullLonRes.rows[0].count);

    // Avec les DEUX coordonnées
    const bothRes = await client.query('SELECT COUNT(*) as count FROM businesses WHERE latitude IS NOT NULL AND longitude IS NOT NULL');
    const withBoth = parseInt(bothRes.rows[0].count);

    console.log(`📊 TOTAL ENTREPRISES: ${total.toLocaleString()}\n`);

    console.log(`❌ SANS LATITUDE:`);
    console.log(`   ${nullLat.toLocaleString()} entreprises (${((nullLat/total)*100).toFixed(2)}%)\n`);

    console.log(`❌ SANS LONGITUDE:`);
    console.log(`   ${nullLon.toLocaleString()} entreprises (${((nullLon/total)*100).toFixed(2)}%)\n`);

    console.log(`✅ AVEC LATITUDE:`);
    console.log(`   ${withLat.toLocaleString()} entreprises (${((withLat/total)*100).toFixed(2)}%)\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`🎯 COORDONNÉES GPS COMPLÈTES (LAT + LON):\n`);
    console.log(`✅ ${withBoth.toLocaleString()} entreprises (${((withBoth/total)*100).toFixed(2)}%)`);
    console.log(`❌ ${(total - withBoth).toLocaleString()} sans coordonnées GPS (${(((total-withBoth)/total)*100).toFixed(2)}%)\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

countNullLat();
