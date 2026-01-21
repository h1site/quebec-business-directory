import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

async function markPrioritySlugs() {
  // Read slugs from file
  const slugsContent = fs.readFileSync('/tmp/csv_all_slugs.txt', 'utf-8');
  const slugs = slugsContent.split('\n').filter(s => s.trim());

  console.log(`📋 Total slugs from CSV: ${slugs.length}`);

  // Check how many already exist in DB
  let found = 0;
  let notFound: string[] = [];
  let alreadyEnriched = 0;
  let toEnrich = 0;

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('businesses')
      .select('slug, ai_description, website')
      .in('slug', batch);

    if (error) {
      console.error('Error:', error);
      continue;
    }

    const foundSlugs = new Set(data?.map(b => b.slug) || []);

    for (const slug of batch) {
      if (foundSlugs.has(slug)) {
        found++;
        const business = data?.find(b => b.slug === slug);
        if (business?.ai_description) {
          alreadyEnriched++;
        } else {
          toEnrich++;
        }
      } else {
        notFound.push(slug);
      }
    }
  }

  console.log('\n📊 RÉSULTAT ANALYSE CSV:');
  console.log(`   Slugs trouvés en DB: ${found}`);
  console.log(`   Déjà enrichis: ${alreadyEnriched}`);
  console.log(`   À enrichir (priorité): ${toEnrich}`);
  console.log(`   Non trouvés: ${notFound.length}`);

  if (notFound.length > 0 && notFound.length <= 20) {
    console.log('\n⚠️ Slugs non trouvés:');
    notFound.forEach(s => console.log(`   - ${s}`));
  }

  // Now mark priority slugs in DB
  console.log('\n🔄 Marquage des slugs prioritaires...');

  const allFoundSlugs: string[] = [];
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    const { data } = await supabase
      .from('businesses')
      .select('slug')
      .in('slug', batch)
      .is('ai_description', null);

    if (data) {
      allFoundSlugs.push(...data.map(b => b.slug));
    }
  }

  // Update priority field
  if (allFoundSlugs.length > 0) {
    let updated = 0;
    for (let i = 0; i < allFoundSlugs.length; i += batchSize) {
      const batch = allFoundSlugs.slice(i, i + batchSize);
      const { error } = await supabase
        .from('businesses')
        .update({ priority_enrich: true })
        .in('slug', batch);

      if (!error) {
        updated += batch.length;
      }
    }
    console.log(`✅ ${updated} fiches marquées comme prioritaires`);
  }

  // Final summary
  console.log('\n📈 RÉSUMÉ FINAL:');

  const { count: totalPriority } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('priority_enrich', true);

  const { count: totalToEnrich } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .not('website', 'is', null)
    .is('ai_description', null);

  console.log(`   Fiches prioritaires (CSV): ${totalPriority || 0}`);
  console.log(`   Total à enrichir (avec site web): ${totalToEnrich || 0}`);
}

markPrioritySlugs();
