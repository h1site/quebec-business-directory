import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanREQBusinesses() {
  console.log('🧹 Nettoyage des entreprises importées du REQ...\n');

  // Supprimer toutes les entreprises avec data_source = 'req'
  const { data: businesses, error: findError } = await supabase
    .from('businesses')
    .select('id, name, slug, neq')
    .eq('data_source', 'req');

  if (findError) {
    console.error('❌ Erreur:', findError);
    return;
  }

  console.log(`📊 Trouvé ${businesses?.length || 0} entreprises REQ à supprimer:\n`);

  if (businesses && businesses.length > 0) {
    console.table(businesses);

    const ids = businesses.map(b => b.id);
    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
    } else {
      console.log(`\n✅ ${businesses.length} entreprises REQ supprimées avec succès!`);
    }
  } else {
    console.log('✅ Aucune entreprise REQ trouvée dans la base de données.');
  }

  // Afficher le total restant
  const { count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total d'entreprises restantes: ${count}`);
}

cleanREQBusinesses()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });
