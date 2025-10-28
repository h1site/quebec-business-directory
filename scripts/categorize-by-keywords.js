import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Mapping de mots-clés vers les category IDs
const KEYWORD_MAPPINGS = {
  // Construction et rénovation (60beba89-442b-43ff-8fee-96a28922d789)
  '60beba89-442b-43ff-8fee-96a28922d789': [
    'construction', 'rénovation', 'plomberie', 'plombier', 'électrique', 'électricien',
    'toiture', 'couvreur', 'peinture', 'peintre', 'menuiserie', 'menuisier',
    'maçon', 'charpentier', 'entrepreneur général', 'excavation', 'béton',
    'réparation', 'revêtement', 'plancher', 'gypse', 'isolation'
  ],

  // Restauration et alimentation (ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9)
  'ae570981-13b3-4d4b-9f5c-b6ce0e8db8f9': [
    'restaurant', 'café', 'bar', 'bistro', 'brasserie', 'pizzeria', 'cantine',
    'traiteur', 'boulangerie', 'pâtisserie', 'boucherie', 'épicerie',
    'alimentation', 'buffet', 'grill', 'resto', 'food', 'cuisine'
  ],

  // Santé et bien-être (b6f1a7d3-9a7c-4871-bd63-2770ba99540f)
  'b6f1a7d3-9a7c-4871-bd63-2770ba99540f': [
    'dentiste', 'médecin', 'clinique', 'pharmacie', 'physiothérapie', 'physio',
    'chiropratique', 'chiro', 'ostéopathie', 'massothérapie', 'massage',
    'optométriste', 'lunettes', 'santé', 'médical', 'paramédical', 'soins'
  ],

  // Automobile et transport (25933a72-f5d2-4eed-8275-397dc1a8c897)
  '25933a72-f5d2-4eed-8275-397dc1a8c897': [
    'garage', 'automobile', 'auto', 'mécanique', 'mécano', 'carrosserie',
    'débosselage', 'pneu', 'taxi', 'transport', 'camion', 'remorquage',
    'véhicule', 'concessionnaire', 'honda', 'toyota', 'ford', 'gm'
  ],

  // Immobilier (2a9a3e8f-e13b-4d4f-bb8c-b483a3c356ca)
  '2a9a3e8f-e13b-4d4f-bb8c-b483a3c356ca': [
    'immobilier', 'courtier immobilier', 'proprio direct', 'logement',
    'appartement', 'condo', 'maison', 'location', 'gestion immobilière'
  ],

  // Services professionnels (944753c0-0ebf-4d74-9168-268fab04fc0d)
  '944753c0-0ebf-4d74-9168-268fab04fc0d': [
    'avocat', 'notaire', 'comptable', 'cpa', 'consultant', 'conseiller',
    'expertise', 'juridique', 'fiscalité', 'ressources humaines', 'rh'
  ],

  // Éducation et formation (783970a1-2bed-4f8e-9f1b-29bfb68cf3b3)
  '783970a1-2bed-4f8e-9f1b-29bfb68cf3b3': [
    'école', 'garderie', 'cpe', 'formation', 'cours', 'enseignement',
    'éducation', 'académie', 'collège', 'université', 'tutorat'
  ],

  // Commerce de détail (271eef26-7324-4a26-932e-9a52f60cc985)
  '271eef26-7324-4a26-932e-9a52f60cc985': [
    'boutique', 'magasin', 'commerce', 'vente', 'détail', 'quincaillerie',
    'dépanneur', 'pharmacie', 'fleuriste', 'bijouterie', 'vêtement'
  ],

  // Agriculture et environnement (065589d2-5efd-47d5-a8b1-dcc418023bd6)
  '065589d2-5efd-47d5-a8b1-dcc418023bd6': [
    'ferme', 'agricole', 'agriculture', 'élevage', 'culture', 'serre',
    'maraîcher', 'paysagiste', 'aménagement paysager', 'jardin', 'horticulture'
  ],

  // Maison et services domestiques (ae549a95-5732-4b7f-8aa8-4460e087acbd)
  'ae549a95-5732-4b7f-8aa8-4460e087acbd': [
    'ménage', 'nettoyage', 'entretien ménager', 'femme de ménage',
    'aide domestique', 'conciergerie', 'lavage de vitres'
  ],

  // Technologie et informatique (efab1e6e-3c3b-4240-9625-c27477667630)
  'efab1e6e-3c3b-4240-9625-c27477667630': [
    'informatique', 'logiciel', 'web', 'programmation', 'développement',
    'it', 'tech', 'numérique', 'digital', 'internet', 'site web'
  ],

  // Tourisme et hébergement (a43306cc-1d4f-4a49-bb28-41a372889b18)
  'a43306cc-1d4f-4a49-bb28-41a372889b18': [
    'hôtel', 'motel', 'auberge', 'gîte', 'hébergement', 'camping',
    'tourisme', 'vacances', 'chalet', 'location saisonnière'
  ],

  // Arts, médias et divertissement (...)
  // Sports et loisirs (a57cc9f2-15f0-4ffe-880b-2d48f5fba09e)
  'a57cc9f2-15f0-4ffe-880b-2d48f5fba09e': [
    'gym', 'fitness', 'sport', 'golf', 'hockey', 'soccer', 'natation',
    'entraîneur', 'loisir', 'centre sportif', 'club'
  ]
};

const BATCH_SIZE = 1000;

async function categorizeByKeywords() {
  console.log('🏷️  Catégorisation par mots-clés dans les noms d\'entreprises\n');
  console.log('='.repeat(80));

  // Compter les entreprises sans catégorie
  const { count: totalUncategorized } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .is('main_category_id', null);

  console.log(`\n📊 ${totalUncategorized.toLocaleString()} entreprises sans catégorie`);
  console.log(`   Taille du batch: ${BATCH_SIZE}`);
  console.log(`   Batches estimés: ${Math.ceil(totalUncategorized / BATCH_SIZE)}\n`);

  let totalCategorized = 0;
  let processed = 0;
  const categoryStats = {};

  while (processed < totalUncategorized) {
    // Fetch batch
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, description')
      .is('main_category_id', null)
      .range(0, BATCH_SIZE - 1);

    if (!businesses || businesses.length === 0) {
      break;
    }

    const updates = [];

    for (const biz of businesses) {
      const searchText = `${biz.name} ${biz.description || ''}`.toLowerCase();
      let matchedCategory = null;
      let maxScore = 0;

      // Chercher la meilleure correspondance
      for (const [categoryId, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
        let score = 0;
        for (const keyword of keywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            score += keyword.length; // Mots plus longs = meilleur score
          }
        }

        if (score > maxScore) {
          maxScore = score;
          matchedCategory = categoryId;
        }
      }

      if (matchedCategory) {
        updates.push({ id: biz.id, categoryId: matchedCategory });
        categoryStats[matchedCategory] = (categoryStats[matchedCategory] || 0) + 1;
      }
    }

    // Mettre à jour par groupes de catégorie
    for (const [categoryId, count] of Object.entries(categoryStats)) {
      const ids = updates.filter(u => u.categoryId === categoryId).map(u => u.id);

      if (ids.length > 0) {
        const { error } = await supabase
          .from('businesses')
          .update({ main_category_id: categoryId })
          .in('id', ids);

        if (!error) {
          totalCategorized += ids.length;
        }
      }
    }

    processed += businesses.length;
    const progress = ((processed / totalUncategorized) * 100).toFixed(1);

    console.log(`📦 Batch terminé`);
    console.log(`   Progrès: ${processed.toLocaleString()}/${totalUncategorized.toLocaleString()} (${progress}%)`);
    console.log(`   ✅ Catégorisées dans ce batch: ${updates.length}`);
    console.log(`   📊 Total catégorisées: ${totalCategorized.toLocaleString()}\n`);

    // Pause pour ne pas surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ TERMINÉ!\n');
  console.log(`📊 Résultat final:`);
  console.log(`   Traité: ${processed.toLocaleString()} entreprises`);
  console.log(`   Catégorisées: ${totalCategorized.toLocaleString()} entreprises`);
  console.log(`   Taux de correspondance: ${((totalCategorized / processed) * 100).toFixed(1)}%\n`);

  console.log('📈 Répartition par catégorie:');
  Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catId, count]) => {
      console.log(`   ${catId}: ${count.toLocaleString()} entreprises`);
    });
}

categorizeByKeywords().catch(console.error);
