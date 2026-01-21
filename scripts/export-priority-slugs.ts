import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

async function exportPrioritySlugs() {
  // Read slugs from file
  const slugsContent = fs.readFileSync('/tmp/csv_all_slugs.txt', 'utf-8');
  const slugs = slugsContent.split('\n').filter(s => s.trim());

  console.log(`📋 Total slugs from CSV: ${slugs.length}`);

  const prioritySlugs: string[] = [];
  const batchSize = 100;

  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const { data } = await supabase
      .from('businesses')
      .select('slug')
      .in('slug', batch)
      .is('ai_description', null);

    if (data) {
      prioritySlugs.push(...data.map(b => b.slug));
    }
  }

  // Save to JSON
  const output = {
    description: "Slugs prioritaires pour enrichissement - provenant du CSV Google Search Console",
    created_at: new Date().toISOString().split('T')[0],
    total: prioritySlugs.length,
    slugs: prioritySlugs
  };

  fs.writeFileSync('data/priority-slugs.json', JSON.stringify(output, null, 2));

  console.log(`✅ ${prioritySlugs.length} slugs prioritaires exportés vers data/priority-slugs.json`);
}

exportPrioritySlugs();
