import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import CityAutocomplete from './CityAutocomplete.jsx';
import { getMainCategories } from '../services/lookupService.js';
import { supabase } from '../services/supabaseClient.js';
import { localizedLink } from '../utils/languageRouting';
import './SearchHeroYelp.css';

// Mapping des icônes par slug de catégorie
const categoryIcons = {
  'agriculture-et-environnement': 'agriculture.svg',
  'arts-medias-et-divertissement': 'art.svg',
  'automobile-et-transport': 'automobile.svg',
  'commerce-de-detail': 'commerce.svg',
  'construction-et-renovation': 'construction.svg',
  'education-et-formation': 'education.svg',
  'finance-assurance-et-juridique': 'finance.svg',
  'immobilier': 'immobilier.svg',
  'industrie-fabrication-et-logistique': 'industrie.svg',
  'maison-et-services-domestiques': 'maison.svg',
  'organismes-publics-et-communautaires': 'organismes.svg',
  'restauration-et-alimentation': 'restauration.svg',
  'sante-et-bien-etre': 'sante.svg',
  'services-funeraires': 'funeraire.svg',
  'services-professionnels': 'services.svg',
  'soins-a-domicile': 'soins.svg',
  'sports-et-loisirs': 'sports.svg',
  'technologie-et-informatique': 'technologie.svg',
  'tourisme-et-hebergement': 'tourisme.svg'
};

const SearchHeroYelp = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [mainCategories, setMainCategories] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState('');

  // Detect current language from URL
  const isEnglish = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const currentLang = isEnglish ? 'en' : 'fr';

  // 5 background images for different sectors
  const backgroundImages = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80', // Restaurant
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80', // Commerce/Building
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80', // Immobilier
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80', // Construction
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80', // Automobile
  ];

  useEffect(() => {
    // Select random background on mount
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);

    const loadData = async () => {
      try {
        // Get total count
        const { count } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true });
        setTotalBusinesses(count || 0);

        // Get categories
        const { data } = await getMainCategories();
        setMainCategories(data || []); // Toutes les catégories
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (what) params.set('q', what);
    if (where) params.set('city', where);
    const queryString = params.toString();
    const searchPath = localizedLink('/recherche', currentLang);
    navigate(queryString ? `${searchPath}?${queryString}` : searchPath);
  };

  const getLabel = (item) => {
    return i18n.language === 'en' ? item.label_en : item.label_fr;
  };

  // Quick search suggestions (like Yelp)
  const quickSearches = [
    { icon: '🍔', labelKey: 'hero.quickSearch.restaurants', query: 'restaurants' },
    { icon: '☕', labelKey: 'hero.quickSearch.cafes', query: i18n.language === 'en' ? 'cafes' : 'cafés' },
    { icon: '🔧', labelKey: 'hero.quickSearch.plumbers', query: i18n.language === 'en' ? 'plumbers' : 'plombiers' },
    { icon: '✂️', labelKey: 'hero.quickSearch.salons', query: i18n.language === 'en' ? 'hair salon' : 'salon de coiffure' },
  ];

  return (
    <div className="hero-yelp">
      {/* Hero Section with Background Image */}
      <div className="hero-yelp-main" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="hero-yelp-overlay"></div>
        <div className="hero-yelp-content">
          <h1 className="hero-yelp-title">
            {t('hero.findTitle')}
          </h1>

          {/* Beta Notice */}
          <div className="hero-beta-notice">
            <span className="beta-badge">BÊTA</span>
            <p>{t('hero.betaNotice')}</p>
          </div>

          <p className="hero-yelp-subtitle">
            {t('hero.businessCount', { count: totalBusinesses.toLocaleString() })}
          </p>

          {/* Search Form */}
          <form className="hero-yelp-search" onSubmit={onSubmit}>
            <div className="hero-yelp-search-group">
              <label>{t('hero.whatLabel')}</label>
              <input
                type="search"
                placeholder={t('hero.whatPlaceholder')}
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                className="hero-yelp-input"
              />
            </div>
            <div className="hero-yelp-search-group">
              <label>{t('hero.whereLabel')}</label>
              <CityAutocomplete
                value={where}
                onChange={setWhere}
                placeholder={t('hero.wherePlaceholder')}
                className="hero-yelp-input"
              />
            </div>
            <button type="submit" className="hero-yelp-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </form>

          {/* Quick Search Buttons */}
          <div className="hero-yelp-quick">
            {quickSearches.map((item, idx) => (
              <button
                key={idx}
                className="hero-yelp-quick-btn"
                onClick={() => {
                  setWhat(item.query);
                  const params = new URLSearchParams();
                  params.set('q', item.query);
                  const searchPath = localizedLink('/recherche', currentLang);
                  navigate(`${searchPath}?${params.toString()}`);
                }}
              >
                <span className="hero-yelp-quick-icon">{item.icon}</span>
                {t(item.labelKey)}
              </button>
            ))}
          </div>

          {/* Notice - Add Your Business */}
          <div className="hero-add-business-notice" style={{
            margin: '2rem auto 0px',
            padding: '1.25rem 1.5rem',
            background: 'rgb(2 6 52)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px'
          }}>
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '0.95rem',
              color: '#ffffff',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              {t('home.addBusinessNotice')}
            </p>
            <LocalizedLink
              to="/inscription"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'rgb(41 127 166)',
                color: '#f9f9f9',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: '0.2s',
                boxShadow: 'rgba(14, 165, 233, 0.3) 0px 2px 8px',
                transform: 'translateY(0px)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgb(31 107 146)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgb(41 127 166)';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'rgba(14, 165, 233, 0.3) 0px 2px 8px';
              }}
            >
              {t('home.addBusinessButton')}
            </LocalizedLink>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="hero-yelp-categories">
        <div className="container">
          <h2 className="hero-yelp-categories-title">
            {t('hero.browseByCategory')}
          </h2>

          {/* All categories */}
          <div className="hero-yelp-categories-grid">
            {mainCategories.map((category) => (
              <LocalizedLink
                key={category.id}
                to={`/categorie/${category.slug}`}
                className="hero-yelp-category-card"
              >
                {categoryIcons[category.slug] && (
                  <img
                    src={`/images/icons/${categoryIcons[category.slug]}`}
                    alt={getLabel(category)}
                    className="hero-yelp-category-icon"
                    loading="lazy"
                    decoding="async"
                    width="64"
                    height="64"
                  />
                )}
                <div className="hero-yelp-category-name">{getLabel(category)}</div>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHeroYelp;
