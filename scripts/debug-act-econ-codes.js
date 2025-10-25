#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function debugActEconCodes() {
  // Échantillon de businesses avec ACT_ECON
  const { data: sample } = await supabase
    .from('businesses')
    .select('id, name, act_econ_code, categories')
    .not('act_econ_code', 'is', null)
    .limit(20);

  console.log('📋 Échantillon de businesses avec ACT_ECON:\n');
  sample.forEach(b => {
    console.log(`Code: ${b.act_econ_code} | Catégories: ${JSON.stringify(b.categories)} | ${b.name.substring(0, 40)}`);
  });

  // Grouper par code
  const codeGroups = {};
  sample.forEach(b => {
    if (!codeGroups[b.act_econ_code]) codeGroups[b.act_econ_code] = 0;
    codeGroups[b.act_econ_code]++;
  });

  console.log('\n📊 Codes dans l\'échantillon:');
  Object.entries(codeGroups).forEach(([code, count]) => {
    console.log(`  ${code}: ${count} businesses`);
  });
}

debugActEconCodes();
