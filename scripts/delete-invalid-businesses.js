import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Supprimer les entreprises avec des NEQ ou noms invalides
async function deleteInvalidBusinesses() {
  console.log('🧹 Suppression des entreprises invalides...\n');

  let totalDeleted = 0;

  // 1. Supprimer les NEQ commençant par 3
  console.log('❌ Suppression des NEQ commençant par 3...');
  const { data: neq3, error: err1 } = await supabase
    .from('businesses')
    .delete()
    .like('neq', '3%')
    .select('id');

  if (err1) {
    console.error('Erreur:', err1.message);
  } else {
    console.log(`   Supprimés: ${neq3?.length || 0}`);
    totalDeleted += neq3?.length || 0;
  }

  // 2. Supprimer les NEQ commençant par 9
  console.log('❌ Suppression des NEQ commençant par 9...');
  const { data: neq9, error: err2 } = await supabase
    .from('businesses')
    .delete()
    .like('neq', '9%')
    .select('id');

  if (err2) {
    console.error('Erreur:', err2.message);
  } else {
    console.log(`   Supprimés: ${neq9?.length || 0}`);
    totalDeleted += neq9?.length || 0;
  }

  // 3. Supprimer les noms commençant par "9" (ex: "9000-XXXX QUÉBEC INC")
  console.log('❌ Suppression des noms commençant par 9...');
  const { data: nom9, error: err3 } = await supabase
    .from('businesses')
    .delete()
    .like('name', '9%')
    .select('id');

  if (err3) {
    console.error('Erreur:', err3.message);
  } else {
    console.log(`   Supprimés: ${nom9?.length || 0}`);
    totalDeleted += nom9?.length || 0;
  }

  // 4. Supprimer les noms commençant par "3" (ex: "3XXX-XXXX QUÉBEC INC")
  console.log('❌ Suppression des noms commençant par 3...');
  const { data: nom3, error: err4 } = await supabase
    .from('businesses')
    .delete()
    .like('name', '3%')
    .select('id');

  if (err4) {
    console.error('Erreur:', err4.message);
  } else {
    console.log(`   Supprimés: ${nom3?.length || 0}`);
    totalDeleted += nom3?.length || 0;
  }

  // 5. Supprimer les noms qui ressemblent à des compagnies à numéro (7+ chiffres au début)
  console.log('❌ Suppression des noms numériques (7+ chiffres)...');
  const { data: allBusinesses, error: err5 } = await supabase
    .from('businesses')
    .select('id, name');

  if (err5) {
    console.error('Erreur:', err5.message);
  } else {
    const toDelete = [];
    const numericPattern = /^\d{7,}/;

    for (const b of allBusinesses || []) {
      if (b.name && numericPattern.test(b.name.trim())) {
        toDelete.push(b.id);
      }
    }

    if (toDelete.length > 0) {
      const { error: deleteErr } = await supabase
        .from('businesses')
        .delete()
        .in('id', toDelete);

      if (deleteErr) {
        console.error('Erreur:', deleteErr.message);
      } else {
        console.log(`   Supprimés: ${toDelete.length}`);
        totalDeleted += toDelete.length;
      }
    } else {
      console.log('   Aucun trouvé');
    }
  }

  console.log('\n✅ Nettoyage terminé!');
  console.log(`📊 Total supprimés: ${totalDeleted}\n`);
}

deleteInvalidBusinesses().catch(console.error);
