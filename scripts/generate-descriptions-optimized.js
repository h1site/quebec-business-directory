/**
 * Generate automatic descriptions for businesses based on available data
 * OPTIMIZED VERSION with timeout handling and smaller batches
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

console.log('📝 GÉNÉRATION DE DESCRIPTIONS AUTOMATIQUES (OPTIMISÉE)');
console.log('═'.repeat(60));

// Templates for descriptions - varied to avoid duplicate content
const frenchTemplates = [
  // Template 1: Professional & detailed
  (data) => {
    // WITH category
    if (data.hasCategory) {
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
    }

    // WITHOUT category - Focus on location + reputation
    let desc = `${data.name} est une entreprise locale établie à ${data.city}`;
    if (data.region) desc += ` dans la région ${data.region}`;
    desc += ', Québec.';

    if (data.hasReviews) {
      desc += ` Avec une note moyenne de ${data.rating}/5 basée sur ${data.reviewCount} avis Google, cette entreprise est reconnue pour la qualité de ses services professionnels.`;
    } else if (data.hasWebsite) {
      desc += ` Pour plus d'informations sur les services offerts, visitez le site web officiel ou contactez l'entreprise directement.`;
    } else if (data.region || data.mrc) {
      desc += ` Contactez ${data.name} pour obtenir plus d'informations sur les services offerts dans votre région.`;
    } else {
      desc += ` Vous pouvez contacter ${data.name} pour découvrir les services offerts et obtenir un service personnalisé adapté à vos besoins.`;
    }

    return desc;
  },

  // Template 2: Service-focused
  (data) => {
    // WITH category
    if (data.hasCategory) {
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
    }

    // WITHOUT category - Focus on services
    let desc = `Découvrez ${data.name} à ${data.city}`;
    if (data.region) desc += ` (${data.region})`;
    desc += '.';

    if (data.hasReviews) {
      desc += ` Offrant des services professionnels de qualité, ${data.name} répond à vos besoins avec expertise. Noté${data.feminine ? 'e' : ''} ${data.rating}/5 par ${data.reviewCount} clients satisfaits, l'entreprise jouit d'une excellente réputation dans la région.`;
    } else if (data.hasWebsite) {
      desc += ` Offrant des services professionnels adaptés à vos besoins, cette entreprise locale met son expertise à votre disposition. Visitez le site web pour en savoir plus.`;
    } else {
      desc += ` Cette entreprise locale offre des services adaptés à vos besoins. Contactez ${data.name} dès aujourd'hui pour discuter de votre projet.`;
    }

    return desc;
  },

  // Template 3: Location-focused
  (data) => {
    // WITH category
    if (data.hasCategory) {
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

    // WITHOUT category - Focus on geographic presence
    let desc = `Établie à ${data.city}`;
    if (data.region) desc += ` dans la région ${data.region}`;
    desc += `, ${data.name}`;

    if (data.hasReviews) {
      desc += ` dessert la région avec des services de qualité. L'entreprise locale maintient une note de ${data.rating}/5 étoiles grâce à ${data.reviewCount} avis de clients satisfaits de la région.`;
    } else if (data.hasWebsite) {
      desc += ` est une entreprise locale au service de la communauté. Consultez le site web pour découvrir la gamme complète de services offerts.`;
    } else {
      desc += ` est une entreprise de la région offrant des services à la communauté locale. Trouvez les coordonnées et prenez contact directement pour vos besoins.`;
    }

    return desc;
  }
];

const englishTemplates = [
  // Template 1: Professional & detailed
  (data) => {
    // WITH category
    if (data.hasCategory) {
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
    }

    // WITHOUT category - Focus on location + reputation
    let desc = `${data.name} is a local business established in ${data.city}`;
    if (data.region) desc += ` in the ${data.region} region`;
    desc += ', Quebec.';

    if (data.hasReviews) {
      desc += ` With an average rating of ${data.rating}/5 based on ${data.reviewCount} Google reviews, this business is recognized for quality professional services.`;
    } else if (data.hasWebsite) {
      desc += ` For more information about the services offered, visit the official website or contact the business directly.`;
    } else if (data.region || data.mrc) {
      desc += ` Contact ${data.name} for more information about the services offered in your area.`;
    } else {
      desc += ` You can contact ${data.name} to discover the services offered and get personalized service tailored to your needs.`;
    }

    return desc;
  },

  // Template 2: Service-focused
  (data) => {
    // WITH category
    if (data.hasCategory) {
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
    }

    // WITHOUT category - Focus on services
    let desc = `Discover ${data.name} in ${data.city}`;
    if (data.region) desc += ` (${data.region} region)`;
    desc += '.';

    if (data.hasReviews) {
      desc += ` Offering quality professional services, ${data.name} meets your needs with expertise. Rated ${data.rating}/5 by ${data.reviewCount} satisfied customers, the business enjoys an excellent reputation in the region.`;
    } else if (data.hasWebsite) {
      desc += ` Offering professional services tailored to your needs, this local business puts its expertise at your disposal. Visit the website to learn more.`;
    } else {
      desc += ` This local business offers services adapted to your needs. Contact ${data.name} today to discuss your project.`;
    }

    return desc;
  },

  // Template 3: Location-focused
  (data) => {
    // WITH category
    if (data.hasCategory) {
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

    // WITHOUT category - Focus on geographic presence
    let desc = `Established in ${data.city}`;
    if (data.region) desc += ` in the ${data.region} region`;
    desc += `, ${data.name}`;

    if (data.hasReviews) {
      desc += ` serves the region with quality services. The local business maintains a ${data.rating}/5 star rating thanks to ${data.reviewCount} satisfied customer reviews from the region.`;
    } else if (data.hasWebsite) {
      desc += ` is a local business serving the community. Visit the website to discover the full range of services offered.`;
    } else {
      desc += ` is a local business offering services to the community. Find contact details and get in touch directly for your needs.`;
    }

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
  const hasCategory = !!(business.primary_main_category_fr && business.primary_main_category_fr.trim());

  const data = {
    name: business.name,
    city: business.city || 'Québec',
    region: business.region,
    mrc: business.mrc,
    category: business.primary_main_category_fr || 'entreprise',
    category_en: business.primary_main_category_en || 'business',
    subcategory: business.primary_sub_category_fr,
    subcategory_en: business.primary_sub_category_en,
    hasCategory: hasCategory,
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

// Sleep function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution
async function main() {
  const { count: totalBusinesses, error: countError1 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });

  if (countError1 || !totalBusinesses) {
    console.log('📊 Total d\'entreprises: (impossible de compter)');
  } else {
    console.log(`📊 Total d'entreprises: ${totalBusinesses.toLocaleString()}`);
  }

  // Count businesses without descriptions
  const { count: withoutDesc, error: countError2 } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .or('description.is.null,description.eq.');

  if (countError2 || !withoutDesc) {
    console.log('📝 Sans description: (impossible de compter)');
  } else {
    console.log(`📝 Sans description: ${withoutDesc.toLocaleString()}`);
  }

  // OPTIMIZED: Smaller batch size to avoid timeouts
  const BATCH_SIZE = 500;  // Reduced from 1000 to 500
  const MAX_BATCHES_PER_SESSION = 50;  // Process max 25,000 descriptions per session
  let offset = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let batchesProcessed = 0;
  let hasMore = true;
  let consecutiveErrors = 0;
  const MAX_CONSECUTIVE_ERRORS = 3;

  console.log('\n🎯 Ciblage des entreprises prioritaires (NON réclamées)...');
  console.log(`   Taille de batch: ${BATCH_SIZE}`);
  console.log(`   Limite par session: ${MAX_BATCHES_PER_SESSION} batches (${MAX_BATCHES_PER_SESSION * BATCH_SIZE} descriptions)\n`);

  while (hasMore && batchesProcessed < MAX_BATCHES_PER_SESSION) {
    console.log(`\n📦 Traitement du batch ${batchesProcessed + 1} (offset: ${offset})...`);

    try {
      // Add timeout handling with retry
      const { data: priorityBusinesses, error } = await supabase
        .from('businesses_enriched')
        .select('id, name, slug, city, region, mrc, primary_main_category_fr, primary_main_category_en, primary_sub_category_fr, primary_sub_category_en, google_reviews_count, google_rating, website, description, is_claimed')
        .eq('is_claimed', false)
        .or('description.is.null,description.eq.')
        .order('google_reviews_count', { ascending: false, nullsLast: true })
        .range(offset, offset + BATCH_SIZE - 1);

      if (error) {
        console.error('❌ Erreur batch:', error.message);
        consecutiveErrors++;

        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          console.log(`\n⚠️  ${MAX_CONSECUTIVE_ERRORS} erreurs consécutives - arrêt du script`);
          break;
        }

        // Wait before retrying
        console.log(`   Attente de 5 secondes avant de réessayer...`);
        await sleep(5000);
        continue;
      }

      // Reset error counter on success
      consecutiveErrors = 0;

      if (!priorityBusinesses || priorityBusinesses.length === 0) {
        console.log('✅ Aucune entreprise dans ce batch - terminé!');
        hasMore = false;
        break;
      }

      console.log(`   Trouvé ${priorityBusinesses.length} entreprises dans ce batch`);

      let batchUpdated = 0;
      let batchSkipped = 0;

      for (let i = 0; i < priorityBusinesses.length; i++) {
        const business = priorityBusinesses[i];

        // Skip if already has description
        if (business.description && business.description.length > 20) {
          batchSkipped++;
          totalSkipped++;
          continue;
        }

        // Generate descriptions (FR + EN)
        const { description_fr, description_en } = generateDescription(business, offset + i);

        // Update database with BOTH French and English descriptions
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            description: description_fr,
            description_en: description_en,
            updated_at: new Date().toISOString()
          })
          .eq('id', business.id);

        if (updateError) {
          console.error(`❌ Erreur pour ${business.name}:`, updateError.message);
          continue;
        }

        batchUpdated++;
        totalUpdated++;

        if (batchUpdated % 100 === 0) {
          console.log(`   ✅ ${batchUpdated}/${priorityBusinesses.length} dans ce batch...`);
        }
      }

      console.log(`   Batch terminé: ${batchUpdated} créées, ${batchSkipped} déjà présentes`);
      console.log(`   📊 Total global: ${totalUpdated} descriptions générées`);

      // Move to next batch
      offset += BATCH_SIZE;
      batchesProcessed++;

      // If we got less than BATCH_SIZE, we're done
      if (priorityBusinesses.length < BATCH_SIZE) {
        hasMore = false;
      }

      // Small delay between batches to avoid overwhelming the database
      await sleep(1000);

    } catch (error) {
      console.error('❌ Erreur inattendue:', error.message);
      consecutiveErrors++;

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        console.log(`\n⚠️  ${MAX_CONSECUTIVE_ERRORS} erreurs consécutives - arrêt du script`);
        break;
      }

      await sleep(5000);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ SESSION TERMINÉE!');
  console.log(`📊 Résultats de cette session:`);
  console.log(`   - Descriptions créées: ${totalUpdated}`);
  console.log(`   - Déjà présentes: ${totalSkipped}`);
  console.log(`   - Batches traités: ${batchesProcessed}/${MAX_BATCHES_PER_SESSION}`);
  console.log('═'.repeat(60));

  if (batchesProcessed >= MAX_BATCHES_PER_SESSION) {
    console.log('\n💡 Session terminée après traitement du maximum de batches autorisés.');
    console.log('   Relancez le script pour continuer où vous vous êtes arrêté.');
  }

  // Show examples
  if (totalUpdated > 0) {
    console.log('\n📄 Exemples de descriptions générées:\n');

    const { data: examples } = await supabase
      .from('businesses')
      .select('name, city, description, description_en')
      .not('description', 'is', null)
      .neq('description', '')
      .not('description_en', 'is', null)
      .neq('description_en', '')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (examples) {
      examples.forEach((ex, i) => {
        console.log(`${i + 1}. ${ex.name} (${ex.city})`);
        console.log(`   🇫🇷 FR: ${ex.description}`);
        console.log(`   🇬🇧 EN: ${ex.description_en}`);
        console.log('');
      });
    }
  }

  console.log('\n💡 Pour continuer:');
  console.log('   Relancez simplement ce script - il reprendra automatiquement là où il s\'est arrêté.');
  console.log('');
}

main().catch(console.error);
