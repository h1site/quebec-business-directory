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
  const article = getArticleBySlug(articleId);

  // Rediriger vers la page blog si l'article n'existe pas
  if (!article) {
    return <Navigate to={isEn ? "/en/blogue" : "/blogue"} replace />;
  }

  return <BlogArticleRenderer article={article} />;
}

export default BlogArticle;
