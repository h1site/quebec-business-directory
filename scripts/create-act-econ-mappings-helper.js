import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🗺️  HELPER - CRÉATION DES MAPPINGS ACT_ECON\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Charger les codes ACT_ECON
console.log('📥 Chargement des codes ACT_ECON...\n');
const { data: actEconCodes, error: actError } = await supabase
  .from('act_econ_codes')
  .select('*')
  .order('code');

if (actError) {
  console.error('❌ Erreur:', actError);
  process.exit(1);
}

console.log(`✅ ${actEconCodes.length} codes ACT_ECON chargés\n`);

// Charger les catégories principales
const { data: mainCats, error: mainError } = await supabase
  .from('main_categories')
  .select('*');

if (mainError) {
  console.error('❌ Erreur:', mainError);
  process.exit(1);
}

console.log(`✅ ${mainCats.length} catégories principales chargées\n`);

// Charger les sous-catégories
const { data: subCats, error: subError } = await supabase
  .from('sub_categories')
  .select('*');

if (subError) {
  console.error('❌ Erreur:', subError);
  process.exit(1);
}

console.log(`✅ ${subCats.length} sous-catégories chargées\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('📊 STRUCTURE ACT_ECON\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Grouper par catégorie majeure (niveau 1)
const level1 = actEconCodes.filter(c => c.category_level === 1);
console.log(`📁 ${level1.length} catégories principales (niveau 1):\n`);

level1.slice(0, 20).forEach(cat => {
  const children = actEconCodes.filter(c => c.parent_code === cat.code);
  console.log(`${cat.code} - ${cat.label_fr}`);
  console.log(`   └─ ${children.length} sous-catégories`);
  if (children.length > 0 && children.length <= 5) {
    children.forEach(child => {
      console.log(`      • ${child.code} - ${child.label_fr}`);
    });
  }
  console.log();
});

console.log('═══════════════════════════════════════════════════════════\n');
console.log('📊 VOS CATÉGORIES ACTUELLES\n');
console.log('═══════════════════════════════════════════════════════════\n');

mainCats.forEach(mc => {
  const subs = subCats.filter(sc => sc.main_category_id === mc.id);
  console.log(`📂 ${mc.slug}`);
  console.log(`   ${subs.length} sous-catégories`);
  if (subs.length > 0) {
    subs.slice(0, 5).forEach(sub => {
      console.log(`   • ${sub.slug}`);
    });
    if (subs.length > 5) {
      console.log(`   ... et ${subs.length - 5} autres`);
    }
  }
  console.log();
});

console.log('═══════════════════════════════════════════════════════════\n');
console.log('💡 SUGGESTIONS DE MAPPING AUTOMATIQUE\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Suggestions basiques basées sur des mots-clés
const suggestions = [];

// Agriculture → agriculture-et-environnement
const agriCat = mainCats.find(mc => mc.slug === 'agriculture-et-environnement');
if (agriCat) {
  const agriCodes = actEconCodes.filter(c =>
    c.code.startsWith('01') || c.code.startsWith('02') || c.code.startsWith('03')
  );
  console.log(`🌾 Agriculture (codes 01XX, 02XX, 03XX):`);
  console.log(`   → ${agriCat.slug}`);
  console.log(`   ${agriCodes.length} codes ACT_ECON à mapper\n`);
}

// Construction → construction-et-renovation
const constCat = mainCats.find(mc => mc.slug === 'construction-et-renovation');
if (constCat) {
  const constCodes = actEconCodes.filter(c =>
    c.label_fr.toLowerCase().includes('construction') ||
    c.label_fr.toLowerCase().includes('bâtiment')
  );
  console.log(`🏗️  Construction:`);
  console.log(`   → ${constCat.slug}`);
  console.log(`   ${constCodes.length} codes ACT_ECON détectés\n`);
}

// Restauration → restauration-et-alimentation
const restoCat = mainCats.find(mc => mc.slug === 'restauration-et-alimentation');
if (restoCat) {
  const restoCodes = actEconCodes.filter(c =>
    c.label_fr.toLowerCase().includes('restaurant') ||
    c.label_fr.toLowerCase().includes('aliment') ||
    c.label_fr.toLowerCase().includes('boisson')
  );
  console.log(`🍽️  Restauration & Alimentation:`);
  console.log(`   → ${restoCat.slug}`);
  console.log(`   ${restoCodes.length} codes ACT_ECON détectés\n`);
}

// Santé → sante-et-bien-etre
const santeCat = mainCats.find(mc => mc.slug === 'sante-et-bien-etre');
if (santeCat) {
  const santeCodes = actEconCodes.filter(c =>
    c.label_fr.toLowerCase().includes('santé') ||
    c.label_fr.toLowerCase().includes('médical') ||
    c.label_fr.toLowerCase().includes('vétérinaire') ||
    c.label_fr.toLowerCase().includes('dentiste')
  );
  console.log(`🏥 Santé & Bien-être:`);
  console.log(`   → ${santeCat.slug}`);
  console.log(`   ${santeCodes.length} codes ACT_ECON détectés\n`);
}

// Commerce → commerce-de-detail
const commerceCat = mainCats.find(mc => mc.slug === 'commerce-de-detail');
if (commerceCat) {
  const commerceCodes = actEconCodes.filter(c =>
    c.label_fr.toLowerCase().includes('commerce') ||
    c.label_fr.toLowerCase().includes('magasin') ||
    c.label_fr.toLowerCase().includes('vente au détail')
  );
  console.log(`🛍️  Commerce de détail:`);
  console.log(`   → ${commerceCat.slug}`);
  console.log(`   ${commerceCodes.length} codes ACT_ECON détectés\n`);
}

console.log('═══════════════════════════════════════════════════════════\n');
console.log('📝 PROCHAINES ÉTAPES\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('1. Créer un fichier de mapping manuel (CSV ou JSON)');
console.log('2. Format suggéré:');
console.log('   act_econ_code,main_category_slug,sub_category_slug,notes');
console.log('   0162,agriculture-et-environnement,horticulture,Culture en serre');
console.log('   0211,sante-et-bien-etre,veterinaires,Médecine vétérinaire');
console.log();
console.log('3. Utiliser un script d\'import pour charger les mappings');
console.log('4. Le trigger automatique assignera les catégories aux entreprises\n');

console.log('💡 TIP: Commencez par mapper les codes niveau 1 (XX00)');
console.log('   Les codes plus spécifiques hériteront du parent\n');
