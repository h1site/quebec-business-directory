#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function findUnmappedCodes() {
  console.log('🔍 Recherche des codes ACT_ECON sans mapping...\n');

  // 1. Récupérer tous les codes des businesses (en plusieurs batches)
  console.log('Récupération de tous les codes ACT_ECON...');
  let allBusinesses = [];
  let page = 0;
  const pageSize = 10000;

  while (true) {
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('act_econ_code')
      .not('act_econ_code', 'is', null)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (bizError) {
      console.error('❌ Erreur:', bizError);
      return;
    }

    if (!businesses || businesses.length === 0) break;

    allBusinesses = allBusinesses.concat(businesses);
    page++;
    console.log(`  Récupéré ${allBusinesses.length.toLocaleString()} codes...`);

    if (businesses.length < pageSize) break;
  }

  const businesses = allBusinesses;

  const businessCodes = new Map();
  businesses.forEach(b => {
    const code = b.act_econ_code;
    businessCodes.set(code, (businessCodes.get(code) || 0) + 1);
  });

  console.log(`📊 Total codes uniques dans businesses: ${businessCodes.size}`);
  console.log(`📊 Total businesses avec ACT_ECON: ${businesses.length.toLocaleString()}\n`);

  // 2. Récupérer tous les codes des mappings
  const { data: mappings, error: mapError } = await supabase
    .from('act_econ_category_mappings')
    .select('act_econ_code')
    .gte('confidence_score', 0.5);

  if (mapError) {
    console.error('❌ Erreur:', mapError);
    return;
  }

  const mappingCodes = new Set();
  mappings.forEach(m => {
    const codeAsInt = parseInt(m.act_econ_code, 10);
    mappingCodes.add(codeAsInt);
  });

  console.log(`📊 Total codes dans mappings: ${mappingCodes.size}\n`);

  // 3. Trouver les codes sans mapping
  const unmappedCodes = [];
  let unmappedBusinessCount = 0;

  businessCodes.forEach((count, code) => {
    if (!mappingCodes.has(code)) {
      unmappedCodes.push({ code, count });
      unmappedBusinessCount += count;
    }
  });

  // Trier par count descendant
  unmappedCodes.sort((a, b) => b.count - a.count);

  console.log(`❌ Codes sans mapping: ${unmappedCodes.length}`);
  console.log(`❌ Businesses affectées: ${unmappedBusinessCount.toLocaleString()}\n`);

  console.log('📋 Top 50 codes sans mapping (par nombre de businesses):');
  unmappedCodes.slice(0, 50).forEach((item, index) => {
    console.log(`  ${index + 1}. Code ${item.code}: ${item.count.toLocaleString()} businesses`);
  });

  console.log(`\n💡 Il faut créer des mappings pour ces codes dans act_econ_category_mappings`);
}

findUnmappedCodes();
