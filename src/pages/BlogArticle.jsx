import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getArticleBySlug } from '../data/blogArticlesData';
import BlogArticleRenderer from '../components/BlogArticleRenderer';
import './BlogArticle.css';

function BlogArticle() {
  const { articleId } = useParams();
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';

  // Get article by slug
  let article = getArticleBySlug(articleId);

  // Handle short URL redirects (for Google Search Console legacy URLs)
  if (!article && articleId) {
    // Map of short slugs to full slugs
    const slugRedirects = {
      'top-10-restaurants-montreal': 'top-10-restaurants-montreal-2025',
      'comment-reclamer-fiche-entreprise': 'comment-reclamer-fiche-entreprise-registre-quebec',
    };

    const fullSlug = slugRedirects[articleId];
    if (fullSlug) {
      // 301 redirect to full URL
      const basePath = isEn ? '/en/blog' : '/blogue';
      return <Navigate to={`${basePath}/${fullSlug}`} replace />;
    }
  }

  // Rediriger vers la page blog si l'article n'existe pas
  if (!article) {
    return <Navigate to={isEn ? "/en/blog" : "/blogue"} replace />;
  }

  return <BlogArticleRenderer article={article} />;
}

export default BlogArticle;
