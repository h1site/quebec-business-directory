import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tiaofyawimkckjgxdnbd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYW9meWF3aW1rY2tqZ3hkbmJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTQzOTEsImV4cCI6MjA3NjE3MDM5MX0.KwFCbMk0s8z_b3s3dX0E03CFOWj3gWe3OBCamOhhduw'
);

async function listCategories() {
  const { data, error } = await supabase
    .from('main_categories')
    .select('slug, label_fr')
    .order('label_fr');

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log('\n📋 CATÉGORIES PRINCIPALES:\n');
  data.forEach(cat => {
    console.log(`${cat.slug.padEnd(30)} → ${cat.label_fr}`);
  });
}

listCategories();
