import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function analyzeMapping() {
  console.log('🔍 Analyse du mapping entre act_econ_main et main_categories...\n');

  // 1. Charger toutes les catégories ACT_ECON
  console.log('1️⃣ Chargement des catégories ACT_ECON (act_econ_main):\n');
  const { data: actEconData, error: actError } = await supabase
    .from('act_econ_main')
    .select('code, label_fr')
    .order('code');

  if (actError) {
    console.error('❌ Erreur act_econ_main:', actError);
    return;
  }

  console.log(`✅ ${actEconData.length} catégories ACT_ECON trouvées\n`);
  console.log('Échantillon:');
  actEconData.slice(0, 10).forEach(cat => {
    console.log(`   ${cat.code}: ${cat.label_fr}`);
  });

  // 2. Charger toutes les catégories du site
  console.log('\n2️⃣ Chargement des catégories du site (main_categories):\n');
  const { data: mainCatsData, error: mainError } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, label_en')
    .order('label_fr');

  if (mainError) {
    console.error('❌ Erreur main_categories:', mainError);
    return;
  }

  console.log(`✅ ${mainCatsData.length} catégories du site trouvées\n`);
  mainCatsData.forEach(cat => {
    console.log(`   - ${cat.label_fr} (${cat.slug})`);
  });

  // 3. Analyse comparative
  console.log('\n' + '='.repeat(70));
  console.log('📊 ANALYSE COMPARATIVE');
  console.log('='.repeat(70));
  console.log(`\nACT_ECON: ${actEconData.length} catégories (système officiel gouvernemental)`);
  console.log(`SITE: ${mainCatsData.length} catégories (système Google-style simplifié)`);

  console.log('\n💡 OBSERVATIONS:');
  console.log('   - ACT_ECON = Système très détaillé (74 catégories principales)');
  console.log('   - main_categories = Système simplifié (~20-30 catégories)');
  console.log('   - Plusieurs codes ACT_ECON → 1 catégorie site (relation N:1)');

  // 4. Exemples de mapping possibles
  console.log('\n📋 EXEMPLES DE MAPPING POSSIBLES:\n');

  const mappingExamples = [
    {
      site_category: 'Restauration et alimentation',
      act_econ_codes: ['1000 - Industrie des aliments', '1100 - Industries des boissons', '9200 - Restauration']
    },
    {
      site_category: 'Commerce de détail',
      act_econ_codes: ['6000 - Commerces de détail des aliments', '6100 - Commerces de détail des chaussures', '6200 - Commerces de détail de meubles', '6300 - Commerces de détail des véhicules automobiles', '6500 - Autres commerces de détail']
    },
    {
      site_category: 'Construction',
      act_econ_codes: ['4000 - Constructeurs', '4200 - Entrepreneurs spécialisés', '4400 - Services relatifs à la construction']
    },
    {
      site_category: 'Services professionnels',
      act_econ_codes: ['7700 - Services aux entreprises', '8500 - Services d\'enseignement']
    },
    {
      site_category: 'Santé et bien-être',
      act_econ_codes: ['8600 - Services de santé et services sociaux']
    },
    {
      site_category: 'Tourisme et hébergement',
      act_econ_codes: ['9100 - Hébergement', '9600 - Services de divertissements et de loisirs']
    }
  ];

  mappingExamples.forEach(example => {
    console.log(`🏷️  ${example.site_category}`);
    console.log('   Codes ACT_ECON suggérés:');
    example.act_econ_codes.forEach(code => {
      console.log(`   → ${code}`);
    });
    console.log('');
  });

  // 5. Structure de table proposée
  console.log('='.repeat(70));
  console.log('💾 PROPOSITION DE STRUCTURE');
  console.log('='.repeat(70));
  console.log('\nOption 1: Table de mapping (recommandé)');
  console.log('─'.repeat(70));
  console.log(`
CREATE TABLE act_econ_to_main_category (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  act_econ_code TEXT NOT NULL REFERENCES act_econ_main(code),
  main_category_id UUID NOT NULL REFERENCES main_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(act_econ_code, main_category_id)
);

-- Index pour recherche rapide
CREATE INDEX idx_act_econ_to_main_category_code
  ON act_econ_to_main_category(act_econ_code);
CREATE INDEX idx_act_econ_to_main_category_category
  ON act_econ_to_main_category(main_category_id);
  `);

  console.log('\nOption 2: Colonne directe dans act_econ_main');
  console.log('─'.repeat(70));
  console.log(`
ALTER TABLE act_econ_main
ADD COLUMN main_category_id UUID REFERENCES main_categories(id);

-- Index
CREATE INDEX idx_act_econ_main_category_id
  ON act_econ_main(main_category_id);
  `);

  console.log('\n='.repeat(70));
  console.log('✅ RECOMMANDATION: Option 1 (table de mapping)');
  console.log('='.repeat(70));
  console.log('\nAvantages:');
  console.log('   ✓ Flexible: Un code ACT_ECON peut mapper à plusieurs catégories site');
  console.log('   ✓ Évolutif: Facile d\'ajouter/modifier des mappings');
  console.log('   ✓ Historique: Peut tracker les changements');
  console.log('   ✓ Performance: Index optimisés pour les deux sens de recherche');

  console.log('\n📝 PROCHAINES ÉTAPES:');
  console.log('   1. Créer la table act_econ_to_main_category');
  console.log('   2. Créer un fichier de mapping manuel (JSON/CSV)');
  console.log('   3. Importer les mappings dans la table');
  console.log('   4. Utiliser pour auto-catégoriser les nouvelles entreprises');
}

analyzeMapping();
