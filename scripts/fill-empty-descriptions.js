import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Generate auto description for businesses without one
 */
function generateAutoDescription(business) {
  const name = business.name;
  const city = business.city || 'Québec';

  return `Il est possible d'ajouter votre fiche à notre annuaire d'entreprises tout à fait gratuitement. Comme ${name} située à ${city}, contribuez à enrichir notre moteur de recherche d'entreprises au Québec. En ajoutant votre site web, vous bénéficiez également d'un backlink gratuit vers votre site, améliorant ainsi votre visibilité en ligne et votre référencement.`;
}

async function fillEmptyDescriptions() {
  console.log('🔍 Recherche des entreprises sans description...\n');

  try {
    // Get businesses with empty or null description
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, city, description')
      .or('description.is.null,description.eq.')
      .limit(5); // ÉCHANTILLON: Tester sur 5 entreprises seulement

    if (error) {
      console.error('❌ Erreur lors de la récupération des entreprises:', error);
      return;
    }

    if (!businesses || businesses.length === 0) {
      console.log('✅ Aucune entreprise sans description trouvée!');
      return;
    }

    console.log(`📝 ${businesses.length} entreprises sans description trouvées\n`);

    let updated = 0;
    let failed = 0;

    for (const business of businesses) {
      const autoDescription = generateAutoDescription(business);

      console.log(`🔄 Mise à jour: ${business.name} (${business.city})`);
      console.log(`   Description: ${autoDescription.substring(0, 60)}...`);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ description: autoDescription })
        .eq('id', business.id);

      if (updateError) {
        console.error(`   ❌ Erreur: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ Mise à jour réussie`);
        updated++;
      }

      console.log('');

      // Pause to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Résumé:');
    console.log(`   ✅ Mis à jour: ${updated}`);
    console.log(`   ❌ Échoué: ${failed}`);
    console.log(`   📝 Total traité: ${businesses.length}`);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

// Run the script
fillEmptyDescriptions();
