/**
 * Generate business descriptions with 10 varied templates
 * Each business gets a random template for natural variety
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// 10 French description templates
const frenchTemplates = [
  // Template 1: Direct and professional
  (data) => {
    if (data.hasCategory) {
      let desc = `${data.name} est ${data.article} ${data.category} ${data.subcategory ? `spécialisé${data.feminine ? 'e' : ''} en ${data.subcategory}` : ''} situé${data.feminine ? 'e' : ''} à ${data.city}`;
      if (data.region) desc += ` dans la région ${data.region}`;
      if (data.mrc) desc += ` (MRC ${data.mrc})`;
      desc += ', Québec.';
      if (data.hasWebsite) {
        desc += ` Pour plus d'informations, visitez le site web officiel ou contactez l'entreprise directement.`;
      } else {
        desc += ` Contactez ${data.name} pour obtenir plus d'informations sur les services offerts.`;
      }
      return desc;
    }
    let desc = `${data.name} est une entreprise locale établie à ${data.city}`;
    if (data.region) desc += ` dans la région ${data.region}`;
    desc += ', Québec.';
    if (data.hasWebsite) {
      desc += ` Pour plus d'informations, visitez le site web officiel.`;
    } else {
      desc += ` Contactez l'entreprise pour en savoir plus.`;
    }
    return desc;
  },

  // Template 2: Welcoming and engaging
  (data) => {
    if (data.hasCategory) {
      let desc = `Découvrez ${data.name}, votre ${data.category} de confiance à ${data.city}`;
      if (data.region) desc += ` (${data.region})`;
      desc += '.';
      if (data.subcategory) {
        desc += ` Spécialisé${data.feminine ? 'e' : ''} en ${data.subcategory}, ${data.name} offre des services professionnels adaptés à vos besoins.`;
      } else {
        desc += ` ${data.name} offre des services professionnels de qualité.`;
      }
      desc += ` N'hésitez pas à prendre contact pour discuter de votre projet.`;
      return desc;
    }
    let desc = `Découvrez ${data.name}, une entreprise locale de ${data.city}`;
    if (data.region) desc += ` dans ${data.region}`;
    desc += ` au service de sa communauté. Contactez-nous pour en savoir plus sur nos services.`;
    return desc;
  },

  // Template 3: Location-focused
  (data) => {
    let desc = `Établi${data.feminine ? 'e' : ''} à ${data.city}`;
    if (data.region) desc += ` dans la région ${data.region}`;
    if (data.mrc) desc += ` (MRC ${data.mrc})`;
    if (data.hasCategory) {
      desc += `, ${data.name} est ${data.article} ${data.category}`;
      if (data.subcategory) {
        desc += ` offrant des services en ${data.subcategory}`;
      }
      desc += ` au Québec.`;
      desc += ` Trouvez toutes les coordonnées et informations pratiques sur cette page.`;
      return desc;
    }
    desc += `, ${data.name} est une entreprise locale`;
    if (data.hasWebsite) {
      desc += ` au service de la communauté. Consultez le site web pour découvrir nos services.`;
    } else {
      desc += ` offrant des services à la région. Contactez-nous pour vos besoins.`;
    }
    return desc;
  },

  // Template 4: Service-oriented
  (data) => {
    if (data.hasCategory) {
      let desc = `Vous recherchez ${data.article} ${data.category} à ${data.city}? `;
      desc += `${data.name} met son expertise à votre service`;
      if (data.subcategory) desc += ` en ${data.subcategory}`;
      desc += '.';
      if (data.region) desc += ` Situé${data.feminine ? 'e' : ''} dans ${data.region}, `;
      desc += ` l'entreprise offre des solutions adaptées à vos besoins. Contactez-nous dès aujourd'hui.`;
      return desc;
    }
    let desc = `${data.name} est ${data.article} entreprise de ${data.city}`;
    if (data.region) desc += ` (région ${data.region})`;
    desc += ` dédiée à offrir des services de qualité. Prenez contact pour découvrir comment nous pouvons vous aider.`;
    return desc;
  },

  // Template 5: Professional and concise
  (data) => {
    if (data.hasCategory) {
      let desc = `${data.name} - ${data.category}`;
      if (data.subcategory) desc += ` (${data.subcategory})`;
      desc += ` basé${data.feminine ? 'e' : ''} à ${data.city}`;
      if (data.region) desc += `, ${data.region}`;
      desc += '. Services professionnels pour particuliers et entreprises.';
      if (data.hasWebsite) {
        desc += ` Visitez notre site web pour plus de détails.`;
      } else {
        desc += ` Appelez-nous pour une consultation.`;
      }
      return desc;
    }
    let desc = `${data.name}, entreprise locale de ${data.city}`;
    if (data.region) desc += ` (${data.region})`;
    desc += `. Services professionnels adaptés à vos besoins. Contactez-nous pour plus d'informations.`;
    return desc;
  },

  // Template 6: Expertise highlight
  (data) => {
    if (data.hasCategory) {
      let desc = `Faites confiance à l'expertise de ${data.name}, `;
      desc += `${data.article} ${data.category} `;
      if (data.subcategory) desc += `spécialisé${data.feminine ? 'e' : ''} en ${data.subcategory} `;
      desc += `établi${data.feminine ? 'e' : ''} à ${data.city}`;
      if (data.region) desc += ` dans ${data.region}`;
      desc += '. Professionnalisme et qualité de service garantis. ';
      desc += `Contactez ${data.name} pour un service personnalisé.`;
      return desc;
    }
    let desc = `${data.name}, votre partenaire de confiance à ${data.city}`;
    if (data.region) desc += ` (${data.region})`;
    desc += `. Entreprise locale offrant des services de qualité. Contactez-nous pour vos projets.`;
    return desc;
  },

  // Template 7: Community-focused
  (data) => {
    let desc = `Au cœur de ${data.city}`;
    if (data.region) desc += ` dans la région ${data.region}`;
    desc += `, ${data.name}`;
    if (data.hasCategory) {
      desc += ` est ${data.article} ${data.category}`;
      if (data.subcategory) desc += ` offrant des services en ${data.subcategory}`;
      desc += ` au service de la communauté locale.`;
    } else {
      desc += ` sert fièrement la communauté locale avec des services professionnels.`;
    }
    desc += ` Votre satisfaction est notre priorité.`;
    return desc;
  },

  // Template 8: Solution-oriented
  (data) => {
    if (data.hasCategory) {
      let desc = `Besoin d'${data.article} ${data.category}`;
      if (data.subcategory) desc += ` en ${data.subcategory}`;
      desc += ` à ${data.city}? ${data.name} vous propose des solutions professionnelles`;
      if (data.region) desc += ` dans la région ${data.region}`;
      desc += '. Des services adaptés à vos exigences. Contactez-nous pour un devis ou une consultation.';
      return desc;
    }
    let desc = `${data.name} offre des services professionnels à ${data.city}`;
    if (data.region) desc += ` et dans ${data.region}`;
    desc += `. Solutions sur mesure pour répondre à vos besoins. Appelez-nous dès maintenant.`;
    return desc;
  },

  // Template 9: Modern and dynamic
  (data) => {
    if (data.hasCategory) {
      let desc = `${data.name} : ${data.category}`;
      if (data.subcategory) desc += ` | ${data.subcategory}`;
      desc += ` | ${data.city}`;
      if (data.region) desc += ` | ${data.region}`;
      desc += `. Une entreprise moderne et dynamique à votre écoute. `;
      desc += `Des services de qualité, proches de vous. Prenez rendez-vous facilement.`;
      return desc;
    }
    let desc = `${data.name} - ${data.city}`;
    if (data.region) desc += ` - ${data.region}`;
    desc += `. Entreprise locale dynamique offrant des services professionnels. Contactez-nous pour concrétiser vos projets.`;
    return desc;
  },

  // Template 10: Detailed and informative
  (data) => {
    if (data.hasCategory) {
      let desc = `Situé${data.feminine ? 'e' : ''} à ${data.city}`;
      if (data.mrc) desc += ` dans la MRC ${data.mrc}`;
      if (data.region) desc += ` (région ${data.region})`;
      desc += `, ${data.name} est ${data.article} ${data.category}`;
      if (data.subcategory) desc += ` avec expertise en ${data.subcategory}`;
      desc += '. L\'entreprise met à votre disposition ';
      if (data.hasWebsite) {
        desc += `son expertise professionnelle. Visitez le site web pour découvrir la gamme complète de services ou contactez directement l'équipe.`;
      } else {
        desc += `des services de qualité. Communiquez avec l'équipe pour discuter de vos besoins spécifiques.`;
      }
      return desc;
    }
    let desc = `Basée à ${data.city}`;
    if (data.region) desc += ` dans la région ${data.region}`;
    desc += `, ${data.name} est une entreprise locale`;
    if (data.hasWebsite) {
      desc += ` offrant des services professionnels. Consultez le site web pour tous les détails.`;
    } else {
      desc += ` au service de sa clientèle. Contactez l'entreprise pour en savoir plus.`;
    }
    return desc;
  }
];

// 10 English description templates
const englishTemplates = [
  // Template 1: Direct and professional
  (data) => {
    if (data.hasCategory) {
      let desc = `${data.name} is ${data.article_en} ${data.category_en} ${data.subcategory_en ? `specializing in ${data.subcategory_en}` : ''} located in ${data.city}`;
      if (data.region) desc += `, ${data.region} region`;
      if (data.mrc) desc += ` (MRC ${data.mrc})`;
      desc += ', Quebec.';
      if (data.hasWebsite) {
        desc += ` For more information, visit the official website or contact the business directly.`;
      } else {
        desc += ` Contact ${data.name} for more information about the services offered.`;
      }
      return desc;
    }
    let desc = `${data.name} is a local business established in ${data.city}`;
    if (data.region) desc += ` in the ${data.region} region`;
    desc += ', Quebec.';
    if (data.hasWebsite) {
      desc += ` For more information, visit the official website.`;
    } else {
      desc += ` Contact the business to learn more.`;
    }
    return desc;
  },

  // Template 2: Welcoming and engaging
  (data) => {
    if (data.hasCategory) {
      let desc = `Discover ${data.name}, your trusted ${data.category_en} in ${data.city}`;
      if (data.region) desc += ` (${data.region} region)`;
      desc += '.';
      if (data.subcategory_en) {
        desc += ` Specializing in ${data.subcategory_en}, ${data.name} offers professional services tailored to your needs.`;
      } else {
        desc += ` ${data.name} offers quality professional services.`;
      }
      desc += ` Don't hesitate to get in touch to discuss your project.`;
      return desc;
    }
    let desc = `Discover ${data.name}, a local business in ${data.city}`;
    if (data.region) desc += ` serving the ${data.region} community`;
    desc += `. Contact us to learn more about our services.`;
    return desc;
  },

  // Template 3: Location-focused
  (data) => {
    let desc = `Established in ${data.city}`;
    if (data.region) desc += ` in the ${data.region} region`;
    if (data.mrc) desc += ` (MRC ${data.mrc})`;
    if (data.hasCategory) {
      desc += `, ${data.name} is ${data.article_en} ${data.category_en}`;
      if (data.subcategory_en) {
        desc += ` offering services in ${data.subcategory_en}`;
      }
      desc += ` in Quebec.`;
      desc += ` Find all contact details and practical information on this page.`;
      return desc;
    }
    desc += `, ${data.name} is a local business`;
    if (data.hasWebsite) {
      desc += ` serving the community. Visit the website to discover our services.`;
    } else {
      desc += ` offering services to the area. Contact us for your needs.`;
    }
    return desc;
  },

  // Template 4: Service-oriented
  (data) => {
    if (data.hasCategory) {
      let desc = `Looking for ${data.article_en} ${data.category_en} in ${data.city}? `;
      desc += `${data.name} puts its expertise at your service`;
      if (data.subcategory_en) desc += ` in ${data.subcategory_en}`;
      desc += '.';
      if (data.region) desc += ` Located in ${data.region}, `;
      desc += `the business offers solutions tailored to your needs. Contact us today.`;
      return desc;
    }
    let desc = `${data.name} is a business in ${data.city}`;
    if (data.region) desc += ` (${data.region} region)`;
    desc += ` dedicated to offering quality services. Get in touch to discover how we can help you.`;
    return desc;
  },

  // Template 5: Professional and concise
  (data) => {
    if (data.hasCategory) {
      let desc = `${data.name} - ${data.category_en}`;
      if (data.subcategory_en) desc += ` (${data.subcategory_en})`;
      desc += ` based in ${data.city}`;
      if (data.region) desc += `, ${data.region}`;
      desc += '. Professional services for individuals and businesses.';
      if (data.hasWebsite) {
        desc += ` Visit our website for more details.`;
      } else {
        desc += ` Call us for a consultation.`;
      }
      return desc;
    }
    let desc = `${data.name}, local business in ${data.city}`;
    if (data.region) desc += ` (${data.region})`;
    desc += `. Professional services tailored to your needs. Contact us for more information.`;
    return desc;
  },

  // Template 6: Expertise highlight
  (data) => {
    if (data.hasCategory) {
      let desc = `Trust the expertise of ${data.name}, `;
      desc += `${data.article_en} ${data.category_en} `;
      if (data.subcategory_en) desc += `specializing in ${data.subcategory_en} `;
      desc += `established in ${data.city}`;
      if (data.region) desc += ` in ${data.region}`;
      desc += '. Professionalism and quality service guaranteed. ';
      desc += `Contact ${data.name} for personalized service.`;
      return desc;
    }
    let desc = `${data.name}, your trusted partner in ${data.city}`;
    if (data.region) desc += ` (${data.region})`;
    desc += `. Local business offering quality services. Contact us for your projects.`;
    return desc;
  },

  // Template 7: Community-focused
  (data) => {
    let desc = `At the heart of ${data.city}`;
    if (data.region) desc += ` in the ${data.region} region`;
    desc += `, ${data.name}`;
    if (data.hasCategory) {
      desc += ` is ${data.article_en} ${data.category_en}`;
      if (data.subcategory_en) desc += ` offering services in ${data.subcategory_en}`;
      desc += ` serving the local community.`;
    } else {
      desc += ` proudly serves the local community with professional services.`;
    }
    desc += ` Your satisfaction is our priority.`;
    return desc;
  },

  // Template 8: Solution-oriented
  (data) => {
    if (data.hasCategory) {
      let desc = `Need ${data.article_en} ${data.category_en}`;
      if (data.subcategory_en) desc += ` for ${data.subcategory_en}`;
      desc += ` in ${data.city}? ${data.name} offers professional solutions`;
      if (data.region) desc += ` in the ${data.region} region`;
      desc += '. Services tailored to your requirements. Contact us for a quote or consultation.';
      return desc;
    }
    let desc = `${data.name} offers professional services in ${data.city}`;
    if (data.region) desc += ` and throughout ${data.region}`;
    desc += `. Custom solutions to meet your needs. Call us now.`;
    return desc;
  },

  // Template 9: Modern and dynamic
  (data) => {
    if (data.hasCategory) {
      let desc = `${data.name}: ${data.category_en}`;
      if (data.subcategory_en) desc += ` | ${data.subcategory_en}`;
      desc += ` | ${data.city}`;
      if (data.region) desc += ` | ${data.region}`;
      desc += `. A modern and dynamic business at your service. `;
      desc += `Quality services, close to you. Schedule an appointment easily.`;
      return desc;
    }
    let desc = `${data.name} - ${data.city}`;
    if (data.region) desc += ` - ${data.region}`;
    desc += `. Dynamic local business offering professional services. Contact us to bring your projects to life.`;
    return desc;
  },

  // Template 10: Detailed and informative
  (data) => {
    if (data.hasCategory) {
      let desc = `Located in ${data.city}`;
      if (data.mrc) desc += ` in MRC ${data.mrc}`;
      if (data.region) desc += ` (${data.region} region)`;
      desc += `, ${data.name} is ${data.article_en} ${data.category_en}`;
      if (data.subcategory_en) desc += ` with expertise in ${data.subcategory_en}`;
      desc += '. The business provides ';
      if (data.hasWebsite) {
        desc += `professional expertise. Visit the website to discover the complete range of services or contact the team directly.`;
      } else {
        desc += `quality services. Communicate with the team to discuss your specific needs.`;
      }
      return desc;
    }
    let desc = `Based in ${data.city}`;
    if (data.region) desc += ` in the ${data.region} region`;
    desc += `, ${data.name} is a local business`;
    if (data.hasWebsite) {
      desc += ` offering professional services. Check the website for all details.`;
    } else {
      desc += ` serving its clientele. Contact the business to learn more.`;
    }
    return desc;
  }
];

// Helper function to determine article (un/une)
function getArticle(category, isFeminine) {
  const vowels = ['a', 'e', 'i', 'o', 'u', 'h'];
  const firstLetter = category?.toLowerCase().charAt(0);

  if (vowels.includes(firstLetter)) {
    return "un"; // "un" is used for both genders before vowels in descriptions
  }

  return isFeminine ? 'une' : 'un';
}

// Feminine categories (for French grammar)
const feminineCategories = [
  'entreprise', 'compagnie', 'société', 'boutique', 'agence',
  'clinique', 'école', 'institution', 'association', 'corporation'
];

function isFeminineCategory(category) {
  if (!category) return false;
  return feminineCategories.some(fem => category.toLowerCase().includes(fem));
}

// Generate description data object
function prepareDescriptionData(business) {
  const category = business.primary_main_category_fr || business.main_category_name;
  const categoryEn = business.primary_main_category_en || business.main_category_name_en;
  const subcategory = business.primary_sub_category_fr || business.sub_category_name;
  const subcategoryEn = business.primary_sub_category_en || business.sub_category_name_en;
  const feminine = isFeminineCategory(category);

  return {
    name: business.name,
    city: business.city,
    region: business.region,
    mrc: business.mrc,
    category: category,
    category_en: categoryEn,
    subcategory: subcategory,
    subcategory_en: subcategoryEn,
    hasCategory: !!category,
    hasWebsite: !!business.website,
    feminine: feminine,
    article: getArticle(category, feminine),
    article_en: categoryEn && ['a','e','i','o','u'].includes(categoryEn.toLowerCase().charAt(0)) ? 'an' : 'a'
  };
}

// Select a random template based on business ID (deterministic but varied)
function selectTemplate(businessId, templates) {
  // Use Math.abs to handle negative IDs, and ensure we get a valid index
  const index = Math.abs(businessId) % templates.length;
  return templates[index];
}

async function generateDescriptions() {
  console.log('\n🚀 Starting description generation with 10 varied templates...\n');

  // Get businesses that need descriptions
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .is('description_en', null)
    .limit(100);

  if (error) {
    console.error('❌ Error fetching businesses:', error);
    return;
  }

  if (!businesses || businesses.length === 0) {
    console.log('✅ All businesses already have English descriptions!');
    return;
  }

  console.log(`📊 Found ${businesses.length} businesses needing descriptions\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const business of businesses) {
    try {
      const data = prepareDescriptionData(business);

      // Select templates based on business ID for variety
      const frTemplate = selectTemplate(business.id, frenchTemplates);
      const enTemplate = selectTemplate(business.id, englishTemplates);

      if (typeof frTemplate !== 'function') {
        console.error(`❌ frTemplate is not a function for business ${business.id}, type:`, typeof frTemplate);
        errorCount++;
        continue;
      }
      if (typeof enTemplate !== 'function') {
        console.error(`❌ enTemplate is not a function for business ${business.id}, type:`, typeof enTemplate);
        errorCount++;
        continue;
      }

      const descriptionFr = frTemplate(data);
      const descriptionEn = enTemplate(data);

      // Update both French and English descriptions
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          description: descriptionFr,
          description_en: descriptionEn
        })
        .eq('id', business.id);

      if (updateError) {
        console.error(`❌ Error updating ${business.name}:`, updateError);
        errorCount++;
      } else {
        successCount++;
        console.log(`✅ ${successCount}/${businesses.length} - ${business.name}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (err) {
      console.error(`❌ Error processing ${business.name}:`, err);
      errorCount++;
    }
  }

  console.log('\n📈 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${businesses.length}`);
}

generateDescriptions()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
