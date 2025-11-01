/**
 * Centralized Blog Articles Data
 * Import this file in both Blog.jsx and BlogArticle.jsx to avoid duplication
 */

import { neqQuebecArticle } from './blogArticles/neq-quebec-guide.js';

// Convert article data to blog card format
function articleToCard(article, lang = 'fr') {
  const isEn = lang === 'en';

  return {
    id: article.slug,
    slug: article.slug,
    title: article.title[lang],
    excerpt: article.intro[lang].replace(/<[^>]*>/g, '').substring(0, 200) + '...',
    image: article.heroImage.url + '?w=800&auto=format&fit=crop',
    date: new Date(article.publishedDate).toLocaleDateString(isEn ? 'en-CA' : 'fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    author: article.author,
    readTime: article.readTime,
    // Full content for article page
    fullArticle: article
  };
}

// All blog articles
export const allArticles = [
  neqQuebecArticle
];

// Get blog cards for the listing page
export function getBlogCards(lang = 'fr') {
  return allArticles.map(article => articleToCard(article, lang));
}

// Get single article by slug
export function getArticleBySlug(slug) {
  return allArticles.find(article => article.slug === slug);
}

// Export for direct use
export const blogArticlesData = {
  allArticles,
  getBlogCards,
  getArticleBySlug
};
