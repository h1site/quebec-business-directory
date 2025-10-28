const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function checkNullRegions() {
  console.log('🔍 Vérification des entreprises avec Region/MRC NULL...\n');

  const { count, error } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .or('region.is.null,mrc.is.null');

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log(`📊 Entreprises avec Region/MRC NULL: ${count.toLocaleString()}\n`);

  // Exemples de villes non trouvées
  const { data, error: err } = await supabase
    .from('businesses')
    .select('city, region, mrc')
    .or('region.is.null,mrc.is.null')
    .limit(50);

  if (!err && data) {
    console.log('🏙️ Exemples de villes non trouvées:');
    const cityMap = {};
    data.forEach(b => {
      if (b.city) {
        cityMap[b.city] = (cityMap[b.city] || 0) + 1;
      }
    });

    const sorted = Object.entries(cityMap).sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 20).forEach(([city, count]) => {
      console.log(`  - ${city} (${count} entreprises)`);
    });
  }
}

checkNullRegions();
