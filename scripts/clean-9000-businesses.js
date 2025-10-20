import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanNineThousandBusinesses() {
  console.log('🧹 Nettoyage des entreprises "9000-XXXX QUÉBEC INC."...\n');

  // Trouver toutes les entreprises qui correspondent au pattern
  const { data: businesses, error: findError } = await supabase
    .from('businesses')
    .select('id, name, neq')
    .ilike('name', '9___-____ QUÉBEC INC.%');

  if (findError) {
    console.error('❌ Erreur:', findError);
    return;
  }

  console.log(`📊 Trouvé ${businesses?.length || 0} entreprises à supprimer:\n`);

  if (businesses && businesses.length > 0) {
    console.table(businesses);

    // Supprimer
    const ids = businesses.map(b => b.id);
    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
    } else {
      console.log(`\n✅ ${businesses.length} entreprises "9000" supprimées avec succès!`);
    }
  } else {
    console.log('✅ Aucune entreprise "9000" trouvée dans la base de données.');
  }

  // Afficher le total restant
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total d'entreprises restantes: ${count}`);
}

cleanNineThousandBusinesses()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });
