import React from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

// Articles de blog - vous pourrez ajouter de nouveaux articles ici
const blogArticles = [
  // Les articles seront ajoutés ici au fur et à mesure
  // Format:
  // {
  //   id: 'slug-de-l-article',
  //   title: 'Titre de l\'article',
  //   excerpt: 'Court résumé de l\'article...',
  //   image: '/path/to/image.jpg',
  //   date: '2025-10-25',
  //   author: 'Auteur',
  //   readTime: '5 min'
  // }
];

function Blog() {
  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1>Blogue</h1>
          <p className="blog-subtitle">
            Conseils, actualités et ressources pour les entreprises québécoises
          </p>
        </div>
      </div>

      <div className="container blog-content">
        {blogArticles.length === 0 ? (
          <div className="no-articles">
            <p>Nos premiers articles arrivent bientôt!</p>
            <p className="no-articles-subtitle">
              Consultez régulièrement cette page pour découvrir nos conseils et actualités
              sur l'entrepreneuriat au Québec.
            </p>
          </div>
        ) : (
          <div className="articles-grid">
            {blogArticles.map(article => (
              <Link
                key={article.id}
                to={`/blogue/${article.id}`}
                className="article-card"
              >
                {article.image && (
                  <div className="article-image">
                    <img src={article.image} alt={article.title} />
                  </div>
                )}
                <div className="article-content">
                  <div className="article-meta">
                    <span className="article-date">{article.date}</span>
                    {article.readTime && (
                      <>
                        <span className="meta-separator">•</span>
                        <span className="article-read-time">{article.readTime}</span>
                      </>
                    )}
                  </div>
                  <h2 className="article-title">{article.title}</h2>
                  <p className="article-excerpt">{article.excerpt}</p>
                  {article.author && (
                    <p className="article-author">Par {article.author}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Blog;
