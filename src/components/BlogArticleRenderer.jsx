import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import './BlogArticleRenderer.css';

/**
 * Renders a full blog article with sections, images, and SEO
 */
const BlogArticleRenderer = ({ article }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEn = lang === 'en';

  // Update canonical tag directly in DOM when article changes (for SPA navigation)
  useEffect(() => {
    if (!article) return;

    const blogPath = isEn ? 'en/blog' : 'blogue';
    const canonicalUrl = `https://registreduquebec.com/${blogPath}/${article.slug}`;
    const canonical = document.querySelector('link[rel="canonical"]');

    if (canonical && canonical.href !== canonicalUrl) {
      canonical.href = canonicalUrl;
      console.log('🔗 Updated blog canonical:', canonicalUrl);
    }

    // Also update og:url
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && ogUrl.content !== canonicalUrl) {
      ogUrl.content = canonicalUrl;
    }
  }, [article?.slug, isEn]);

  if (!article) {
    return null;
  }

  const seo = article.seo[lang];
  const title = article.title[lang];
  const intro = article.intro[lang];
  const disclaimer = article.disclaimer ? article.disclaimer[lang] : null;
  const sections = article.sections || [];
  const cta = article.cta ? article.cta[lang] : null;

  // Generate canonical URL based on current language
  const blogPath = isEn ? 'en/blog' : 'blogue';
  const canonicalUrl = `https://registreduquebec.com/${blogPath}/${article.slug}`;

  // Generate article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": intro.replace(/<[^>]*>/g, ''),
    "image": article.heroImage.url,
    "datePublished": article.publishedDate,
    "dateModified": article.lastUpdated || article.publishedDate,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Registre du Québec",
      "logo": {
        "@type": "ImageObject",
        "url": "https://registreduquebec.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://registreduquebec.com/${isEn ? 'en/' : ''}blogue/${article.slug}`
    }
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isEn ? "Home" : "Accueil",
        "item": `https://registreduquebec.com${isEn ? '/en' : ''}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isEn ? "Blog" : "Blogue",
        "item": `https://registreduquebec.com${isEn ? '/en' : ''}/blogue`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": `https://registreduquebec.com/${isEn ? 'en/' : ''}blogue/${article.slug}`
      }
    ]
  };

  return (
    <div className="blog-article-renderer">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        {/* Use dynamic canonical based on current language and article slug */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={article.heroImage.url} />
        {/* Use canonical for og:url to ensure consistency */}
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.publishedDate} />
        <meta property="article:modified_time" content={article.lastUpdated || article.publishedDate} />
        <meta property="article:author" content={article.author} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={article.heroImage.url} />

        {/* Schema.org markup */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <div className="article-hero-section" style={{ backgroundImage: `url(${article.heroImage.url}?w=1920&h=600&fit=crop&auto=format)` }}>
        <div className="article-hero-overlay"></div>
        <div className="container article-hero-content">
          <Link to={isEn ? "/en/blogue" : "/blogue"} className="back-to-blog">
            ← {isEn ? 'Back to blog' : 'Retour au blogue'}
          </Link>
          <h1 className="article-main-title">{title}</h1>
          <div className="article-meta-hero">
            <span className="article-date">
              {new Date(article.publishedDate).toLocaleDateString(isEn ? 'en-CA' : 'fr-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {article.readTime && (
              <>
                <span className="meta-separator">•</span>
                <span className="article-read-time">{article.readTime}</span>
              </>
            )}
            {article.author && (
              <>
                <span className="meta-separator">•</span>
                <span className="article-author">{isEn ? 'By' : 'Par'} {article.author}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container">
        <article className="article-content-wrapper">
          {/* Introduction */}
          <div className="article-intro" dangerouslySetInnerHTML={{ __html: intro }} />

          {/* Disclaimer if exists */}
          {disclaimer && (
            <div className="article-disclaimer" dangerouslySetInnerHTML={{ __html: disclaimer }} />
          )}

          {/* Sections */}
          {sections.map((section, index) => (
            <section key={section.id} className="article-section">
              <h2 id={section.id}>{section.title[lang]}</h2>

              {/* Section Image */}
              {section.image && (
                <figure className="section-image">
                  <img
                    src={`${section.image.url}?w=${section.image.width || 1200}&h=${section.image.height || 800}&fit=crop&auto=format`}
                    alt={section.image.alt[lang]}
                    width={section.image.width || 1200}
                    height={section.image.height || 800}
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  {section.image.credit && (
                    <figcaption className="image-credit">
                      Photo: {section.image.credit}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Section Content */}
              <div className="section-content" dangerouslySetInnerHTML={{ __html: section.content[lang] }} />
            </section>
          ))}

          {/* Call to Action */}
          {cta && (
            <div className="article-cta">
              <h3>{cta.title}</h3>
              <p>{cta.description}</p>
              <Link to={cta.buttonLink} className="cta-button">
                {cta.buttonText}
              </Link>
            </div>
          )}
        </article>

        {/* Footer */}
        <div className="article-footer">
          <Link to={isEn ? "/en/blogue" : "/blogue"} className="back-to-blog-btn">
            ← {isEn ? 'See all articles' : 'Voir tous les articles'}
          </Link>
        </div>
      </div>
    </div>
  );
};

BlogArticleRenderer.propTypes = {
  article: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    publishedDate: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string,
    author: PropTypes.string.isRequired,
    readTime: PropTypes.string.isRequired,
    seo: PropTypes.object.isRequired,
    heroImage: PropTypes.object.isRequired,
    title: PropTypes.object.isRequired,
    intro: PropTypes.object.isRequired,
    disclaimer: PropTypes.object,
    sections: PropTypes.array.isRequired,
    cta: PropTypes.object,
    relatedArticles: PropTypes.array
  }).isRequired
};

export default BlogArticleRenderer;
