import { useTranslation } from 'react-i18next';
import './BlogSection.css';

const BlogSection = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;

  // Vidéos populaires du blogue (Marketing Numérique)
  const blogArticles = [
    {
      id: 1,
      title: {
        fr: "Dominez Google avec le SEO local en 2025",
        en: "Dominate Google with local SEO in 2025"
      },
      excerpt: {
        fr: "Découvrez les stratégies de référencement local pour positionner votre entreprise en tête des résultats Google et attirer plus de clients dans votre région.",
        en: "Discover local SEO strategies to position your business at the top of Google results and attract more customers in your area."
      },
      image: "https://img.youtube.com/vi/Y76FAMAuf0M/maxresdefault.jpg",
      date: "13:23",
      category: {
        fr: "SEO",
        en: "SEO"
      }
    },
    {
      id: 2,
      title: {
        fr: "Google My Business: Le Guide Complet 2025",
        en: "Google My Business: The Complete Guide 2025"
      },
      excerpt: {
        fr: "Maîtrisez Google My Business pour maximiser votre visibilité locale. Apprenez à optimiser votre fiche, gérer les avis et attirer plus de clients.",
        en: "Master Google My Business to maximize your local visibility. Learn to optimize your listing, manage reviews and attract more customers."
      },
      image: "https://img.youtube.com/vi/E_KpOGsMrLc/maxresdefault.jpg",
      date: "18:12",
      category: {
        fr: "Marketing",
        en: "Marketing"
      }
    },
    {
      id: 3,
      title: {
        fr: "Comment Optimiser Votre Site Web pour Attirer Plus de Clients Locaux",
        en: "How to Optimize Your Website to Attract More Local Customers"
      },
      excerpt: {
        fr: "Transformez votre site web en machine à générer des clients locaux. Techniques d'optimisation, mots-clés locaux et stratégies de conversion efficaces.",
        en: "Transform your website into a local customer generating machine. Optimization techniques, local keywords and effective conversion strategies."
      },
      image: "https://img.youtube.com/vi/QYKdTfZGyEg/maxresdefault.jpg",
      date: "12:45",
      category: {
        fr: "Web",
        en: "Web"
      }
    }
  ];

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
            <article key={article.id} className="blog-card">
              <div className="blog-card-image">
                <img
                  src={article.image}
                  alt={article.title[language]}
                  width="1280"
                  height="720"
                  loading="lazy"
                />
                <span className="blog-card-category">
                  {article.category[language]}
                </span>
              </div>
              <div className="blog-card-content">
                <time className="blog-card-date">{article.date}</time>
                <h3 className="blog-card-title">
                  {article.title[language]}
                </h3>
                <p className="blog-card-excerpt">
                  {article.excerpt[language]}
                </p>
                <a href={language === 'fr' ? '/blogue' : '/en/blog'} className="blog-card-link">
                  {language === 'fr' ? 'Voir la vidéo →' : 'Watch video →'}
                </a>
              </div>
            </article>
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
