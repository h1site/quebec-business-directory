import Anthropic from '@anthropic-ai/sdk';
import { blogArticles } from '../api/blog-data.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate rich HTML content for a blog article
async function generateArticleContent(article, language) {
  const isEnglish = language === 'en';
  const title = article.title[language];
  const intro = article.intro[language];

  const prompt = `Tu es un expert en rédaction de contenu SEO optimisé pour le Québec. Je veux que tu génères un article de blog complet et très détaillé en ${isEnglish ? 'anglais' : 'français'}.

Titre: ${title}
Introduction: ${intro}

Génère un contenu HTML riche avec:
- Au moins 6-8 sections principales avec balises <h2>
- Plusieurs sous-sections avec balises <h3>, <h4>, et même <h5> si pertinent
- Des paragraphes détaillés et informatifs (3-5 paragraphes par section minimum)
- Des listes à puces et numérotées
- Des exemples concrets et pratiques
- Un ton professionnel mais accessible
- Optimisé pour SEO avec mots-clés naturels

Le contenu doit être très complet (au moins 2000-3000 mots) et couvrir tous les aspects importants du sujet.

IMPORTANT:
- Utilise UNIQUEMENT des balises HTML sémantiques (<section>, <h2>-<h6>, <p>, <ul>, <ol>, <li>, <strong>)
- Applique des styles inline pour le formatage (margin-bottom, font-size, font-weight, color, etc.)
- NE PAS inclure de balises <html>, <body>, ou <head>
- NE PAS inclure de code JavaScript ou CSS externe
- Commence directement avec les sections <section>

Styles à utiliser:
- <section style="margin-bottom: 2.5rem;">
- <h2 style="font-size: 1.75rem; font-weight: 700; color: #1a202c; margin-bottom: 1rem;">
- <h3 style="font-size: 1.5rem; font-weight: 600; color: #2d3748; margin: 1.5rem 0 1rem;">
- <h4 style="font-size: 1.25rem; font-weight: 600; color: #4a5568; margin: 1.25rem 0 0.75rem;">
- <h5 style="font-size: 1.1rem; font-weight: 600; color: #4a5568; margin: 1rem 0 0.5rem;">
- <p style="margin-bottom: 1rem;">
- <ul style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">
- <ol style="margin-left: 1.5rem; margin-bottom: 1rem; line-height: 1.8;">

Génère maintenant le contenu HTML complet:`;

  try {
    console.log(`Génération du contenu pour "${title}" (${language})...`);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = message.content[0].text;
    console.log(`✓ Contenu généré (${content.length} caractères)`);

    return content.trim();
  } catch (error) {
    console.error(`✗ Erreur lors de la génération:`, error.message);
    throw error;
  }
}

// Generate content for all articles
async function generateAllContent() {
  console.log('=== Génération automatique du contenu des articles de blog ===\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY non définie dans les variables d\'environnement');
    process.exit(1);
  }

  const updatedArticles = [...blogArticles];

  for (let i = 0; i < updatedArticles.length; i++) {
    const article = updatedArticles[i];
    console.log(`\n[${i + 1}/${updatedArticles.length}] Article: ${article.slug}`);

    try {
      // Generate French content
      const frContent = await generateArticleContent(article, 'fr');

      // Wait 2 seconds to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate English content
      const enContent = await generateArticleContent(article, 'en');

      // Update the article object
      article.content = {
        fr: frContent,
        en: enContent
      };

      console.log(`✓ Article "${article.slug}" complété\n`);

      // Wait before next article
      if (i < updatedArticles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`✗ Échec pour l'article "${article.slug}":`, error.message);
      // Continue with next article
    }
  }

  // Generate the updated blog-data.js file
  const blogDataPath = path.join(__dirname, '../api/blog-data.js');

  const fileContent = `// Blog articles data with AI-generated rich content
export const blogArticles = ${JSON.stringify(updatedArticles, null, 2)};

export function getArticleBySlug(slug) {
  return blogArticles.find(article => article.slug === slug);
}

export function getAllArticles() {
  return blogArticles;
}
`;

  fs.writeFileSync(blogDataPath, fileContent, 'utf-8');
  console.log('\n✓ Fichier blog-data.js mis à jour avec succès!');
  console.log(`   Localisation: ${blogDataPath}`);
  console.log('\n=== Génération terminée ===');
}

// Run the script
generateAllContent().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
