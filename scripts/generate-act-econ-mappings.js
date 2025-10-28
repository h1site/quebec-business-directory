import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function generateMappings() {
  console.log('🎯 Génération des mappings ACT_ECON → main_categories...\n');
  console.log('='.repeat(80));

  // 1. Charger toutes les catégories ACT_ECON (level 1)
  console.log('\n1️⃣ Chargement des catégories ACT_ECON...\n');

  const { data: actEconCategories, error: actError } = await supabase
    .from('act_econ_main')
    .select('code, label_fr')
    .order('code');

  if (actError) {
    console.error('❌ Erreur:', actError);
    return;
  }

  console.log(`✅ ${actEconCategories.length} catégories ACT_ECON chargées`);

  // 2. Charger toutes les catégories du site
  console.log('\n2️⃣ Chargement des catégories du site...\n');

  const { data: mainCategories, error: mainError } = await supabase
    .from('main_categories')
    .select('id, slug, label_fr, label_en')
    .order('label_fr');

  if (mainError) {
    console.error('❌ Erreur:', mainError);
    return;
  }

  console.log(`✅ ${mainCategories.length} catégories du site chargées\n`);
  mainCategories.forEach(cat => {
    console.log(`   - ${cat.label_fr} (${cat.slug})`);
  });

  // 3. Créer le mapping manuel intelligent
  console.log('\n3️⃣ Création des mappings...\n');
  console.log('='.repeat(80));

  const mappings = {};

  // Helper pour trouver une catégorie par slug
  const findCategory = (slug) => mainCategories.find(c => c.slug === slug);

  // MAPPING MANUEL DES 74 CODES ACT_ECON → 19 CATÉGORIES SITE

  // Agriculture et environnement
  const agriEnv = findCategory('agriculture-et-environnement');
  mappings['0100'] = agriEnv?.id; // Agriculture
  mappings['0200'] = agriEnv?.id; // Services relatifs à l'agriculture
  mappings['0300'] = agriEnv?.id; // Pêche et piégeage
  mappings['0400'] = agriEnv?.id; // Exploitation forestière
  mappings['0500'] = agriEnv?.id; // Services forestiers

  // Industrie, fabrication et logistique
  const industrie = findCategory('industrie-fabrication-et-logistique');
  mappings['0600'] = industrie?.id; // Mines
  mappings['0700'] = industrie?.id; // Extraction pétrole/gaz
  mappings['0800'] = industrie?.id; // Carrières et gravières
  mappings['0900'] = industrie?.id; // Services miniers
  mappings['1000'] = industrie?.id; // Industrie des aliments
  mappings['1100'] = industrie?.id; // Industries des boissons
  mappings['1200'] = industrie?.id; // Industries du tabac
  mappings['1500'] = industrie?.id; // Produits du caoutchouc
  mappings['1600'] = industrie?.id; // Produits en plastique
  mappings['1700'] = industrie?.id; // Cuir et produits connexes
  mappings['1800'] = industrie?.id; // Industries textiles
  mappings['1900'] = industrie?.id; // Produits textiles
  mappings['2400'] = industrie?.id; // Habillement
  mappings['2500'] = industrie?.id; // Bois
  mappings['2600'] = industrie?.id; // Meuble et ameublement
  mappings['2700'] = industrie?.id; // Papier
  mappings['2800'] = industrie?.id; // Imprimerie
  mappings['2900'] = industrie?.id; // Première transformation métaux
  mappings['3000'] = industrie?.id; // Produits métalliques
  mappings['3100'] = industrie?.id; // Machinerie
  mappings['3200'] = industrie?.id; // Matériel de transport
  mappings['3300'] = industrie?.id; // Produits électriques/électroniques
  mappings['3500'] = industrie?.id; // Produits minéraux non métalliques
  mappings['3600'] = industrie?.id; // Produits pétrole/charbon
  mappings['3700'] = industrie?.id; // Industries chimiques
  mappings['3900'] = industrie?.id; // Autres industries manufacturières
  mappings['4700'] = industrie?.id; // Entreposage

  // Construction et rénovation
  const construction = findCategory('construction-et-renovation');
  mappings['4000'] = construction?.id; // Constructeurs
  mappings['4200'] = construction?.id; // Entrepreneurs spécialisés
  mappings['4400'] = construction?.id; // Services relatifs construction

  // Automobile et transport
  const autoTransport = findCategory('automobile-et-transport');
  mappings['4500'] = autoTransport?.id; // Transports
  mappings['4600'] = autoTransport?.id; // Transports par pipelines
  mappings['5500'] = autoTransport?.id; // Commerce gros véhicules
  mappings['6300'] = autoTransport?.id; // Commerce détail véhicules

  // Technologie et informatique
  const techInfo = findCategory('technologie-et-informatique');
  mappings['4800'] = techInfo?.id; // Communications
  mappings['4900'] = techInfo?.id; // Autres services publics

  // Commerce de détail
  const commerceDetail = findCategory('commerce-de-detail');
  mappings['5000'] = commerceDetail?.id; // Commerce gros produits agricoles
  mappings['5100'] = commerceDetail?.id; // Commerce gros produits pétroliers
  mappings['5200'] = commerceDetail?.id; // Commerce gros produits alimentaires
  mappings['5300'] = commerceDetail?.id; // Commerce gros vêtements
  mappings['5400'] = commerceDetail?.id; // Commerce gros articles ménagers
  mappings['5600'] = commerceDetail?.id; // Commerce gros quincaillerie
  mappings['5700'] = commerceDetail?.id; // Commerce gros machines
  mappings['5900'] = commerceDetail?.id; // Commerce gros produits divers
  mappings['6000'] = commerceDetail?.id; // Commerce détail aliments
  mappings['6100'] = commerceDetail?.id; // Commerce détail chaussures
  mappings['6200'] = commerceDetail?.id; // Commerce détail meubles
  mappings['6500'] = commerceDetail?.id; // Autres commerces détail
  mappings['6900'] = commerceDetail?.id; // Commerces détail hors magasin

  // Finance, assurance et juridique
  const finance = findCategory('finance-assurance-et-juridique');
  mappings['7000'] = finance?.id; // Intermédiaires financiers dépôts
  mappings['7100'] = finance?.id; // Sociétés crédit consommation
  mappings['7200'] = finance?.id; // Sociétés d'investissement
  mappings['7300'] = finance?.id; // Sociétés assurances
  mappings['7400'] = finance?.id; // Autres intermédiaires financiers
  mappings['7600'] = finance?.id; // Agences assurances/immobilières

  // Immobilier
  const immobilier = findCategory('immobilier');
  mappings['7500'] = immobilier?.id; // Services immobiliers

  // Services professionnels
  const servicesPro = findCategory('services-professionnels');
  mappings['7700'] = servicesPro?.id; // Services aux entreprises

  // Organismes publics et communautaires
  const organismesPublics = findCategory('organismes-publics-et-communautaires');
  mappings['8100'] = organismesPublics?.id; // Services administration fédérale
  mappings['8200'] = organismesPublics?.id; // Services administration provinciale
  mappings['8300'] = organismesPublics?.id; // Services administrations locales
  mappings['8400'] = organismesPublics?.id; // Organismes internationaux
  mappings['9800'] = organismesPublics?.id; // Associations

  // Éducation et formation
  const education = findCategory('education-et-formation');
  mappings['8500'] = education?.id; // Services d'enseignement

  // Santé et bien-être
  const sante = findCategory('sante-et-bien-etre');
  mappings['8600'] = sante?.id; // Services santé et services sociaux

  // Tourisme et hébergement
  const tourisme = findCategory('tourisme-et-hebergement');
  mappings['9100'] = tourisme?.id; // Hébergement

  // Restauration et alimentation
  const restauration = findCategory('restauration-et-alimentation');
  mappings['9200'] = restauration?.id; // Restauration

  // Sports et loisirs / Arts et divertissement
  const sports = findCategory('sports-et-loisirs');
  const arts = findCategory('arts-medias-et-divertissement');
  mappings['9600'] = sports?.id || arts?.id; // Services divertissements et loisirs

  // Maison et services domestiques / Services personnels
  const maison = findCategory('maison-et-services-domestiques');
  mappings['9700'] = maison?.id; // Services personnels et domestiques

  // Autres services
  const autres = findCategory('services-professionnels'); // Fallback
  mappings['9900'] = autres?.id; // Autres services

  // 4. Afficher le mapping
  console.log('📊 MAPPING COMPLET:\n');

  for (const actCode of actEconCategories) {
    const mainCatId = mappings[actCode.code];
    const mainCat = mainCategories.find(c => c.id === mainCatId);

    console.log(`${actCode.code}: ${actCode.label_fr}`);
    console.log(`   → ${mainCat ? mainCat.label_fr + ' (' + mainCat.slug + ')' : '❌ NON MAPPÉ'}`);
  }

  // 5. Compter les mappings
  console.log('\n' + '='.repeat(80));
  console.log('📊 STATISTIQUES');
  console.log('='.repeat(80));

  const totalCodes = actEconCategories.length;
  const mappedCodes = Object.values(mappings).filter(id => id != null).length;
  const unmappedCodes = totalCodes - mappedCodes;

  console.log(`
Total codes ACT_ECON:    ${totalCodes}
✅ Mappés:               ${mappedCodes} (${((mappedCodes/totalCodes)*100).toFixed(1)}%)
❌ Non mappés:           ${unmappedCodes}
  `);

  // 6. Générer le SQL d'insertion
  console.log('\n4️⃣ SQL pour insérer les mappings:\n');
  console.log('='.repeat(80));

  let insertSQL = '-- Insérer les mappings ACT_ECON → main_categories\n\n';

  for (const [code, catId] of Object.entries(mappings)) {
    if (catId) {
      const actCat = actEconCategories.find(c => c.code === code);
      const mainCat = mainCategories.find(c => c.id === catId);

      insertSQL += `-- ${code}: ${actCat?.label_fr} → ${mainCat?.label_fr}\n`;
      insertSQL += `INSERT INTO act_econ_to_main_category (act_econ_code, main_category_id, confidence)\n`;
      insertSQL += `VALUES ('${code}', '${catId}', 100)\n`;
      insertSQL += `ON CONFLICT (act_econ_code, main_category_id) DO NOTHING;\n\n`;
    }
  }

  console.log(insertSQL);
  console.log('='.repeat(80));

  // 7. Sauvegarder le SQL dans un fichier
  const fs = await import('fs');
  const path = await import('path');

  const sqlFilePath = path.join(process.cwd(), 'supabase', 'migrations', '20250128_insert_act_econ_mappings.sql');
  fs.writeFileSync(sqlFilePath, insertSQL);

  console.log(`\n✅ SQL sauvegardé dans: ${sqlFilePath}`);

  console.log('\n' + '='.repeat(80));
  console.log('📝 PROCHAINES ÉTAPES');
  console.log('='.repeat(80));
  console.log(`
1. Exécuter la migration pour créer la table:
   → supabase/migrations/20250128_create_act_econ_mapping.sql

2. Exécuter l'insertion des mappings:
   → supabase/migrations/20250128_insert_act_econ_mappings.sql

3. Script pour assigner main_category_id aux entreprises:
   → Pour chaque business avec act_econ_code
   → Lookup dans act_econ_to_main_category
   → SET main_category_id

4. Résultat final:
   ✅ Toutes les entreprises avec ACT_ECON auront main_category_id
   ✅ Filtres par catégorie fonctionneront
   ✅ URLs SEO correctes
  `);
}

generateMappings().catch(console.error);
