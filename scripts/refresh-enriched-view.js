/**
 * Refresh businesses_enriched view to include description_en column
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function refreshView() {
  console.log('\n🔄 Refreshing businesses_enriched view...\n');

  // Drop and recreate the view to include all current columns
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE VIEW public.businesses_enriched AS
      SELECT b.*
      FROM public.businesses b;
    `
  });

  if (error) {
    console.error('❌ Error refreshing view:', error);
    console.log('\n⚠️  The RPC function might not exist. Let me try a workaround...\n');

    // Alternative: Check if the view includes description_en
    const { data, error: checkError } = await supabase
      .from('businesses_enriched')
      .select('description_en')
      .limit(1);

    if (checkError) {
      if (checkError.code === '42703') {
        console.error('❌ CONFIRMED: businesses_enriched view is missing description_en column');
        console.log('\n📝 You need to manually run this SQL in Supabase SQL Editor:');
        console.log('\n---\nCREATE OR REPLACE VIEW public.businesses_enriched AS');
        console.log('SELECT b.* FROM public.businesses b;');
        console.log('---\n');
      } else {
        console.error('Check error:', checkError);
      }
    } else {
      console.log('✅ View already includes description_en!');
    }
    return;
  }

  console.log('✅ View refreshed successfully!\n');

  // Verify it now includes description_en
  const { data, error: verifyError } = await supabase
    .from('businesses_enriched')
    .select('description_en')
    .limit(1);

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
  } else {
    console.log('✅ Verified: description_en column is now accessible!');
  }
}

refreshView()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
