import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function deleteGenericBusinesses() {
  console.log('🗑️  Suppression des entreprises commençant par "3xxx"...\n');

  // Get businesses starting with 3
  const { data: businesses, error: fetchError } = await supabase
    .from('businesses')
    .select('id, name, city, neq')
    .eq('data_source', 'req')
    .ilike('name', '3%');

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération:', fetchError.message);
    return;
  }

  console.log(`📊 ${businesses.length} entreprises trouvées\n`);

  // Show what will be deleted
  console.log('🔍 Entreprises qui seront supprimées:');
  businesses.forEach(b => {
    console.log(`   - ${b.name} (${b.city}) - NEQ: ${b.neq}`);
  });

  if (businesses.length === 0) {
    console.log('\n✅ Aucune entreprise à supprimer');
    return;
  }

  console.log('\n⏳ Suppression en cours...\n');

  // Delete all businesses starting with 3
  const { error: deleteError } = await supabase
    .from('businesses')
    .delete()
    .eq('data_source', 'req')
    .ilike('name', '3%');

  if (deleteError) {
    console.error('❌ Erreur lors de la suppression:', deleteError.message);
    return;
  }

  console.log('✅ Suppression réussie!');
  console.log(`🗑️  ${businesses.length} entreprises supprimées\n`);

  // Verify deletion
  const { count: remaining } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('data_source', 'req')
    .ilike('name', '3%');

  console.log('════════════════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`✅ Entreprises supprimées: ${businesses.length}`);
  console.log(`📊 Entreprises restantes commençant par 3: ${remaining}`);
  console.log('════════════════════════════════════════════════════════════');
}

deleteGenericBusinesses().catch(console.error);
