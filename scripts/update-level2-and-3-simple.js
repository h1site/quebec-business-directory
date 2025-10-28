import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updateLevel2And3() {
  console.log('🔧 Mise à jour des parent_code pour LEVEL 2 ET 3...\n');

  console.log('='.repeat(70));

  const updateSQL = `
-- Mettre à jour les codes de level 2 ET 3
-- Tous pointent vers les catégories principales (act_econ_main)
-- Exemples:
--   0110 → parent 0100
--   0111 → parent 0100 (au lieu de 0110)
--   0210 → parent 0200
--   0211 → parent 0200 (au lieu de 0210)

UPDATE act_econ_codes
SET parent_code = CASE
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
  ELSE parent_code
END
WHERE category_level IN (2, 3);  -- Level 2 ET 3

-- Vérification
SELECT
  category_level,
  count(*) as total_codes,
  count(DISTINCT parent_code) as distinct_parents
FROM act_econ_codes
WHERE category_level IN (2, 3)
GROUP BY category_level
ORDER BY category_level;

-- Afficher quelques exemples
SELECT code, label_fr, parent_code, category_level
FROM act_econ_codes
WHERE category_level IN (2, 3)
ORDER BY code
LIMIT 20;
`;

  console.log(updateSQL);
  console.log('='.repeat(70));

  console.log('\n📝 INSTRUCTIONS:');
  console.log('1. Va dans Supabase SQL Editor');
  console.log('2. Copie-colle le SQL ci-dessus');
  console.log('3. Exécute la requête');

  console.log('\n✅ Résultat attendu:');
  console.log('   - 321 codes level 2 → parent = code principal');
  console.log('   - 929 codes level 3 → parent = code principal (même parent que level 2)');
  console.log('   - Total: 1250 codes mis à jour');
  console.log('\n💡 Structure finale simple:');
  console.log('   act_econ_main (0100, 0200, ...)');
  console.log('   ├─ level 2: 0110 → parent 0100');
  console.log('   └─ level 3: 0111 → parent 0100 (même parent!)');
}

updateLevel2And3();
