import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('\n📥 Export de toutes les entreprises en CSV...\n');

// Use PostgREST streaming with cursor pagination
async function exportAll() {
  const csvStream = fs.createWriteStream('all-businesses.csv');
  csvStream.write('id,slug,city,main_category_slug,updated_at,description,website,google_reviews_count,google_rating\n');

  let lastId = null;
  let total = 0;
  const BATCH_SIZE = 1000;

  while (true) {
    let query = supabase
      .from('businesses')
      .select('id, slug, city, main_category_slug, updated_at, description, website, google_reviews_count, google_rating')
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: businesses, error } = await query;

    if (error) {
      console.error('❌ Erreur:', error.message);
      break;
    }

    if (!businesses || businesses.length === 0) {
      break;
    }

    // Write to CSV
    businesses.forEach(biz => {
      const row = [
        biz.id,
        biz.slug || '',
        biz.city || '',
        biz.main_category_slug || '',
        biz.updated_at || '',
        (biz.description || '').replace(/"/g, '""').replace(/\n/g, ' '),
        biz.website || '',
        biz.google_reviews_count || '0',
        biz.google_rating || '0'
      ].map(v => `"${v}"`).join(',');
      csvStream.write(row + '\n');
    });

    total += businesses.length;
    lastId = businesses[businesses.length - 1].id;

    console.log(`   ✅ ${total.toLocaleString()} entreprises exportées...`);

    if (businesses.length < BATCH_SIZE) {
      break;
    }
  }

  csvStream.end();
  console.log(`\n✨ Export terminé: ${total.toLocaleString()} entreprises\n`);
  console.log('📄 Fichier: all-businesses.csv\n');
}

exportAll().then(() => process.exit(0)).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
