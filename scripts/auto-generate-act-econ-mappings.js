import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('🤖 AUTO-GÉNÉRATION DES MAPPINGS ACT_ECON\n');
console.log('═══════════════════════════════════════════════════════════\n');

// Charger les données
console.log('📥 Chargement des données...\n');

const { data: actEconCodes } = await supabase
  .from('act_econ_codes')
  .select('*')
  .order('code');

const { data: mainCats } = await supabase
  .from('main_categories')
  .select('*');

const { data: subCats } = await supabase
  .from('sub_categories')
  .select('*');

console.log(`✅ ${actEconCodes.length} codes ACT_ECON`);
console.log(`✅ ${mainCats.length} catégories principales`);
console.log(`✅ ${subCats.length} sous-catégories\n`);

// Définir les règles de mapping basées sur mots-clés
const mappingRules = [
  // ============ AGRICULTURE ET ENVIRONNEMENT ============
  {
    mainCategorySlug: 'agriculture-et-environnement',
    rules: [
      { keywords: ['agriculture', 'agricole', 'élevage', 'culture', 'ferme', 'bétail', 'volaille', 'pêche', 'forestier', 'forêt', 'érablière', 'serre', 'pépinière', 'horticulture'], prefixes: ['01', '02', '03', '04', '05'] },
    ]
  },

  // ============ CONSTRUCTION ET RÉNOVATION ============
  {
    mainCategorySlug: 'construction-et-renovation',
    rules: [
      { keywords: ['construction', 'bâtiment', 'entrepreneur', 'maçonnerie', 'charpente', 'plomberie', 'électricité', 'peinture', 'toiture', 'excavation', 'démolition', 'rénovation'], prefixes: ['44', '45'] },
    ]
  },

  // ============ RESTAURATION ET ALIMENTATION ============
  {
    mainCategorySlug: 'restauration-et-alimentation',
    rules: [
      { keywords: ['restaurant', 'aliment', 'viande', 'boulangerie', 'pâtisserie', 'boisson', 'café', 'traiteur', 'alimentation', 'bière', 'vin', 'cidre', 'confiserie', 'chocolat'], prefixes: ['10', '11', '72'] },
    ]
  },

  // ============ SANTÉ ET BIEN-ÊTRE ============
  {
    mainCategorySlug: 'sante-et-bien-etre',
    rules: [
      { keywords: ['santé', 'médical', 'hôpital', 'clinique', 'dentiste', 'vétérinaire', 'pharmacie', 'laboratoire médical', 'soins', 'thérapie', 'chiropratique', 'optométrie'], prefixes: ['62'] },
    ]
  },

  // ============ COMMERCE DE DÉTAIL ============
  {
    mainCategorySlug: 'commerce-de-detail',
    rules: [
      { keywords: ['magasin', 'commerce', 'vente au détail', 'détail', 'boutique', 'épicerie', 'supermarch', 'dépanneur', 'quincaillerie', 'vêtement', 'chaussure', 'bijouterie', 'pharmacie'], prefixes: ['44', '45'] },
    ]
  },

  // ============ SERVICES PROFESSIONNELS ============
  {
    mainCategorySlug: 'services-professionnels',
    rules: [
      { keywords: ['comptable', 'avocat', 'notaire', 'consultant', 'conseil', 'architecture', 'ingénierie', 'design', 'publicité', 'marketing', 'expert-conseil', 'gestion'], prefixes: ['54', '55'] },
    ]
  },

  // ============ TECHNOLOGIE ET INFORMATIQUE ============
  {
    mainCategorySlug: 'technologie-et-informatique',
    rules: [
      { keywords: ['informatique', 'logiciel', 'programmation', 'internet', 'télécommunication', 'électronique', 'technologie', 'ordinateur', 'téléphone', 'réseau'], prefixes: ['51', '54'] },
    ]
  },

  // ============ AUTOMOBILE ET TRANSPORT ============
  {
    mainCategorySlug: 'automobile-et-transport',
    rules: [
      { keywords: ['automobile', 'véhicule', 'transport', 'camion', 'taxi', 'autobus', 'mécanique automobile', 'garage', 'pneu', 'carrosserie', 'entreposage'], prefixes: ['48', '49', '44'] },
    ]
  },

  // ============ IMMOBILIER ============
  {
    mainCategorySlug: 'immobilier',
    rules: [
      { keywords: ['immobilier', 'location immobilière', 'immeuble', 'propriété', 'gestion immobilière', 'logement', 'appartement'], prefixes: ['53'] },
    ]
  },

  // ============ TOURISME ET HÉBERGEMENT ============
  {
    mainCategorySlug: 'tourisme-et-hebergement',
    rules: [
      { keywords: ['hôtel', 'hébergement', 'motel', 'auberge', 'camping', 'tourisme', 'voyage', 'agence de voyage'], prefixes: ['72'] },
    ]
  },

  // ============ INDUSTRIE, FABRICATION ET LOGISTIQUE ============
  {
    mainCategorySlug: 'industrie-fabrication-et-logistique',
    rules: [
      { keywords: ['industrie', 'fabrication', 'manufacture', 'usine', 'production', 'transformation', 'entreposage', 'logistique', 'meuble', 'textile', 'plastique', 'caoutchouc', 'métallurgie'], prefixes: ['31', '32', '33'] },
    ]
  },

  // ============ FINANCE, ASSURANCE ET JURIDIQUE ============
  {
    mainCategorySlug: 'finance-assurance-et-juridique',
    rules: [
      { keywords: ['banque', 'finance', 'crédit', 'assurance', 'placement', 'investissement', 'courtage', 'prêt', 'caisse'], prefixes: ['52'] },
    ]
  },

  // ============ ÉDUCATION ET FORMATION ============
  {
    mainCategorySlug: 'education-et-formation',
    rules: [
      { keywords: ['école', 'éducation', 'enseignement', 'formation', 'université', 'collège', 'cours', 'académie', 'tutorat'], prefixes: ['61'] },
    ]
  },

  // ============ ARTS, MÉDIAS ET DIVERTISSEMENT ============
  {
    mainCategorySlug: 'arts-medias-et-divertissement',
    rules: [
      { keywords: ['arts', 'musée', 'théâtre', 'spectacle', 'cinéma', 'divertissement', 'média', 'télévision', 'radio', 'production', 'artiste', 'galerie'], prefixes: ['71'] },
    ]
  },

  // ============ SPORTS ET LOISIRS ============
  {
    mainCategorySlug: 'sports-et-loisirs',
    rules: [
      { keywords: ['sport', 'loisir', 'récréation', 'gymnase', 'fitness', 'golf', 'piscine', 'aréna', 'centre sportif'], prefixes: ['71'] },
    ]
  },

  // ============ MAISON ET SERVICES DOMESTIQUES ============
  {
    mainCategorySlug: 'maison-et-services-domestiques',
    rules: [
      { keywords: ['nettoyage', 'entretien ménager', 'réparation', 'aménagement paysager', 'déneigement', 'services domestiques', 'blanchisserie', 'pressing'], prefixes: ['81'] },
    ]
  },

  // ============ ORGANISMES PUBLICS ET COMMUNAUTAIRES ============
  {
    mainCategorySlug: 'organismes-publics-et-communautaires',
    rules: [
      { keywords: ['administration publique', 'gouvernement', 'municipal', 'organisme', 'association', 'syndic', 'services sociaux'], prefixes: ['91'] },
    ]
  },

  // ============ SERVICES FUNÉRAIRES ============
  {
    mainCategorySlug: 'services-funeraires',
    rules: [
      { keywords: ['funéraire', 'funérailles', 'salon funéraire', 'crématorium', 'cimetière'], prefixes: ['81'] },
    ]
  },

  // ============ EXTRACTION ET MINES ============
  {
    mainCategorySlug: 'agriculture-et-environnement',  // Regrouper avec agriculture
    rules: [
      { keywords: ['mine', 'pétrole', 'gaz', 'carrière', 'gravière', 'extraction', 'minerai'], prefixes: ['06', '07', '08', '09', '21'] },
    ]
  },
];

console.log('═══════════════════════════════════════════════════════════\n');
console.log('🔄 Génération des mappings automatiques...\n');

const mappings = [];
let matchedCount = 0;
let unmatchedCount = 0;

// Pour chaque code ACT_ECON, trouver la meilleure catégorie
actEconCodes.forEach(code => {
  let bestMatch = null;
  let bestScore = 0;

  const label = code.label_fr.toLowerCase();
  const codePrefix = code.code.substring(0, 2);

  // Tester chaque règle de mapping
  mappingRules.forEach(mapping => {
    mapping.rules.forEach(rule => {
      let score = 0;

      // Points pour correspondance de préfixe
      if (rule.prefixes && rule.prefixes.includes(codePrefix)) {
        score += 10;
      }

      // Points pour mots-clés
      rule.keywords.forEach(keyword => {
        if (label.includes(keyword.toLowerCase())) {
          score += 5;
        }
      });

      // Garder le meilleur match
      if (score > bestScore) {
        bestScore = score;
        bestMatch = mapping.mainCategorySlug;
      }
    });
  });

  if (bestMatch && bestScore >= 5) {  // Seuil minimum de confiance
    const mainCat = mainCats.find(mc => mc.slug === bestMatch);
    if (mainCat) {
      mappings.push({
        act_econ_code: code.code,
        main_category_id: mainCat.id,
        sub_category_id: null,  // Pas de sous-catégorie pour l'instant
        confidence_score: Math.min(bestScore / 20, 1.0),  // Normaliser à 0-1
        mapping_notes: `Auto-mapping: ${code.label_fr}`,
        mapped_by: 'auto'
      });
      matchedCount++;
    }
  } else {
    unmatchedCount++;
  }
});

console.log(`✅ ${matchedCount} codes mappés automatiquement`);
console.log(`⚠️  ${unmatchedCount} codes non mappés (nécessitent mapping manuel)\n`);

// Afficher quelques exemples
console.log('📋 Exemples de mappings générés (premiers 30):\n');
mappings.slice(0, 30).forEach(m => {
  const code = actEconCodes.find(c => c.code === m.act_econ_code);
  const mainCat = mainCats.find(mc => mc.id === m.main_category_id);
  console.log(`   ${m.act_econ_code} "${code.label_fr}"`);
  console.log(`   → ${mainCat.slug} (confiance: ${(m.confidence_score * 100).toFixed(0)}%)\n`);
});

// Sauvegarder dans un fichier JSON pour review
const outputFile = 'data/act-econ-mappings-generated.json';
fs.writeFileSync(outputFile, JSON.stringify(mappings, null, 2));
console.log(`💾 Mappings sauvegardés dans: ${outputFile}\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('❓ VOULEZ-VOUS INSÉRER CES MAPPINGS DANS LA BASE?\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('Pour insérer, lancez:');
console.log('  node scripts/insert-act-econ-mappings.js\n');

// Statistiques par catégorie
console.log('📊 RÉPARTITION PAR CATÉGORIE:\n');
const statsByCategory = {};
mappings.forEach(m => {
  const mainCat = mainCats.find(mc => mc.id === m.main_category_id);
  if (!statsByCategory[mainCat.slug]) {
    statsByCategory[mainCat.slug] = 0;
  }
  statsByCategory[mainCat.slug]++;
});

Object.keys(statsByCategory)
  .sort((a, b) => statsByCategory[b] - statsByCategory[a])
  .forEach(slug => {
    console.log(`   ${slug.padEnd(40)} ${statsByCategory[slug]} codes`);
  });

console.log('\n═══════════════════════════════════════════════════════════');
