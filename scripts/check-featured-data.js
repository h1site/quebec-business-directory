import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xrmryfyhqrxzrhdbmwor.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybXJ5ZnlocXJ4enJoZGJtd29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NzgyNzUsImV4cCI6MjA1ODM1NDI3NX0.g9Qy2Rq8xtMYFFDsWBjkXMGtaHSZxbpkp26jlKPBNfM'
);

async function checkData() {
  console.log('Vérification des entreprises pour la section Featured...\n');

  // Charger entreprises avec ville seulement
  const { data: withCity, error: err1 } = await supabase
    .from('businesses')
    .select('id, name, city, description, logo_url')
    .not('city', 'is', null)
    .limit(10);

  console.log(`✅ Entreprises avec ville: ${withCity?.length || 0}`);

  if (withCity && withCity.length > 0) {
    console.log('\n📋 Exemples d\'entreprises qui s\'afficheront:\n');
    withCity.slice(0, 3).forEach((b, i) => {
      console.log(`${i + 1}. ${b.name}`);
      console.log(`   Ville: ${b.city}`);
      console.log(`   Description: ${b.description ? b.description.substring(0, 80) + '...' : 'Aucune'}`);
      console.log(`   Logo: ${b.logo_url ? 'Oui' : 'Non'}`);
      console.log('');
    });
  } else {
    console.log('\n⚠️  PROBLÈME: Aucune entreprise trouvée avec ville!');
  }
}

checkData();
