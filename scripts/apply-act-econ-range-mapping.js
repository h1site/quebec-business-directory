import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Mapping exact selon votre liste
const ACT_ECON_RANGES = [
  { min: 100, max: 343, category: 'Agriculture et environnement', id: '065589d2-5efd-47d5-a8b1-dcc418023bd6', slug: 'agriculture-et-environnement' },
  { min: 400, max: 3999, category: 'Industrie, fabrication et logistique', id: '2a2184fd-03c6-4d3a-ab75-bf250e980531', slug: 'industrie-fabrication-et-logistique' },
  { min: 4000, max: 4499, category: 'Construction et rénovation', id: '60beba89-442b-43ff-8fee-96a28922d789', slug: 'construction-et-renovation' },
  { min: 4500, max: 4619, category: 'Automobile et transport', id: '25933a72-f5d2-4eed-8275-397dc1a8c897', slug: 'automobile-et-transport' },
  { min: 4700, max: 4799, category: 'Industrie, fabrication et logistique', id: '2a2184fd-03c6-4d3a-ab75-bf250e980531', slug: 'industrie-fabrication-et-logistique' },
  { min: 4800, max: 4842, category: 'Technologie et informatique', id: 'efab1e6e-3c3b-4240-9625-c27477667630', slug: 'technologie-et-informatique' },
  { min: 4900, max: 4999, category: 'Organismes publics et communautaires', id: '234268e6-4227-4710-a8b1-11af7d4f0a97', slug: 'organismes-publics-et-communautaires' },
  { min: 5000, max: 6239, category: 'Commerce de détail', id: '271eef26-7324-4a26-932e-9a52f60cc985', slug: 'commerce-de-detail' },
  { min: 6300, max: 6399, category: 'Automobile et transport', id: '25933a72-f5d2-4eed-8275-397dc1a8c897', slug: 'automobile-et-transport' },
  { min: 6410, max: 6921, category: 'Commerce de détail', id: '271eef26-7324-4a26-932e-9a52f60cc985', slug: 'commerce-de-detail' },
  { min: 7000, max: 7712, category: 'Finance, assurance et juridique', id: 'a11fb729-cee5-4c77-9b58-36bdc417350e', slug: 'finance-assurance-et-juridique' },
  { min: 7720, max: 7722, category: 'Technologie et informatique', id: 'efab1e6e-3c3b-4240-9625-c27477667630', slug: 'technologie-et-informatique' },
  { min: 7730, max: 7739, category: 'Finance, assurance et juridique', id: 'a11fb729-cee5-4c77-9b58-36bdc417350e', slug: 'finance-assurance-et-juridique' },
  { min: 7740, max: 7759, category: 'Services professionnels', id: '944753c0-0ebf-4d74-9168-268fab04fc0d', slug: 'services-professionnels' },
  { min: 7760, max: 7799, category: 'Finance, assurance et juridique', id: 'a11fb729-cee5-4c77-9b58-36bdc417350e', slug: 'finance-assurance-et-juridique' },
  { min: 8100, max: 8411, category: 'Organismes publics et communautaires', id: '234268e6-4227-4710-a8b1-11af7d4f0a97', slug: 'organismes-publics-et-communautaires' },
  { min: 8500, max: 8591, category: 'Éducation et formation', id: '783970a1-2bed-4f8e-9f1b-29bfb68cf3b3', slug: 'education-et-formation' },
  { min: 8600, max: 8699, category: 'Santé et bien-être', id: 'b6f1a7d3-9a7c-4871-bd63-2770ba99540f', slug: 'sante-et-bien-etre' },
  { min: 9100, max: 9149, category: 'Tourisme et hébergement', id: 'a43306cc-1d4f-4a49-bb28-41a372889b18', slug: 'tourisme-et-hebergement' },
  { min: 9200, max: 9221, category: 'Restauration et alimentation', id: 'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9', slug: 'restauration-et-alimentation' },
  { min: 9600, max: 9639, category: 'Arts, médias et divertissement', id: 'c6a61771-12bc-4ebe-b689-09768fd85fc4', slug: 'arts-medias-et-divertissement' },
  { min: 9640, max: 9699, category: 'Sports et loisirs', id: 'a57cc9f2-15f0-4ffe-880b-2d48f5fba09e', slug: 'sports-et-loisirs' },
  { min: 9700, max: 9729, category: 'Soins à domicile', id: '5ba7da26-553c-49fb-93d9-dfb462c473ab', slug: 'soins-a-domicile' },
  { min: 9730, max: 9732, category: 'Services funéraires', id: '5da93ab1-248a-4706-9e19-7bbc74b6eafc', slug: 'services-funeraires' },
  { min: 9740, max: 9799, category: 'Maison et services domestiques', id: 'ae549a95-5732-4b7f-8aa8-4460e087acbd', slug: 'maison-et-services-domestiques' },
  { min: 9800, max: 9900, category: 'Organismes publics et communautaires', id: '234268e6-4227-4710-a8b1-11af7d4f0a97', slug: 'organismes-publics-et-communautaires' },
  { min: 9910, max: 9921, category: 'Immobilier', id: '2a9a3e8f-e13b-4d4f-bb8c-b483a3c356ca', slug: 'immobilier' },
  { min: 9930, max: 9931, category: 'Services professionnels', id: '944753c0-0ebf-4d74-9168-268fab04fc0d', slug: 'services-professionnels' },
  { min: 9940, max: 9990, category: 'Services professionnels', id: '944753c0-0ebf-4d74-9168-268fab04fc0d', slug: 'services-professionnels' },
  { min: 9991, max: 9991, category: 'Automobile et transport', id: '25933a72-f5d2-4eed-8275-397dc1a8c897', slug: 'automobile-et-transport' },
];

// Catégorie "Autres services" pour code 9999
const AUTRES_SERVICES_ID = null; // Pas de catégorie spécifique définie pour "Autres services"

function getCategoryForActEconCode(code) {
  // Convertir le code en nombre
  const numCode = parseInt(code, 10);

  if (isNaN(numCode)) return null;

  // Code spécial 9999 = Autres services (pas de catégorie)
  if (numCode === 9999) return null;

  // Chercher la plage correspondante
  for (const range of ACT_ECON_RANGES) {
    if (numCode >= range.min && numCode <= range.max) {
      return {
        id: range.id,
        slug: range.slug,
        category: range.category
      };
    }
  }

  return null;
}

async function analyzeAndApplyMapping() {
  console.log('📊 ANALYSE ET APPLICATION DU MAPPING ACT_ECON → CATÉGORIES\n');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  // 1. Compter les entreprises à traiter
  console.log('1️⃣ Comptage des entreprises à traiter...\n');

  const { count: totalToProcess, error: countError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  if (countError) {
    console.error('❌ Erreur:', countError);
    return;
  }

  console.log(`   ✅ ${totalToProcess} entreprises avec code ACT_ECON à traiter\n`);

  // 2. Afficher le mapping
  console.log('2️⃣ Plages de mapping définies:\n');
  ACT_ECON_RANGES.forEach(range => {
    console.log(`   ${range.min.toString().padStart(4, '0')}–${range.max.toString().padStart(4, '0')} → ${range.category}`);
  });
  console.log('');

  // 3. Appliquer le mapping
  console.log('════════════════════════════════════════════════════════════════════════════════\n');
  console.log('🚀 Application du mapping...\n');

  const BATCH_SIZE = 100;
  let totalUpdated = 0;
  let totalProcessed = 0;
  let totalErrors = 0;

  // Traiter chaque plage de codes
  for (const range of ACT_ECON_RANGES) {
    console.log(`\n📦 Plage ${range.min.toString().padStart(4, '0')}–${range.max.toString().padStart(4, '0')} → ${range.category}`);

    // Compter combien d'entreprises dans cette plage
    const { count: rangeCount, error: countErr } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('act_econ_code', range.min.toString().padStart(4, '0'))
      .lte('act_econ_code', range.max.toString().padStart(4, '0'));

    if (countErr) {
      console.error(`   ❌ Erreur count: ${countErr.message}`);
      continue;
    }

    if (!rangeCount || rangeCount === 0) {
      console.log(`   ⏭️  Aucune entreprise dans cette plage`);
      continue;
    }

    console.log(`   📊 ${rangeCount} entreprises à traiter`);

    // Traiter par batch
    let offset = 0;
    let rangeUpdated = 0;

    while (offset < rangeCount) {
      const { data: batch, error: fetchErr } = await supabase
        .from('businesses')
        .select('id')
        .gte('act_econ_code', range.min.toString().padStart(4, '0'))
        .lte('act_econ_code', range.max.toString().padStart(4, '0'))
        .range(offset, offset + BATCH_SIZE - 1);

      if (fetchErr) {
        console.error(`   ❌ Erreur fetch: ${fetchErr.message}`);
        totalErrors++;
        break;
      }

      if (!batch || batch.length === 0) break;

      const ids = batch.map(b => b.id);

      const { error: updateErr } = await supabase
        .from('businesses')
        .update({
          main_category_id: range.id,
          main_category_slug: range.slug
        })
        .in('id', ids);

      if (updateErr) {
        console.error(`   ❌ Erreur update: ${updateErr.message}`);
        totalErrors++;
      } else {
        rangeUpdated += batch.length;
        totalUpdated += batch.length;
        if (rangeUpdated % 500 === 0 || offset + BATCH_SIZE >= rangeCount) {
          console.log(`   ✅ ${rangeUpdated}/${rangeCount} entreprises mises à jour`);
        }
      }

      totalProcessed += batch.length;
      offset += BATCH_SIZE;

      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  console.log('\n════════════════════════════════════════════════════════════════════════════════\n');
  console.log('✅ TRAITEMENT TERMINÉ!\n');
  console.log(`   📊 Total entreprises traitées: ${totalProcessed}`);
  console.log(`   ✅ Total entreprises mises à jour: ${totalUpdated}`);
  console.log(`   ❌ Total erreurs: ${totalErrors}\n`);
}

analyzeAndApplyMapping();
