import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres.xrmryfyhqrxzrhdbmwor:ZTXLpLgvQP3UF6Zv@aws-0-ca-central-1.pooler.supabase.com:6543/postgres'
});

await client.connect();

async function checkGMBCompletion() {
  console.log('\n📊 VÉRIFICATION ENRICHISSEMENT GOOGLE MY BUSINESS\n');

  try {
    // Total d'entreprises
    const totalRes = await client.query('SELECT COUNT(*) FROM businesses');
    const total = parseInt(totalRes.rows[0].count);

    // Entreprises avec Google Place ID
    const placeIdRes = await client.query('SELECT COUNT(*) FROM businesses WHERE google_place_id IS NOT NULL');
    const withPlaceId = parseInt(placeIdRes.rows[0].count);

    // Entreprises avec téléphone Google
    const phoneRes = await client.query('SELECT COUNT(*) FROM businesses WHERE google_phone IS NOT NULL');
    const withPhone = parseInt(phoneRes.rows[0].count);

    // Entreprises avec site web Google
    const websiteRes = await client.query('SELECT COUNT(*) FROM businesses WHERE google_website IS NOT NULL');
    const withWebsite = parseInt(websiteRes.rows[0].count);

    // Entreprises avec note Google
    const ratingRes = await client.query('SELECT COUNT(*) FROM businesses WHERE google_rating IS NOT NULL');
    const withRating = parseInt(ratingRes.rows[0].count);

    const pctPlaceId = ((withPlaceId / total) * 100).toFixed(2);
    const pctPhone = ((withPhone / total) * 100).toFixed(2);
    const pctWebsite = ((withWebsite / total) * 100).toFixed(2);
    const pctRating = ((withRating / total) * 100).toFixed(2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 TOTAL ENTREPRISES: ${total?.toLocaleString() || 0}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`🔍 GOOGLE PLACE ID:`);
    console.log(`   ✅ Enrichies: ${withPlaceId?.toLocaleString() || 0}`);
    console.log(`   📈 Pourcentage: ${pctPlaceId}%`);
    console.log(`   ⏳ Restant: ${(total - withPlaceId)?.toLocaleString() || 0}\n`);

    console.log(`📞 TÉLÉPHONE GOOGLE:`);
    console.log(`   ✅ Enrichies: ${withPhone?.toLocaleString() || 0}`);
    console.log(`   📈 Pourcentage: ${pctPhone}%\n`);

    console.log(`🌐 SITE WEB GOOGLE:`);
    console.log(`   ✅ Enrichies: ${withWebsite?.toLocaleString() || 0}`);
    console.log(`   📈 Pourcentage: ${pctWebsite}%\n`);

    console.log(`⭐ NOTE GOOGLE:`);
    console.log(`   ✅ Enrichies: ${withRating?.toLocaleString() || 0}`);
    console.log(`   📈 Pourcentage: ${pctRating}%\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎯 TAUX GLOBAL D'ENRICHISSEMENT: ${pctPlaceId}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkGMBCompletion();
