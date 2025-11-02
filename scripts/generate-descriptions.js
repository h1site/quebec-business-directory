/**
 * Generate automatic descriptions for businesses based on available data
 * Uses: name, city, region, category, subcategory
 * Outputs: French and English descriptions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

console.log('📝 GÉNÉRATION DE DESCRIPTIONS AUTOMATIQUES');
console.log('═'.repeat(60));

// Templates for descriptions - varied to avoid duplicate content
const frenchTemplates = [
  // Template 1: Professional & detailed
  (data) => {
    let desc = `${data.name} est ${data.article} ${data.category} ${data.subcategory ? `spécialisé${data.feminine ? 'e' : ''} en ${data.subcategory}` : ''} situé${data.feminine ? 'e' : ''} à ${data.city}`;

    if (data.region) desc += ` dans la région ${data.region}`;
    if (data.mrc) desc += ` (MRC ${data.mrc})`;
    desc += ', Québec.';

    if (data.hasReviews) {
      desc += ` Avec une note moyenne de ${data.rating}/5 basée sur ${data.reviewCount} avis Google, ${data.name} est reconnu${data.feminine ? 'e' : ''} pour la qualité de ses services.`;
    }

    if (data.hasWebsite) {
      desc += ` Pour plus d'informations, visitez le site web officiel ou contactez l'entreprise directement.`;
    }

    return desc;
  },

  // Template 2: Service-focused
  (data) => {
    let desc = `Découvrez ${data.name}, votre ${data.category} de confiance à ${data.city}`;

    if (data.region) desc += ` (${data.region})`;
    desc += '.';

    if (data.subcategory) {
      desc += ` Spécialisé${data.feminine ? 'e' : ''} en ${data.subcategory}, ${data.name} offre des services professionnels adaptés à vos besoins.`;
    }

    if (data.hasReviews) {
      desc += ` Noté${data.feminine ? 'e' : ''} ${data.rating}/5 par ${data.reviewCount} client${data.reviewCount > 1 ? 's' : ''}, cette entreprise jouit d'une excellente réputation locale.`;
    }

    desc += ` Contactez ${data.name} pour obtenir plus d'informations sur les services offerts.`;

    return desc;
  },

  // Template 3: Location-focused
  (data) => {
    let desc = `Situé${data.feminine ? 'e' : ''} à ${data.city}`;

    if (data.region && data.mrc) {
      desc += ` dans la MRC ${data.mrc} (région ${data.region})`;
    } else if (data.region) {
      desc += ` dans la région ${data.region}`;
    }

    desc += `, ${data.name} est ${data.article} ${data.category}`;

    if (data.subcategory) {
      desc += ` offrant des services en ${data.subcategory}`;
    }

    desc += ` au Québec.`;

    if (data.hasReviews) {
      desc += ` L'entreprise maintient une note de ${data.rating}/5 étoiles grâce à ${data.reviewCount} avis de clients satisfaits.`;
    }

    desc += ` Trouvez toutes les coordonnées et informations pratiques sur cette page.`;

    return desc;
  }
];

const englishTemplates = [
  // Template 1: Professional & detailed
  (data) => {
    let desc = `${data.name} is ${data.article_en} ${data.category_en} ${data.subcategory_en ? `specializing in ${data.subcategory_en}` : ''} located in ${data.city}`;

    if (data.region) desc += `, ${data.region} region`;
    if (data.mrc) desc += ` (MRC ${data.mrc})`;
    desc += ', Quebec.';

    if (data.hasReviews) {
      desc += ` With an average rating of ${data.rating}/5 based on ${data.reviewCount} Google reviews, ${data.name} is recognized for quality service.`;
    }

    if (data.hasWebsite) {
      desc += ` For more information, visit the official website or contact the business directly.`;
    }

    return desc;
  },

  // Template 2: Service-focused
  (data) => {
    let desc = `Discover ${data.name}, your trusted ${data.category_en} in ${data.city}`;

    if (data.region) desc += ` (${data.region} region)`;
    desc += '.';

    if (data.subcategory_en) {
      desc += ` Specializing in ${data.subcategory_en}, ${data.name} offers professional services tailored to your needs.`;
    }

    if (data.hasReviews) {
      desc += ` Rated ${data.rating}/5 by ${data.reviewCount} customer${data.reviewCount > 1 ? 's' : ''}, this business enjoys an excellent local reputation.`;
    }

    desc += ` Contact ${data.name} for more information about the services offered.`;

    return desc;
  },

  // Template 3: Location-focused
  (data) => {
    let desc = `Located in ${data.city}`;

    if (data.region && data.mrc) {
      desc += ` in the MRC ${data.mrc} (${data.region} region)`;
    } else if (data.region) {
      desc += ` in the ${data.region} region`;
    }

    desc += `, ${data.name} is ${data.article_en} ${data.category_en}`;

    if (data.subcategory_en) {
      desc += ` offering services in ${data.subcategory_en}`;
    }

    desc += ` in Quebec.`;

    if (data.hasReviews) {
      desc += ` The business maintains a ${data.rating}/5 star rating thanks to ${data.reviewCount} satisfied customer reviews.`;
    }

    desc += ` Find all contact details and practical information on this page.`;

    return desc;
  }
];

// Helper to determine article (un/une)
function getArticle(categoryLabel, isFeminine) {
  if (!categoryLabel) return isFeminine ? 'une' : 'un';

  const vowels = ['a', 'e', 'i', 'o', 'u', 'h'];
  const firstChar = categoryLabel.toLowerCase().charAt(0);

  if (vowels.includes(firstChar)) return 'un';
  return isFeminine ? 'une' : 'un';
}

function getArticleEn(categoryLabel) {
  if (!categoryLabel) return 'a';

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const firstChar = categoryLabel.toLowerCase().charAt(0);

  return vowels.includes(firstChar) ? 'an' : 'a';
}

// Categories that are typically feminine in French
const feminineCategories = [
  'agence', 'entreprise', 'clinique', 'école', 'boutique',
  'pharmacie', 'librairie', 'boulangerie', 'pâtisserie'
];

function isFeminineCategory(label) {
  if (!label) return false;
  const lowerLabel = label.toLowerCase();
  return feminineCategories.some(fem => lowerLabel.includes(fem));
}

// Generate description for a business
function generateDescription(business, templateIndex = 0) {
  const data = {
    name: business.name,
    city: business.city || 'Québec',
    region: business.region,
    mrc: business.mrc,
    category: business.primary_main_category_fr || 'entreprise',
    category_en: business.primary_main_category_en || 'business',
    subcategory: business.primary_sub_category_fr,
    subcategory_en: business.primary_sub_category_en,
    hasReviews: business.google_reviews_count > 0,
    reviewCount: business.google_reviews_count || 0,
    rating: business.google_rating ? business.google_rating.toFixed(1) : '0.0',
    hasWebsite: !!business.website,
    feminine: isFeminineCategory(business.primary_main_category_fr),
    article: '',
    article_en: ''
  };

  data.article = getArticle(data.category, data.feminine);
  data.article_en = getArticleEn(data.category_en);

  // Use modulo to cycle through templates for variety
  const frIndex = templateIndex % frenchTemplates.length;
  const enIndex = templateIndex % englishTemplates.length;

  return {
    description_fr: frenchTemplates[frIndex](data),
    description_en: englishTemplates[enIndex](data)
  };
}

// Main execution
async function main() {
  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Total d'entreprises: ${totalBusinesses.toLocaleString()}`);

  // Count businesses without descriptions
  const { count: withoutDesc } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .or('description.is.null,description.eq.');

  console.log(`📝 Sans description: ${withoutDesc.toLocaleString()}`);

  // Priority: businesses with reviews and/or website (premium content)
  console.log('\n🎯 Ciblage des entreprises prioritaires...');

  const { data: priorityBusinesses, error } = await supabase
    .from('businesses_enriched')
    .select('id, name, slug, city, region, mrc, primary_main_category_fr, primary_main_category_en, primary_sub_category_fr, primary_sub_category_en, google_reviews_count, google_rating, website, description')
    .or('google_reviews_count.gt.0,website.neq.')
    .or('description.is.null,description.eq.')
    .order('google_reviews_count', { ascending: false })
    .limit(100); // Start with 100 for testing

  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }

  console.log(`✅ ${priorityBusinesses.length} entreprises prioritaires trouvées`);
  console.log('\n📝 Génération des descriptions...\n');

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < priorityBusinesses.length; i++) {
    const business = priorityBusinesses[i];

    // Skip if already has description
    if (business.description && business.description.length > 20) {
      skipped++;
      continue;
    }

    // Generate descriptions
    const { description_fr, description_en } = generateDescription(business, i);

    // Update database (only FR for now, EN will be added later)
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        description: description_fr,
        updated_at: new Date().toISOString()
      })
      .eq('id', business.id);

    if (updateError) {
      console.error(`❌ Erreur pour ${business.name}:`, updateError.message);
      continue;
    }

    updated++;

    if (updated % 10 === 0) {
      console.log(`   ✅ ${updated} descriptions générées...`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ GÉNÉRATION TERMINÉE!');
  console.log(`📊 Résultats:`);
  console.log(`   - Descriptions créées: ${updated}`);
  console.log(`   - Déjà présentes: ${skipped}`);
  console.log(`   - Total traité: ${priorityBusinesses.length}`);
  console.log('═'.repeat(60));

  // Show examples
  if (updated > 0) {
    console.log('\n📄 Exemples de descriptions générées:\n');

    const { data: examples } = await supabase
      .from('businesses_enriched')
      .select('name, city, description')
      .not('description', 'is', null)
      .neq('description', '')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (examples) {
      examples.forEach((ex, i) => {
        console.log(`${i + 1}. ${ex.name} (${ex.city})`);
        console.log(`   ${ex.description}`);
        console.log('');
      });
    }
  }

  console.log('\n💡 Prochaines étapes:');
  console.log('   1. Vérifier la qualité des descriptions générées');
  console.log('   2. Augmenter la limite pour traiter plus d\'entreprises');
  console.log('   3. Régénérer les sitemaps avec nouvelles priorités');
  console.log('   4. Soumettre à Google Search Console');
  console.log('');
}

main().catch(console.error);
