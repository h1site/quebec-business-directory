import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import './BlogArticle.css';

// Articles de blog - même liste que dans Blog.jsx
// IMPORTANT: Quand vous ajoutez un article, ajoutez-le dans les deux fichiers
const blogArticles = [
  // Les articles seront ajoutés ici avec leur contenu complet
  // Format:
  // {
  //   id: 'slug-de-l-article',
  //   title: 'Titre de l\'article',
  //   excerpt: 'Court résumé...',
  //   image: '/path/to/image.jpg',
  //   date: '2025-10-25',
  //   author: 'Auteur',
  //   readTime: '5 min',
  //   content: `
  //     <h2>Sous-titre</h2>
  //     <p>Contenu de l'article en HTML...</p>
  //   `
  // }
];

function BlogArticle() {
  const { articleId } = useParams();
  const article = blogArticles.find(a => a.id === articleId);

  // Rediriger vers la page blog si l'article n'existe pas
  if (!article) {
    return <Navigate to="/blogue" replace />;
  }

  return (
    <div className="blog-article-page">
      {/* Hero section avec image */}
      {article.image && (
        <div className="article-hero" style={{ backgroundImage: `url(${article.image})` }}>
          <div className="article-hero-overlay"></div>
        </div>
      )}

      <div className="container">
        <div className="article-header">
          <Link to="/blogue" className="back-to-blog">
            ← Retour au blogue
          </Link>

          <h1 className="article-main-title">{article.title}</h1>

          <div className="article-main-meta">
            <span className="article-date">{article.date}</span>
            {article.readTime && (
              <>
                <span className="meta-separator">•</span>
                <span className="article-read-time">{article.readTime}</span>
              </>
            )}
            {article.author && (
              <>
                <span className="meta-separator">•</span>
                <span className="article-author">Par {article.author}</span>
              </>
            )}
          </div>
        </div>

        <article className="article-body">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>

        <div className="article-footer">
          <Link to="/blogue" className="back-to-blog-btn">
            ← Voir tous les articles
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogArticle;
