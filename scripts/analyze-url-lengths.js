import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
};

async function analyzeUrlLengths() {
  console.log('📏 ANALYSE DES LONGUEURS D\'URL\n');
  console.log('='.repeat(80));

  const baseUrl = 'https://registreduquebec.com';

  // Sample 1000 businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, main_category_slug, city, categories, name')
    .not('city', 'is', null)
    .not('slug', 'is', null)
    .limit(1000);

  if (!businesses || businesses.length === 0) {
    console.log('❌ Aucune entreprise trouvée');
    return;
  }

  const urlLengths = [];
  const samples = [];

  businesses.forEach(biz => {
    // Determine category part
    let categoryPart = biz.main_category_slug;
    if (!categoryPart && biz.categories && biz.categories.length > 0) {
      categoryPart = biz.categories[0]; // UUID fallback
    }

    if (!categoryPart) return;

    const citySlug = generateSlug(biz.city);
    const url = `${baseUrl}/en/${categoryPart}/${citySlug}/${biz.slug}`;

    urlLengths.push(url.length);

    // Store some samples
    if (samples.length < 10) {
      samples.push({ name: biz.name, url, length: url.length });
    }
  });

  // Calculate stats
  const min = Math.min(...urlLengths);
  const max = Math.max(...urlLengths);
  const avg = Math.round(urlLengths.reduce((a, b) => a + b, 0) / urlLengths.length);

  console.log('📊 STATISTIQUES (sample de 1000 entreprises):\n');
  console.log(`   Longueur minimale:  ${min} caractères`);
  console.log(`   Longueur maximale:  ${max} caractères`);
  console.log(`   Longueur moyenne:   ${avg} caractères`);

  console.log('\n🎯 RECOMMANDATIONS GOOGLE:\n');
  console.log('   ✅ < 75 caractères:  EXCELLENT (optimal pour SEO)');
  console.log('   ⚠️  75-120 caractères: BON (acceptable)');
  console.log('   🟡 120-150 caractères: PASSABLE (limite)');
  console.log('   ❌ > 150 caractères:  TROP LONG (à éviter)');

  // Distribution
  const excellent = urlLengths.filter(l => l < 75).length;
  const good = urlLengths.filter(l => l >= 75 && l < 120).length;
  const ok = urlLengths.filter(l => l >= 120 && l < 150).length;
  const tooLong = urlLengths.filter(l => l >= 150).length;

  console.log('\n📈 DISTRIBUTION:\n');
  console.log(`   ✅ < 75:      ${excellent} (${((excellent / urlLengths.length) * 100).toFixed(1)}%)`);
  console.log(`   ⚠️  75-120:   ${good} (${((good / urlLengths.length) * 100).toFixed(1)}%)`);
  console.log(`   🟡 120-150:  ${ok} (${((ok / urlLengths.length) * 100).toFixed(1)}%)`);
  console.log(`   ❌ > 150:     ${tooLong} (${((tooLong / urlLengths.length) * 100).toFixed(1)}%)`);

  console.log('\n📋 EXEMPLES D\'URLs:\n');
  samples.forEach((s, i) => {
    const icon = s.length < 75 ? '✅' : s.length < 120 ? '⚠️' : s.length < 150 ? '🟡' : '❌';
    console.log(`${i + 1}. ${icon} ${s.length} caractères`);
    console.log(`   ${s.name}`);
    console.log(`   ${s.url}`);
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('💡 NOTES:\n');
  console.log('- Les URLs avec slug de catégorie sont généralement 70-110 caractères');
  console.log('- Les URLs avec UUID (fallback) sont ~80 caractères (UUID = 36 chars)');
  console.log('- Le slug du business est tronqué à 100 caractères max');
  console.log('- Google recommande < 75 chars mais accepte jusqu\'à ~150');
  console.log('='.repeat(80));
}

analyzeUrlLengths().catch(console.error);
