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

// Templates for descriptions - 20 varied templates to avoid duplicate content
const frenchTemplates = [
  (data) => `Découvrez ${data.name} à ${data.city}. Cette entreprise locale offre des services adaptés à vos besoins. Contactez-les dès aujourd'hui pour en savoir plus.`,

  (data) => `Installée à ${data.city}, ${data.name} accompagne la clientèle locale avec des services personnalisés. Communiquez avec ${data.name} pour plus de détails.`,

  (data) => `Faites confiance à ${data.name} à ${data.city} pour répondre à vos besoins. Une entreprise locale à votre écoute, prête à vous accueillir.`,

  (data) => `${data.name}, située à ${data.city}, met son expertise au service de la communauté. Contactez-les dès maintenant pour obtenir plus d'informations.`,

  (data) => `À ${data.city}, ${data.name} se démarque par son service de proximité et son professionnalisme. Prenez contact avec eux pour découvrir ce qu'ils offrent.`,

  (data) => `Besoin d'un service fiable à ${data.city}? ${data.name} est là pour vous accompagner. Communiquez avec eux dès aujourd'hui pour plus d'infos.`,

  (data) => `${data.name} à ${data.city} propose des solutions adaptées à la réalité locale. N'hésitez pas à les contacter pour connaître leurs services.`,

  (data) => `Entreprise établie à ${data.city}, ${data.name} vous offre un service attentif et personnalisé. Contactez-les pour en savoir davantage.`,

  (data) => `À la recherche d'une entreprise de confiance à ${data.city}? ${data.name} met son savoir-faire à votre disposition. Prenez rendez-vous ou passez les voir.`,

  (data) => `${data.name}, basée à ${data.city}, accompagne la clientèle de la région avec une offre variée. Communiquez avec eux pour découvrir leurs services.`,

  (data) => `Située à ${data.city}, ${data.name} est une entreprise locale à l'écoute de ses clients. Contactez-les dès aujourd'hui pour plus de renseignements.`,

  (data) => `Faites appel à ${data.name} à ${data.city} pour bénéficier d'un service professionnel et chaleureux. Contactez-les pour discuter de vos besoins.`,

  (data) => `À ${data.city}, ${data.name} se consacre à offrir un service de qualité à sa clientèle. Communiquez avec eux pour obtenir plus de détails.`,

  (data) => `${data.name} est une entreprise de ${data.city} qui met de l'avant un service humain et accessible. Contactez-les pour en profiter dès maintenant.`,

  (data) => `Active à ${data.city}, ${data.name} propose des services pensés pour répondre à vos attentes. N'hésitez pas à les joindre pour plus d'informations.`,

  (data) => `Découvrez les services de ${data.name} à ${data.city}. Une entreprise locale prête à vous accueillir et à vous accompagner. Contactez-les dès maintenant.`,

  (data) => `${data.name}, établie à ${data.city}, offre un service professionnel aux clients de la région. Prenez contact avec eux pour en savoir plus.`,

  (data) => `Basée à ${data.city}, ${data.name} met l'accent sur la satisfaction de sa clientèle. Communiquez avec eux pour découvrir leur offre.`,

  (data) => `À ${data.city}, ${data.name} est un choix de confiance pour la population locale. Contactez-les dès aujourd'hui pour obtenir des renseignements.`,

  (data) => `${data.name} à ${data.city} se spécialise dans des services adaptés aux besoins locaux. Joignez-les pour en savoir davantage sur ce qu'ils proposent.`
];

const englishTemplates = [
  (data) => `Discover ${data.name} in ${data.city}. This local business offers services tailored to your needs. Contact them today to learn more.`,

  (data) => `Located in ${data.city}, ${data.name} serves local customers with personalized services. Contact ${data.name} for more details.`,

  (data) => `Trust ${data.name} in ${data.city} to meet your needs. A local business ready to welcome you and listen to your requirements.`,

  (data) => `${data.name}, located in ${data.city}, puts its expertise at the service of the community. Contact them now for more information.`,

  (data) => `In ${data.city}, ${data.name} stands out for its local service and professionalism. Get in touch with them to discover what they offer.`,

  (data) => `Need a reliable service in ${data.city}? ${data.name} is here to help. Contact them today for more info.`,

  (data) => `${data.name} in ${data.city} offers solutions adapted to local realities. Don't hesitate to contact them to learn about their services.`,

  (data) => `Established business in ${data.city}, ${data.name} offers attentive and personalized service. Contact them to learn more.`,

  (data) => `Looking for a trusted business in ${data.city}? ${data.name} puts its know-how at your disposal. Make an appointment or drop by.`,

  (data) => `${data.name}, based in ${data.city}, serves regional customers with a varied offering. Contact them to discover their services.`,

  (data) => `Located in ${data.city}, ${data.name} is a local business that listens to its customers. Contact them today for more information.`,

  (data) => `Call on ${data.name} in ${data.city} for professional and friendly service. Contact them to discuss your needs.`,

  (data) => `In ${data.city}, ${data.name} is dedicated to providing quality service to its customers. Contact them for more details.`,

  (data) => `${data.name} is a ${data.city} business that emphasizes human and accessible service. Contact them to benefit right away.`,

  (data) => `Active in ${data.city}, ${data.name} offers services designed to meet your expectations. Don't hesitate to contact them for more information.`,

  (data) => `Discover ${data.name}'s services in ${data.city}. A local business ready to welcome and support you. Contact them now.`,

  (data) => `${data.name}, established in ${data.city}, offers professional service to regional customers. Get in touch to learn more.`,

  (data) => `Based in ${data.city}, ${data.name} focuses on customer satisfaction. Contact them to discover their offering.`,

  (data) => `In ${data.city}, ${data.name} is a trusted choice for local residents. Contact them today for information.`,

  (data) => `${data.name} in ${data.city} specializes in services adapted to local needs. Contact them to learn more about what they offer.`
];

// Generate description for a business
function generateDescription(business, templateIndex = 0) {
  const data = {
    name: business.name,
    city: business.city || 'Québec'
  };

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
