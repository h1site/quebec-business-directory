/**
 * Script de test du système REQ
 * Vérifie que toutes les tables et mappings sont correctement créés
 *
 * UTILISATION:
 * node scripts/test-req-system.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Test du système REQ Import');
console.log('═'.repeat(50));
console.log('');

async function runTests() {
  const tests = [
    {
      name: 'Vérifier colonnes businesses',
      test: async () => {
        const { data, error } = await supabase
          .from('businesses')
          .select('neq, is_claimed, data_source, scian_code')
          .limit(1);

        if (error) throw new Error(`Colonnes manquantes: ${error.message}`);
        return '✅ Colonnes REQ présentes dans businesses';
      }
    },
    {
      name: 'Vérifier table scian_category_mapping',
      test: async () => {
        const { data, error } = await supabase
          .from('scian_category_mapping')
          .select('*');

        if (error) throw new Error(`Table manquante: ${error.message}`);
        if (!data || data.length === 0) {
          throw new Error('Aucun mapping SCIAN trouvé. Exécutez la migration!');
        }
        return `✅ Table scian_category_mapping: ${data.length} mappings`;
      }
    },
    {
      name: 'Vérifier table business_claims',
      test: async () => {
        const { error } = await supabase
          .from('business_claims')
          .select('*')
          .limit(1);

        if (error) throw new Error(`Table manquante: ${error.message}`);
        return '✅ Table business_claims créée';
      }
    },
    {
      name: 'Vérifier mappings SCIAN → Restauration',
      test: async () => {
        const { data, error } = await supabase
          .from('scian_category_mapping')
          .select(`
            scian_code,
            description_fr,
            main_categories(label_fr),
            sub_categories(label_fr)
          `)
          .like('scian_code', '722%')
          .limit(1)
          .single();

        if (error || !data) {
          throw new Error('Mapping restauration (722) non trouvé');
        }

        return `✅ Mapping SCIAN ${data.scian_code} → ${data.main_categories.label_fr}`;
      }
    },
    {
      name: 'Vérifier mappings SCIAN → Construction',
      test: async () => {
        const { data, error } = await supabase
          .from('scian_category_mapping')
          .select(`
            scian_code,
            sub_categories(label_fr)
          `)
          .eq('scian_code', '238220')
          .single();

        if (error || !data) {
          throw new Error('Mapping plomberie (238220) non trouvé');
        }

        return `✅ Mapping SCIAN 238220 → ${data.sub_categories.label_fr}`;
      }
    },
    {
      name: 'Compter entreprises REQ existantes',
      test: async () => {
        const { count, error } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('data_source', 'req');

        if (error) throw new Error(error.message);

        return count > 0
          ? `✅ ${count} entreprises REQ déjà importées`
          : '⚠️  Aucune entreprise REQ (exécutez import-req-businesses.js)';
      }
    },
    {
      name: 'Compter réclamations',
      test: async () => {
        const { count, error } = await supabase
          .from('business_claims')
          .select('*', { count: 'exact', head: true });

        if (error) throw new Error(error.message);

        return count > 0
          ? `✅ ${count} réclamations existantes`
          : '✅ 0 réclamations (normal si nouveau système)';
      }
    },
    {
      name: 'Tester recherche par NEQ',
      test: async () => {
        // Créer entreprise test si n'existe pas
        const testNEQ = '9999999999';
        const { data: existing } = await supabase
          .from('businesses')
          .select('id')
          .eq('neq', testNEQ)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('businesses')
            .insert({
              neq: testNEQ,
              name: 'Test REQ Company',
              city: 'Montréal',
              province: 'QC',
              data_source: 'req',
              slug: 'test-req-company-9999',
              is_claimed: false
            });

          if (error && !error.message.includes('duplicate')) {
            throw new Error(`Erreur création test: ${error.message}`);
          }
        }

        // Chercher par NEQ
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('neq', testNEQ)
          .single();

        if (error) throw new Error(`Recherche NEQ échouée: ${error.message}`);

        return '✅ Recherche par NEQ fonctionnelle';
      }
    },
    {
      name: 'Vérifier index performance',
      test: async () => {
        // Vérifier que les index existent
        const indexes = [
          'businesses_neq_idx',
          'businesses_is_claimed_idx',
          'businesses_scian_idx'
        ];

        // Note: Supabase ne permet pas de query pg_indexes directement via client
        // On vérifie juste que les requêtes sont rapides
        const start = Date.now();
        await supabase
          .from('businesses')
          .select('id')
          .eq('is_claimed', false)
          .limit(100);
        const duration = Date.now() - start;

        if (duration > 1000) {
          return `⚠️  Requête lente (${duration}ms) - index peut-être manquant`;
        }

        return `✅ Performance OK (${duration}ms)`;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(result);
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('═'.repeat(50));
  console.log(`📊 Résultats: ${passed}/${tests.length} tests passés`);

  if (failed > 0) {
    console.log('');
    console.log('⚠️  ACTIONS REQUISES:');
    console.log('');
    console.log('1. Exécutez la migration dans Supabase SQL Editor:');
    console.log('   supabase/migration_add_req_import_support.sql');
    console.log('');
    console.log('2. Si migration OK, essayez l\'import test:');
    console.log('   cp data/req-entreprises-sample.csv data/req-entreprises.csv');
    console.log('   node scripts/import-req-businesses.js --limit=10');
    console.log('');
  } else {
    console.log('');
    console.log('🎉 TOUT FONCTIONNE!');
    console.log('');
    console.log('✅ Prêt pour l\'import REQ!');
    console.log('');
    console.log('Prochaines étapes:');
    console.log('1. Télécharger dataset: https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises');
    console.log('2. Placer dans: data/req-entreprises.csv');
    console.log('3. Lancer: node scripts/import-req-businesses.js');
    console.log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
