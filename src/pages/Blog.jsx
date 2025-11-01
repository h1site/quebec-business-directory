import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { getBlogCards } from '../data/blogArticlesData';
import './Blog.css';

// YouTube playlists - organisées par thème
const youtubePlaylists = {
  fr: [
    {
      id: 'tuto-wordpress',
      title: 'Tuto WordPress',
      description: 'Tutoriels WordPress pour créer et gérer votre site web professionnel',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLvn1D8EiWO2MEgRKof3oBm_es_bh-FhEA',
      videos: [
        {
          youtubeId: 'O3Uj6-ttcXE',
          title: 'Comment changer le mot de passe WordPress dans phpMyAdmin ? (2025)',
          duration: '1:40',
          views: '134'
        },
        {
          youtubeId: 'EaG08_ooVw8',
          title: 'Créez Votre Site Web Pro en Un Temps Record avec WordPress et cPanel !',
          duration: '4:28',
          views: '45'
        },
        {
          youtubeId: 'RUmSsXisjpg',
          title: 'Migration WordPress Site avec ManageWP (2025)',
          duration: '3:33',
          views: '27'
        },
        {
          youtubeId: 'S4rwuHmRVUQ',
          title: 'Comment traduire facilement votre site WordPress avec TranslatePress ?',
          duration: '3:30',
          views: '170'
        }
      ]
    },
    {
      id: 'conseils-entrepreneuriat',
      title: 'Conseils pour entrepreneurs',
      description: 'Astuces et stratégies pour réussir votre entreprise au Québec',
      playlistUrl: null,
      videos: []
    },
    {
      id: 'marketing-numerique',
      title: 'Marketing Numérique',
      description: 'Stratégies de marketing numérique pour développer votre entreprise en ligne',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLvn1D8EiWO2NfrTWNMXb93ePyFggwQAR5',
      videos: [
        {
          youtubeId: 'Y76FAMAuf0M',
          title: 'Dominez Google avec le SEO local en 2025',
          duration: '13:23',
          views: '250'
        },
        {
          youtubeId: 'QYKdTfZGyEg',
          title: 'Comment Optimiser Votre Site Web pour Attirer Plus de Clients Locaux',
          duration: '12:45',
          views: '180'
        },
        {
          youtubeId: '2CZIEiKhxyU',
          title: 'Les Secrets du Marketing Digital pour PME',
          duration: '15:30',
          views: '320'
        },
        {
          youtubeId: 'E_KpOGsMrLc',
          title: 'Google My Business: Le Guide Complet 2025',
          duration: '18:12',
          views: '410'
        },
        {
          youtubeId: 'XooG7n0X6ps',
          title: 'Publicité Facebook pour Entrepreneurs Locaux',
          duration: '14:55',
          views: '290'
        },
        {
          youtubeId: '5NB8yl-5mWc',
          title: 'Stratégies Instagram pour Petites Entreprises',
          duration: '11:38',
          views: '225'
        },
        {
          youtubeId: 'wpX82uczphs',
          title: 'Email Marketing: Comment Fidéliser Vos Clients',
          duration: '16:20',
          views: '195'
        }
      ]
    }
  ],
  en: [
    {
      id: 'wordpress-tutorials',
      title: 'WordPress Tutorials',
      description: 'WordPress tutorials to create and manage your professional website',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLvn1D8EiWO2MEgRKof3oBm_es_bh-FhEA',
      videos: [
        {
          youtubeId: 'O3Uj6-ttcXE',
          title: 'How to change WordPress password in phpMyAdmin? (2025)',
          duration: '1:40',
          views: '134'
        },
        {
          youtubeId: 'EaG08_ooVw8',
          title: 'Create Your Pro Website in Record Time with WordPress and cPanel!',
          duration: '4:28',
          views: '45'
        },
        {
          youtubeId: 'RUmSsXisjpg',
          title: 'WordPress Site Migration with ManageWP (2025)',
          duration: '3:33',
          views: '27'
        },
        {
          youtubeId: 'S4rwuHmRVUQ',
          title: 'How to easily translate your WordPress site with TranslatePress?',
          duration: '3:30',
          views: '170'
        }
      ]
    },
    {
      id: 'business-tips',
      title: 'Business Tips',
      description: 'Tips and strategies to grow your business in Quebec',
      playlistUrl: null,
      videos: []
    },
    {
      id: 'digital-marketing',
      title: 'Digital Marketing',
      description: 'Digital marketing strategies to grow your business online',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLvn1D8EiWO2NfrTWNMXb93ePyFggwQAR5',
      videos: [
        {
          youtubeId: 'Y76FAMAuf0M',
          title: 'Dominate Google with Local SEO in 2025',
          duration: '13:23',
          views: '250'
        },
        {
          youtubeId: 'QYKdTfZGyEg',
          title: 'How to Optimize Your Website to Attract More Local Customers',
          duration: '12:45',
          views: '180'
        },
        {
          youtubeId: '2CZIEiKhxyU',
          title: 'Digital Marketing Secrets for Small Businesses',
          duration: '15:30',
          views: '320'
        },
        {
          youtubeId: 'E_KpOGsMrLc',
          title: 'Google My Business: Complete Guide 2025',
          duration: '18:12',
          views: '410'
        },
        {
          youtubeId: 'XooG7n0X6ps',
          title: 'Facebook Advertising for Local Entrepreneurs',
          duration: '14:55',
          views: '290'
        },
        {
          youtubeId: '5NB8yl-5mWc',
          title: 'Instagram Strategies for Small Businesses',
          duration: '11:38',
          views: '225'
        },
        {
          youtubeId: 'wpX82uczphs',
          title: 'Email Marketing: How to Retain Your Customers',
          duration: '16:20',
          views: '195'
        }
      ]
    }
  ]
};

function Blog() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const playlists = youtubePlaylists[lang] || youtubePlaylists.fr;
  const blogArticles = getBlogCards(lang);

  // Generate schema markup for videos
  const videoSchemas = playlists
    .filter(p => p.videos && p.videos.length > 0)
    .flatMap(playlist =>
      playlist.videos.map(video => ({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": video.title,
        "description": playlist.description,
        "thumbnailUrl": `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`,
        "uploadDate": "2025-01-15",
        "duration": `PT${video.duration.replace(':', 'M')}S`,
        "contentUrl": `https://www.youtube.com/watch?v=${video.youtubeId}`,
        "embedUrl": `https://www.youtube.com/embed/${video.youtubeId}`,
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": { "@type": "WatchAction" },
          "userInteractionCount": video.views
        },
        "author": {
          "@type": "Person",
          "name": "H1Site Marketing",
          "url": "https://www.youtube.com/@H1SiteOfficial"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Registre du Québec",
          "logo": {
            "@type": "ImageObject",
            "url": "https://registreduquebec.com/logo.png"
          }
        }
      }))
    );

  // Page schema
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": lang === 'en' ? 'Blog - Business Resources' : 'Blogue - Ressources pour entreprises',
    "description": lang === 'en'
      ? 'Tips, news and resources for Quebec businesses'
      : 'Conseils, actualités et ressources pour les entreprises québécoises',
    "url": `https://registreduquebec.com${lang === 'en' ? '/en/blog' : '/blogue'}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": videoSchemas.map((schema, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": schema
      }))
    }
  };

  return (
    <div className="blog-page">
      <Helmet>
        <title>{lang === 'en' ? 'Blog - Quebec Business Directory' : 'Blogue - Registre du Québec'}</title>
        <meta
          name="description"
          content={lang === 'en'
            ? 'Tips, news and resources for Quebec businesses. Watch our video tutorials on WordPress, digital marketing and entrepreneurship.'
            : 'Conseils, actualités et ressources pour les entreprises québécoises. Regardez nos tutoriels vidéo sur WordPress, marketing digital et entrepreneuriat.'
          }
        />
        <link rel="canonical" href={`https://registreduquebec.com${lang === 'en' ? '/en/blog' : '/blogue'}`} />

        {/* Schema.org markup for videos */}
        <script type="application/ld+json">
          {JSON.stringify(pageSchema)}
        </script>

        {/* Individual video schemas */}
        {videoSchemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}

        {/* Open Graph */}
        <meta property="og:title" content={lang === 'en' ? 'Blog - Quebec Business Directory' : 'Blogue - Registre du Québec'} />
        <meta property="og:description" content={lang === 'en'
          ? 'Tips, news and resources for Quebec businesses'
          : 'Conseils, actualités et ressources pour les entreprises québécoises'
        } />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://registreduquebec.com${lang === 'en' ? '/en/blog' : '/blogue'}`} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={lang === 'en' ? 'Blog - Quebec Business Directory' : 'Blogue - Registre du Québec'} />
        <meta name="twitter:description" content={lang === 'en'
          ? 'Tips, news and resources for Quebec businesses'
          : 'Conseils, actualités et ressources pour les entreprises québécoises'
        } />
      </Helmet>

      <div className="blog-hero">
        <div className="container">
          <h1>{lang === 'en' ? 'Blog' : 'Blogue'}</h1>
          <p className="blog-subtitle">
            {lang === 'en'
              ? 'Tips, news and resources for Quebec businesses'
              : 'Conseils, actualités et ressources pour les entreprises québécoises'
            }
          </p>
        </div>
      </div>

      {/* YouTube Channel Promotion Section */}
      <div className="youtube-section">
        <div className="container">
          <div className="youtube-header">
            <div className="youtube-header-content">
              <svg className="youtube-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <div>
                <h2 className="youtube-title">
                  {lang === 'en'
                    ? 'Watch Our Videos on YouTube'
                    : 'Regardez nos vidéos sur YouTube'
                  }
                </h2>
                <p className="youtube-subtitle">
                  {lang === 'en'
                    ? 'Practical advice and tips for Quebec entrepreneurs'
                    : 'Conseils pratiques et astuces pour les entrepreneurs québécois'
                  }
                </p>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@H1SiteOfficial"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="youtube-subscribe-btn"
            >
              <svg className="youtube-icon-small" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              {lang === 'en' ? 'Subscribe' : "S'abonner"}
            </a>
          </div>

          {/* Featured Playlists */}
          {playlists.filter(p => p.videos && p.videos.length > 0).map(playlist => (
            <div key={playlist.id} className="playlist-section">
              <div className="playlist-header-inline">
                <div className="playlist-icon-inline">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 6h2v12H4zm4-2h2v16H8zm4 4h2v12h-2zm4-2h2v14h-2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="playlist-title-large">{playlist.title}</h2>
                  <p className="playlist-description-inline">{playlist.description}</p>
                </div>
                {playlist.playlistUrl && (
                  <a
                    href={playlist.playlistUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="playlist-link-header"
                  >
                    <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    {lang === 'en' ? 'Full playlist' : 'Playlist complète'}
                  </a>
                )}
              </div>

              <div className="videos-grid">
                {playlist.videos.map((video, index) => (
                  <div key={index} className="video-card">
                    <div className="video-embed">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div className="video-info">
                      <h3 className="video-title">{video.title}</h3>
                      <div className="video-meta">
                        <span className="video-duration">{video.duration}</span>
                        <span className="meta-separator">•</span>
                        <span className="video-views">{video.views} {lang === 'en' ? 'views' : 'visionnements'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty State Playlists */}
          {playlists.filter(p => !p.videos || p.videos.length === 0).length > 0 && (
            <>
              <div className="coming-soon-header">
                <h2>{lang === 'en' ? 'More Playlists Coming Soon' : 'Autres playlists à venir'}</h2>
              </div>
              <div className="playlists-grid">
                {playlists.filter(p => !p.videos || p.videos.length === 0).map(playlist => (
                  <div key={playlist.id} className="playlist-card">
                    <div className="playlist-icon">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6h2v12H4zm4-2h2v16H8zm4 4h2v12h-2zm4-2h2v14h-2z"/>
                      </svg>
                    </div>
                    <h3 className="playlist-title">{playlist.title}</h3>
                    <p className="playlist-description">{playlist.description}</p>
                    <p className="playlist-coming-soon">
                      {lang === 'en' ? 'Videos coming soon!' : 'Vidéos à venir!'}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
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
