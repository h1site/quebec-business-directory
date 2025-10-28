import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyActEconCoverage() {
  console.log('🔍 Vérification de la couverture act_econ_code dans businesses...\n');
  console.log('='.repeat(80));

  // 1. Total des entreprises
  const { count: total, error: totalError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('❌ Erreur:', totalError);
    return;
  }

  console.log(`\n📊 TOTAL ENTREPRISES: ${total?.toLocaleString()}`);

  // 2. Avec act_econ_code (NOT NULL)
  const { count: withActEcon, error: withError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('act_econ_code', 'is', null);

  console.log(`\n✅ AVEC act_econ_code: ${withActEcon?.toLocaleString()} (${((withActEcon/total)*100).toFixed(2)}%)`);

  // 3. Sans act_econ_code (NULL)
  const { count: withoutActEcon, error: withoutError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('act_econ_code', null);

  console.log(`❌ SANS act_econ_code (NULL): ${withoutActEcon?.toLocaleString()} (${((withoutActEcon/total)*100).toFixed(2)}%)`);

  // 4. Échantillon avec act_econ_code
  console.log('\n' + '='.repeat(80));
  console.log('📋 ÉCHANTILLON: Entreprises AVEC act_econ_code');
  console.log('='.repeat(80));

  const { data: withSample } = await supabase
    .from('businesses')
    .select('name, act_econ_code, city')
    .not('act_econ_code', 'is', null)
    .limit(10);

  if (withSample && withSample.length > 0) {
    console.log('');
    for (const biz of withSample) {
      // Lookup label from act_econ_codes or act_econ_main
      const { data: codeLabel } = await supabase
        .from('act_econ_codes')
        .select('label_fr')
        .eq('code', biz.act_econ_code)
        .single();

      const { data: mainLabel } = await supabase
        .from('act_econ_main')
        .select('label_fr')
        .eq('code', biz.act_econ_code)
        .single();

      const label = codeLabel?.label_fr || mainLabel?.label_fr || 'Code non trouvé';

      console.log(`✓ ${biz.name} (${biz.city || 'N/A'})`);
      console.log(`  → ${biz.act_econ_code}: ${label}`);
    }
  }

  // 5. Échantillon SANS act_econ_code
  console.log('\n' + '='.repeat(80));
  console.log('📋 ÉCHANTILLON: Entreprises SANS act_econ_code (NULL)');
  console.log('='.repeat(80));

  const { data: withoutSample } = await supabase
    .from('businesses')
    .select('name, act_econ_code, city, main_category_id')
    .is('act_econ_code', null)
    .limit(10);

  if (withoutSample && withoutSample.length > 0) {
    console.log('');
    for (const biz of withoutSample) {
      console.log(`✗ ${biz.name} (${biz.city || 'N/A'})`);
      console.log(`  → act_econ_code: NULL`);
      console.log(`  → main_category_id: ${biz.main_category_id || 'NULL'}`);
    }
  } else {
    console.log('\n🎉 AUCUNE ENTREPRISE SANS act_econ_code!');
    console.log('   Couverture à 100% confirmée! ✅');
  }

  // 6. Distribution des codes ACT_ECON
  console.log('\n' + '='.repeat(80));
  console.log('📊 DISTRIBUTION DES CODES ACT_ECON (TOP 20)');
  console.log('='.repeat(80));

  const { data: distribution } = await supabase
    .from('businesses')
    .select('act_econ_code')
    .not('act_econ_code', 'is', null);

  if (distribution) {
    // Count occurrences
    const counts = {};
    distribution.forEach(row => {
      counts[row.act_econ_code] = (counts[row.act_econ_code] || 0) + 1;
    });

    // Sort by count
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    console.log('');
    for (const [code, count] of sorted) {
      // Get label
      const { data: codeLabel } = await supabase
        .from('act_econ_codes')
        .select('label_fr')
        .eq('code', code)
        .single();

      const { data: mainLabel } = await supabase
        .from('act_econ_main')
        .select('label_fr')
        .eq('code', code)
        .single();

      const label = codeLabel?.label_fr || mainLabel?.label_fr || 'N/A';
      const percentage = ((count / total) * 100).toFixed(2);

      console.log(`${code}: ${count.toLocaleString()} entreprises (${percentage}%)`);
      console.log(`   → ${label}`);
    }
  }

  // 7. Codes invalides (qui n'existent pas dans act_econ_main ou act_econ_codes)
  console.log('\n' + '='.repeat(80));
  console.log('⚠️  CODES INVALIDES (n\'existent pas dans act_econ_main/codes)');
  console.log('='.repeat(80));

  const { data: allCodes } = await supabase
    .from('businesses')
    .select('act_econ_code')
    .not('act_econ_code', 'is', null);

  if (allCodes) {
    const uniqueCodes = [...new Set(allCodes.map(row => row.act_econ_code))];
    console.log(`\n📝 ${uniqueCodes.length} codes uniques trouvés dans businesses`);

    let invalidCount = 0;
    const invalidCodes = [];

    for (const code of uniqueCodes.slice(0, 100)) { // Check first 100
      const { data: inCodes } = await supabase
        .from('act_econ_codes')
        .select('code')
        .eq('code', code)
        .single();

      const { data: inMain } = await supabase
        .from('act_econ_main')
        .select('code')
        .eq('code', code)
        .single();

      if (!inCodes && !inMain) {
        invalidCount++;
        invalidCodes.push(code);
      }
    }

    if (invalidCount > 0) {
      console.log(`\n⚠️  ${invalidCount} codes invalides détectés (échantillon 100):`);
      invalidCodes.slice(0, 10).forEach(code => {
        console.log(`   - ${code}`);
      });
    } else {
      console.log('\n✅ Tous les codes sont valides! (échantillon de 100 vérifiés)');
    }
  }

  // 8. Résumé final
  console.log('\n' + '='.repeat(80));
  console.log('📝 RÉSUMÉ FINAL');
  console.log('='.repeat(80));
  console.log(`
Total entreprises:        ${total?.toLocaleString()}
Avec act_econ_code:       ${withActEcon?.toLocaleString()} (${((withActEcon/total)*100).toFixed(2)}%)
Sans act_econ_code:       ${withoutActEcon?.toLocaleString()} (${((withoutActEcon/total)*100).toFixed(2)}%)
  `);

  if (withActEcon === total) {
    console.log('🎉 COUVERTURE À 100% CONFIRMÉE! ✅');
    console.log('   Toutes les entreprises ont un act_econ_code!');
    console.log('\n💡 PROCHAINE ÉTAPE:');
    console.log('   → Créer le mapping act_econ_code → main_category_id');
    console.log('   → Assigner automatiquement les main_category_id');
    console.log('   → Les filtres front-end fonctionneront!');
  } else {
    console.log(`⚠️  ${withoutActEcon?.toLocaleString()} entreprises n'ont pas de act_econ_code`);
    console.log('   Ces entreprises ne pourront pas être auto-catégorisées');
  }

  console.log('='.repeat(80));
}

verifyActEconCoverage();
