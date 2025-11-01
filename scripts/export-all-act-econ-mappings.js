/**
 * Exporter TOUS les mappings ACT_ECON → Catégories
 * Codes de 0100 à 9999
 *
 * Sortie: CSV et tableau formaté
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables Supabase manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📊 EXPORT COMPLET: ACT_ECON → CATÉGORIES (0100-9999)\n');
console.log('═'.repeat(80));

// 1. Récupérer tous les codes ACT_ECON de la table act_econ_codes
console.log('\n1️⃣ Récupération des codes ACT_ECON...\n');

const { data: allCodes, error: codesError } = await supabase
  .from('act_econ_codes')
  .select('code, label_fr')
  .gte('code', 100)
  .lte('code', 9999)
  .order('code');

if (codesError) {
  console.error('❌ Erreur:', codesError);
  process.exit(1);
}

console.log(`   ✅ ${allCodes?.length || 0} codes ACT_ECON trouvés`);

// 2. Récupérer toutes les catégories du site
console.log('\n2️⃣ Récupération des catégories du site...\n');

const { data: categories } = await supabase
  .from('main_categories')
  .select('id, name_fr, name_en, slug')
  .order('name_fr');

console.log(`   ✅ ${categories?.length || 0} catégories trouvées`);

// Créer un map des catégories
const catMap = {};
categories?.forEach(cat => {
  catMap[cat.id] = {
    name_fr: cat.name_fr,
    name_en: cat.name_en,
    slug: cat.slug
  };
});

// 3. Récupérer les mappings existants
console.log('\n3️⃣ Récupération des mappings ACT_ECON → Catégories...\n');

const { data: mappings } = await supabase
  .from('act_econ_main_categories')
  .select('act_econ_code, main_category_id')
  .order('act_econ_code');

console.log(`   ✅ ${mappings?.length || 0} mappings trouvés`);

// Créer un map des mappings
const mappingMap = {};
mappings?.forEach(m => {
  mappingMap[m.act_econ_code] = m.main_category_id;
});

// 4. Compter combien d'entreprises utilisent chaque code
console.log('\n4️⃣ Comptage des entreprises par code ACT_ECON...\n');

const { data: businessCounts } = await supabase
  .from('businesses')
  .select('act_econ_code')
  .not('act_econ_code', 'is', null)
  .gte('act_econ_code', '0100')
  .lte('act_econ_code', '9999');

const countMap = {};
businessCounts?.forEach(b => {
  const code = parseInt(b.act_econ_code);
  countMap[code] = (countMap[code] || 0) + 1;
});

console.log(`   ✅ Données de ${businessCounts?.length || 0} entreprises analysées`);

// 5. Créer le rapport complet
console.log('\n5️⃣ Génération du rapport...\n');

const report = [];
const csvLines = ['Code ACT_ECON,Label FR,Catégorie Mappée (FR),Catégorie Mappée (EN),Slug Catégorie,Nombre Entreprises'];

allCodes?.forEach(code => {
  const categoryId = mappingMap[code.code];
  const category = categoryId ? catMap[categoryId] : null;
  const businessCount = countMap[code.code] || 0;

  const row = {
    code: code.code,
    label_fr: code.label_fr || 'N/A',
    category_fr: category ? category.name_fr : 'NON MAPPÉ',
    category_en: category ? category.name_en : 'NOT MAPPED',
    category_slug: category ? category.slug : '',
    business_count: businessCount
  };

  report.push(row);

  // Ligne CSV
  csvLines.push([
    code.code,
    `"${row.label_fr.replace(/"/g, '""')}"`,
    `"${row.category_fr.replace(/"/g, '""')}"`,
    `"${row.category_en.replace(/"/g, '""')}"`,
    row.category_slug,
    row.business_count
  ].join(','));
});

// 6. Sauvegarder en CSV
const csvPath = path.join(__dirname, '..', 'act-econ-mappings-export.csv');
fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');

console.log(`   ✅ Fichier CSV créé: act-econ-mappings-export.csv`);

// 7. Afficher statistiques
console.log('\n' + '═'.repeat(80));
console.log('\n📊 STATISTIQUES:\n');

const mapped = report.filter(r => r.category_slug !== '');
const notMapped = report.filter(r => r.category_slug === '');
const withBusinesses = report.filter(r => r.business_count > 0);

console.log(`   Total codes ACT_ECON: ${report.length}`);
console.log(`   Codes mappés à une catégorie: ${mapped.length}`);
console.log(`   Codes NON mappés: ${notMapped.length}`);
console.log(`   Codes utilisés par des entreprises: ${withBusinesses.length}`);

// 8. Top 20 codes les plus utilisés
console.log('\n📋 TOP 20 CODES ACT_ECON LES PLUS UTILISÉS:\n');

const top20 = report
  .filter(r => r.business_count > 0)
  .sort((a, b) => b.business_count - a.business_count)
  .slice(0, 20);

top20.forEach((row, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. Code ${row.code} - ${row.label_fr}`);
  console.log(`    → ${row.category_fr}`);
  console.log(`    ${row.business_count.toLocaleString()} entreprises`);
  console.log('');
});

// 9. Codes non mappés avec beaucoup d'entreprises
console.log('\n⚠️  CODES NON MAPPÉS AVEC LE PLUS D\'ENTREPRISES:\n');

const unmappedWithBusinesses = report
  .filter(r => r.category_slug === '' && r.business_count > 0)
  .sort((a, b) => b.business_count - a.business_count)
  .slice(0, 10);

if (unmappedWithBusinesses.length === 0) {
  console.log('   ✅ Tous les codes utilisés sont mappés!');
} else {
  unmappedWithBusinesses.forEach((row, i) => {
    console.log(`${(i + 1).toString().padStart(2)}. Code ${row.code} - ${row.label_fr}`);
    console.log(`    ❌ NON MAPPÉ - ${row.business_count.toLocaleString()} entreprises`);
    console.log('');
  });
}

console.log('\n' + '═'.repeat(80));
console.log('\n✅ EXPORT TERMINÉ!\n');
console.log(`📄 Fichier CSV: act-econ-mappings-export.csv`);
console.log(`   (${report.length} lignes exportées)`);
