import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function analyzeConflict() {
  console.log('🔍 ANALYSE DU DILEMME: Deux systèmes de catégorisation\n');
  console.log('='.repeat(80));

  // 1. Vérifier combien d'entreprises ont act_econ_code
  console.log('\n1️⃣ SYSTÈME GOUVERNEMENTAL (ACT_ECON)\n');

  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  const { count: withActEcon } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  console.log(`   Total entreprises: ${totalBusinesses}`);
  console.log(`   Avec act_econ_code: ${withActEcon} (${((withActEcon/totalBusinesses)*100).toFixed(1)}%)`);
  console.log(`   Sans act_econ_code: ${totalBusinesses - withActEcon} (${(((totalBusinesses - withActEcon)/totalBusinesses)*100).toFixed(1)}%)`);

  // 2. Vérifier combien ont main_category_id
  console.log('\n2️⃣ SYSTÈME SITE (MAIN_CATEGORIES)\n');

  const { count: withMainCat } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('main_category_id', 'is', null);

  const { count: withSubCats } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('sub_category_ids', 'is', null);

  console.log(`   Total entreprises: ${totalBusinesses}`);
  console.log(`   Avec main_category_id: ${withMainCat} (${((withMainCat/totalBusinesses)*100).toFixed(1)}%)`);
  console.log(`   Avec sub_category_ids: ${withSubCats} (${((withSubCats/totalBusinesses)*100).toFixed(1)}%)`);
  console.log(`   Sans catégories: ${totalBusinesses - withMainCat} (${(((totalBusinesses - withMainCat)/totalBusinesses)*100).toFixed(1)}%)`);

  // 3. Échantillon d'entreprises avec les deux systèmes
  console.log('\n3️⃣ ÉCHANTILLON: Entreprises avec les DEUX systèmes\n');

  const { data: bothSystems } = await supabase
    .from('businesses')
    .select('name, act_econ_code, main_category_id')
    .not('act_econ_code', 'is', null)
    .not('main_category_id', 'is', null)
    .limit(5);

  if (bothSystems && bothSystems.length > 0) {
    console.log(`   ${bothSystems.length} exemples trouvés:\n`);
    for (const biz of bothSystems) {
      // Get ACT_ECON label
      const { data: actEcon } = await supabase
        .from('act_econ_codes')
        .select('label_fr')
        .eq('code', biz.act_econ_code)
        .single();

      const { data: actEconMain } = await supabase
        .from('act_econ_main')
        .select('label_fr')
        .eq('code', biz.act_econ_code)
        .single();

      // Get main category label
      const { data: mainCat } = await supabase
        .from('main_categories')
        .select('label_fr, slug')
        .eq('id', biz.main_category_id)
        .single();

      console.log(`   📌 ${biz.name}`);
      console.log(`      ACT_ECON: ${biz.act_econ_code} - ${actEcon?.label_fr || actEconMain?.label_fr || 'N/A'}`);
      console.log(`      Site: ${mainCat?.label_fr || 'N/A'} (${mainCat?.slug || 'N/A'})`);
      console.log('');
    }
  }

  // 4. Vérifier le front-end - quels filtres sont utilisés?
  console.log('\n4️⃣ UTILISATION DANS LE FRONT-END\n');
  console.log('   Fichier: src/services/businessService.js');
  console.log('   Ligne 35-44: Filtrage par catégories\n');
  console.log('   Code actuel:');
  console.log('   ```javascript');
  console.log('   if (subCategorySlug) {');
  console.log('     filters.push({ column: "primary_sub_category_slug", ... });');
  console.log('   } else if (mainCategorySlug) {');
  console.log('     filters.push({ column: "primary_main_category_slug", ... });');
  console.log('   }');
  console.log('   ```');
  console.log('');
  console.log('   ✅ Utilise: main_categories + sub_categories');
  console.log('   ❌ N\'utilise PAS: act_econ_code');

  // 5. Le dilemme
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  LE DILEMME');
  console.log('='.repeat(80));
  console.log('\n📊 SITUATION ACTUELLE:\n');
  console.log('   1. SYSTÈME GOUVERNEMENTAL (ACT_ECON):');
  console.log('      - Officiel, précis, normalisé');
  console.log('      - 74 catégories principales + 1250 sous-codes');
  console.log('      - Présent dans businesses.act_econ_code');
  console.log('      - ✅ Données gouvernementales fiables');
  console.log('      - ❌ PAS utilisé dans le front-end\n');

  console.log('   2. SYSTÈME SITE (MAIN_CATEGORIES):');
  console.log('      - Simplifié, Google-style');
  console.log('      - 19 catégories + 187 sous-catégories');
  console.log('      - Présent dans businesses.main_category_id');
  console.log('      - ✅ Utilisé par les filtres du front-end');
  console.log('      - ❌ Moins précis que ACT_ECON\n');

  console.log('🎯 OBJECTIF:');
  console.log('   → Utiliser la classification gouvernementale (ACT_ECON)');
  console.log('   → Mapper vers les catégories du site (main_categories)');
  console.log('   → Garder les filtres front-end fonctionnels');

  // 6. Solutions possibles
  console.log('\n' + '='.repeat(80));
  console.log('💡 SOLUTIONS POSSIBLES');
  console.log('='.repeat(80));

  console.log('\n🔷 SOLUTION 1: Mapping automatique ACT_ECON → main_categories');
  console.log('   ─────────────────────────────────────────────────────────\n');
  console.log('   Étapes:');
  console.log('   1. Créer table: act_econ_to_main_category');
  console.log('   2. Mapper 74 codes ACT_ECON → 19 catégories site');
  console.log('   3. Script: Pour chaque business avec act_econ_code:');
  console.log('      → Lookup dans act_econ_to_main_category');
  console.log('      → Assigner main_category_id automatiquement');
  console.log('   4. Résultat: Filtres front-end fonctionnent!\n');
  console.log('   ✅ Avantages:');
  console.log('      - Utilise les données gouvernementales');
  console.log('      - Automatique pour nouvelles entreprises');
  console.log('      - Filtres front-end continuent de marcher');
  console.log('   ⚠️  Inconvénients:');
  console.log('      - Perte de précision (74→19 catégories)');
  console.log('      - Mapping manuel initial requis\n');

  console.log('🔷 SOLUTION 2: Double système avec priorité');
  console.log('   ─────────────────────────────────────────────────────────\n');
  console.log('   Logique:');
  console.log('   1. Garder les deux systèmes');
  console.log('   2. Front-end:');
  console.log('      IF act_econ_code EXISTS:');
  console.log('        → Mapper vers main_category via act_econ_to_main_category');
  console.log('      ELSE IF main_category_id EXISTS:');
  console.log('        → Utiliser main_category_id directement');
  console.log('      ELSE:');
  console.log('        → "Non catégorisé"');
  console.log('   3. Vue enrichie: businesses_enriched inclut les deux\n');
  console.log('   ✅ Avantages:');
  console.log('      - Flexible');
  console.log('      - Transition douce');
  console.log('      - Garde la précision ACT_ECON');
  console.log('   ⚠️  Inconvénients:');
  console.log('      - Plus complexe à maintenir');
  console.log('      - Deux sources de vérité\n');

  console.log('🔷 SOLUTION 3: Migration complète vers ACT_ECON');
  console.log('   ─────────────────────────────────────────────────────────\n');
  console.log('   Approche radicale:');
  console.log('   1. Remplacer main_categories par act_econ_main');
  console.log('   2. Remplacer sub_categories par act_econ_codes');
  console.log('   3. Modifier front-end pour utiliser ACT_ECON');
  console.log('   4. Migration: main_category_id → act_econ_code\n');
  console.log('   ✅ Avantages:');
  console.log('      - Un seul système (simplicité)');
  console.log('      - Plus précis (1250 vs 187 sous-catégories)');
  console.log('      - Standard gouvernemental');
  console.log('   ⚠️  Inconvénients:');
  console.log('      - Changements majeurs front-end');
  console.log('      - Risque de casser les URLs/SEO existants');
  console.log('      - Catégories moins "user-friendly"\n');

  console.log('='.repeat(80));
  console.log('🏆 RECOMMANDATION: SOLUTION 1 (Mapping automatique)');
  console.log('='.repeat(80));
  console.log('\nPourquoi:');
  console.log('   ✓ Équilibre entre précision et simplicité');
  console.log('   ✓ Filtres front-end continuent de fonctionner');
  console.log('   ✓ Utilise la classification gouvernementale');
  console.log('   ✓ Pas de changements front-end majeurs');
  console.log('   ✓ URLs/SEO préservés');

  console.log('\n📝 PLAN D\'ACTION:');
  console.log('   Phase 1: Setup');
  console.log('   ├─ 1.1 Créer table act_econ_to_main_category');
  console.log('   ├─ 1.2 Créer mapping: 74 codes ACT_ECON → 19 catégories site');
  console.log('   └─ 1.3 Valider les mappings manuellement\n');

  console.log('   Phase 2: Migration des données');
  console.log('   ├─ 2.1 Script: Pour chaque business avec act_econ_code:');
  console.log('   │     → Lookup mapping');
  console.log('   │     → SET main_category_id');
  console.log('   ├─ 2.2 Optionnel: Mapper aussi vers sub_categories');
  console.log('   └─ 2.3 Vérifier que businesses_enriched est mis à jour\n');

  console.log('   Phase 3: Automatisation future');
  console.log('   ├─ 3.1 Modifier script d\'import (import-req-businesses.js)');
  console.log('   ├─ 3.2 Lors de l\'ajout d\'une entreprise avec act_econ_code:');
  console.log('   │     → Auto-assigner main_category_id via mapping');
  console.log('   └─ 3.3 Dans le wizard de création, proposer les deux options\n');

  console.log('   Phase 4: Tests');
  console.log('   ├─ 4.1 Vérifier filtres front-end');
  console.log('   ├─ 4.2 Vérifier pages de catégories');
  console.log('   ├─ 4.3 Vérifier SEO (URLs, sitemaps)');
  console.log('   └─ 4.4 Vérifier statistiques par secteur\n');

  console.log('='.repeat(80));
}

analyzeConflict();
