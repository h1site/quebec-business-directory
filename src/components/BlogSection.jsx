import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getBlogCards } from '../data/blogArticlesData';
import './BlogSection.css';

const BlogSection = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  // Get latest 3 blog articles automatically
  const allArticles = getBlogCards(language);
  const blogArticles = allArticles.slice(0, 3);

  return (
    <section className="blog-section">
      <div className="blog-container">
        <div className="blog-header">
          <h2 className="blog-title">
            {language === 'fr' ? 'Blogue' : 'Blog'}
          </h2>
          <p className="blog-subtitle">
            {language === 'fr'
              ? 'Conseils, guides et actualités pour les entreprises québécoises'
              : 'Tips, guides and news for Quebec businesses'
            }
          </p>
        </div>

        <div className="blog-grid">
          {blogArticles.map(article => (
            <Link
              key={article.id}
              to={language === 'fr' ? `/blogue/${article.slug}` : `/en/blog/${article.slug}`}
              className="blog-card"
            >
              <div className="blog-card-image">
                <img
                  src={article.image}
                  alt={article.title}
                  width="1280"
                  height="720"
                  loading="lazy"
                />
              </div>
              <div className="blog-card-content">
                <div className="blog-card-meta">
                  <time className="blog-card-date">{article.date}</time>
                  {article.readTime && (
                    <>
                      <span className="meta-separator">•</span>
                      <span className="blog-card-read-time">{article.readTime}</span>
                    </>
                  )}
                </div>
                <h3 className="blog-card-title">
                  {article.title}
                </h3>
                <p className="blog-card-excerpt">
                  {article.excerpt}
                </p>
                <span className="blog-card-link">
                  {language === 'fr' ? 'Lire l\'article →' : 'Read article →'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="blog-footer">
          <a href={language === 'fr' ? '/blogue' : '/en/blog'} className="blog-view-all">
            {language === 'fr' ? 'Voir tous les articles' : 'View all articles'}
          </a>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
