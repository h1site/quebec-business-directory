import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateParentCodes() {
  console.log('🔧 Mise à jour des parent_code vers act_econ_main...\n');

  // 1. Vérifier les codes actuels
  console.log('1️⃣ Analyse des codes avec parent_code de level 2...');

  const { data: level2Codes, error: level2Error } = await supabase
    .from('act_econ_codes')
    .select('code, label_fr, parent_code, category_level')
    .eq('category_level', 2)
    .order('code')
    .limit(20);

  if (level2Error) {
    console.error('❌ Erreur:', level2Error);
    return;
  }

  console.log('Échantillon des codes level 2 actuels:');
  level2Codes.forEach(row => {
    console.log(`   - ${row.code}: parent=${row.parent_code} → devrait être ${row.code.substring(0, 2)}00`);
  });

  // 2. Générer le SQL pour mettre à jour tous les parent_code
  console.log('\n2️⃣ Génération du SQL de mise à jour...\n');
  console.log('='.repeat(70));

  const updateSQL = `
-- Mettre à jour tous les parent_code pour pointer vers les codes principaux (level 1)
-- Pattern: 0101-0199 → parent 0100, 0401-0499 → parent 0400, etc.

-- Pour tous les codes de level 2 et plus, calculer le bon parent_code
UPDATE act_econ_codes
SET parent_code = CASE
  -- Si le code commence par 01, parent = 0100
  WHEN code LIKE '01%' THEN '0100'
  WHEN code LIKE '02%' THEN '0200'
  WHEN code LIKE '03%' THEN '0300'
  WHEN code LIKE '04%' THEN '0400'
  WHEN code LIKE '05%' THEN '0500'
  WHEN code LIKE '06%' THEN '0600'
  WHEN code LIKE '07%' THEN '0700'
  WHEN code LIKE '08%' THEN '0800'
  WHEN code LIKE '09%' THEN '0900'
  WHEN code LIKE '10%' THEN '1000'
  WHEN code LIKE '11%' THEN '1100'
  WHEN code LIKE '12%' THEN '1200'
  WHEN code LIKE '15%' THEN '1500'
  WHEN code LIKE '16%' THEN '1600'
  WHEN code LIKE '17%' THEN '1700'
  WHEN code LIKE '18%' THEN '1800'
  WHEN code LIKE '19%' THEN '1900'
  WHEN code LIKE '24%' THEN '2400'
  WHEN code LIKE '25%' THEN '2500'
  WHEN code LIKE '26%' THEN '2600'
  WHEN code LIKE '27%' THEN '2700'
  WHEN code LIKE '28%' THEN '2800'
  WHEN code LIKE '29%' THEN '2900'
  WHEN code LIKE '30%' THEN '3000'
  WHEN code LIKE '31%' THEN '3100'
  WHEN code LIKE '32%' THEN '3200'
  WHEN code LIKE '33%' THEN '3300'
  WHEN code LIKE '35%' THEN '3500'
  WHEN code LIKE '36%' THEN '3600'
  WHEN code LIKE '37%' THEN '3700'
  WHEN code LIKE '39%' THEN '3900'
  WHEN code LIKE '40%' THEN '4000'
  WHEN code LIKE '42%' THEN '4200'
  WHEN code LIKE '44%' THEN '4400'
  WHEN code LIKE '45%' THEN '4500'
  WHEN code LIKE '46%' THEN '4600'
  WHEN code LIKE '47%' THEN '4700'
  WHEN code LIKE '48%' THEN '4800'
  WHEN code LIKE '49%' THEN '4900'
  WHEN code LIKE '50%' THEN '5000'
  WHEN code LIKE '51%' THEN '5100'
  WHEN code LIKE '52%' THEN '5200'
  WHEN code LIKE '53%' THEN '5300'
  WHEN code LIKE '54%' THEN '5400'
  WHEN code LIKE '55%' THEN '5500'
  WHEN code LIKE '56%' THEN '5600'
  WHEN code LIKE '57%' THEN '5700'
  WHEN code LIKE '59%' THEN '5900'
  WHEN code LIKE '60%' THEN '6000'
  WHEN code LIKE '61%' THEN '6100'
  WHEN code LIKE '62%' THEN '6200'
  WHEN code LIKE '63%' THEN '6300'
  WHEN code LIKE '65%' THEN '6500'
  WHEN code LIKE '69%' THEN '6900'
  WHEN code LIKE '70%' THEN '7000'
  WHEN code LIKE '71%' THEN '7100'
  WHEN code LIKE '72%' THEN '7200'
  WHEN code LIKE '73%' THEN '7300'
  WHEN code LIKE '74%' THEN '7400'
  WHEN code LIKE '75%' THEN '7500'
  WHEN code LIKE '76%' THEN '7600'
  WHEN code LIKE '77%' THEN '7700'
  WHEN code LIKE '81%' THEN '8100'
  WHEN code LIKE '82%' THEN '8200'
  WHEN code LIKE '83%' THEN '8300'
  WHEN code LIKE '84%' THEN '8400'
  WHEN code LIKE '85%' THEN '8500'
  WHEN code LIKE '86%' THEN '8600'
  WHEN code LIKE '91%' THEN '9100'
  WHEN code LIKE '92%' THEN '9200'
  WHEN code LIKE '96%' THEN '9600'
  WHEN code LIKE '97%' THEN '9700'
  WHEN code LIKE '98%' THEN '9800'
  WHEN code LIKE '99%' THEN '9900'
  ELSE parent_code -- Garder l'ancien si aucun match
END
WHERE category_level >= 2;

-- Vérification: compter combien de codes ont été mis à jour
SELECT
  parent_code,
  count(*) as count
FROM act_econ_codes
WHERE category_level = 2
GROUP BY parent_code
ORDER BY parent_code;

-- Vérifier qu'aucun parent_code ne pointe vers un code qui n'existe plus
SELECT DISTINCT parent_code
FROM act_econ_codes
WHERE category_level >= 2
  AND parent_code NOT IN (SELECT code FROM act_econ_main)
ORDER BY parent_code;
`;

  console.log(updateSQL);
  console.log('='.repeat(70));

  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Va dans Supabase Dashboard');
  console.log('2. SQL Editor');
  console.log('3. Copie-colle le SQL ci-dessus');
  console.log('4. Exécute la requête');

  console.log('\n✅ Résultat attendu:');
  console.log('   - Tous les codes 01xx auront parent_code = 0100');
  console.log('   - Tous les codes 04xx auront parent_code = 0400');
  console.log('   - etc. jusqu\'à 99xx');
  console.log('   - Les parent_code pointeront vers act_econ_main');
}

updateParentCodes();
