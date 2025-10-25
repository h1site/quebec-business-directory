#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Mapping de mots-clés vers catégories (UUID des catégories principales)
const CATEGORY_KEYWORDS = {
  // Restaurants & Alimentation
  'restaurant': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'café': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'bar': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'boulangerie': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'pâtisserie': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'traiteur': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'pizzeria': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'brasserie': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',
  'bistro': '7c1c6c89-ec29-4cf1-95de-ae601f0a4bc9',

  // Construction & Rénovation
  'construction': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'entrepreneur': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'plombier': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'électricien': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'menuisier': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'peintre': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'couvreur': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'excavation': '2a2184fd-03c6-4d3a-ab75-bf250e980531',
  'rénovation': '2a2184fd-03c6-4d3a-ab75-bf250e980531',

  // Santé & Bien-être
  'dentiste': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',
  'médecin': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',
  'clinique': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',
  'pharmacie': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',
  'physiothérapie': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',
  'chiropraticien': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',
  'massothérapie': 'a4787067-aa61-4b89-a9cc-c1b5d61804b5',

  // Services professionnels
  'avocat': 'eb652026-64e2-44b9-add1-02fd2df8da2b',
  'notaire': 'eb652026-64e2-44b9-add1-02fd2df8da2b',
  'comptable': 'eb652026-64e2-44b9-add1-02fd2df8da2b',
  'comptabilité': 'eb652026-64e2-44b9-add1-02fd2df8da2b',
  'consultant': 'eb652026-64e2-44b9-add1-02fd2df8da2b',

  // Commerce de détail
  'boutique': '5a3c70f8-c70a-4a09-8b8f-eadc06d24c0f',
  'magasin': '5a3c70f8-c70a-4a09-8b8f-eadc06d24c0f',
  'commerce': '5a3c70f8-c70a-4a09-8b8f-eadc06d24c0f',
  'vêtement': '5a3c70f8-c70a-4a09-8b8f-eadc06d24c0f',

  // Automobile
  'garage': '60beba89-442b-43ff-8fee-96a28922d789',
  'mécanique': '60beba89-442b-43ff-8fee-96a28922d789',
  'carrosserie': '60beba89-442b-43ff-8fee-96a28922d789',
  'auto': '60beba89-442b-43ff-8fee-96a28922d789',

  // Beauté & Soins personnels
  'coiffure': 'cde982ec-5b91-4e84-bf63-d5ea3b9c0f8d',
  'salon': 'cde982ec-5b91-4e84-bf63-d5ea3b9c0f8d',
  'esthétique': 'cde982ec-5b91-4e84-bf63-d5ea3b9c0f8d',
  'spa': 'cde982ec-5b91-4e84-bf63-d5ea3b9c0f8d',

  // Immobilier
  'immobilier': '52bfec66-2f72-4b8b-9ab5-6ab99f5b6c4e',
  'courtier immobilier': '52bfec66-2f72-4b8b-9ab5-6ab99f5b6c4e',

  // Agriculture
  'ferme': '065589d2-5efd-47d5-a8b1-dcc418023bd6',
  'agricole': '065589d2-5efd-47d5-a8b1-dcc418023bd6',
  'élevage': '065589d2-5efd-47d5-a8b1-dcc418023bd6'
};

async function assignCategoriesByName() {
  console.log('🚀 Assignment des catégories basé sur le nom de l\'entreprise...\n');

  try {
    let totalUpdated = 0;
    let processedKeywords = 0;

    // Pour chaque mot-clé
    for (const [keyword, categoryId] of Object.entries(CATEGORY_KEYWORDS)) {
      console.log(`🔍 Recherche: "${keyword}"...`);

      // Mettre à jour toutes les businesses qui contiennent ce mot-clé dans le nom
      // ET qui n'ont PAS déjà de catégories
      const { data, error } = await supabase
        .from('businesses')
        .update({ categories: [categoryId] })
        .ilike('name', `%${keyword}%`)
        .is('act_econ_code', null)
        .or('categories.is.null,categories.eq.{}')
        .select('id');

      if (error) {
        console.error(`❌ Erreur pour "${keyword}":`, error.message);
        continue;
      }

      const count = data?.length || 0;
      if (count > 0) {
        totalUpdated += count;
        console.log(`   ✅ ${count.toLocaleString()} businesses mises à jour`);
      }

      processedKeywords++;

      // Log progress tous les 10 mots-clés
      if (processedKeywords % 10 === 0) {
        console.log(`\n⏳ Traité ${processedKeywords}/${Object.keys(CATEGORY_KEYWORDS).length} mots-clés | ${totalUpdated.toLocaleString()} businesses mises à jour\n`);
      }
    }

    console.log('\n✅ TERMINÉ!');
    console.log(`📊 Mots-clés traités: ${processedKeywords}`);
    console.log(`📊 Businesses mises à jour: ${totalUpdated.toLocaleString()}`);

    // Vérification finale
    const { count: totalWithCategories } = await supabase
      .from('businesses')
      .select('id', { count: 'exact', head: true })
      .not('categories', 'is', null)
      .neq('categories', '[]');

    console.log(`\n🎯 Total businesses avec catégories: ${totalWithCategories?.toLocaleString()}`);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

assignCategoriesByName();
