import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import CityAutocomplete from './CityAutocomplete.jsx';
import { getMainCategories, getSubCategories } from '../services/lookupService.js';
import { quebecMunicipalities, getAllRegions, getCitiesByRegion, getMRCsByRegion } from '../data/quebecMunicipalities.js';
import { supabase } from '../services/supabaseClient.js';
import listAnimation from '../../public/images/logos/list.json';
import cityAnimation from '../../public/images/logos/city.json';

const SearchHero = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [what, setWhat] = useState('');
  const [where, setWhere] = useState('');
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [randomBusinesses, setRandomBusinesses] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [mainCatsResult, subCatsResult] = await Promise.all([
          getMainCategories(),
          getSubCategories()
        ]);
        setMainCategories(mainCatsResult.data || []);
        setSubCategories(subCatsResult.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  // Load total businesses count and random businesses
  useEffect(() => {
    const loadBusinessesData = async () => {
      try {
        // Get total count
        const { count } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true });

        setTotalBusinesses(count || 0);

        // Get 3 random businesses with good ratings
        const { data } = await supabase
          .from('businesses')
          .select('id, slug, name, city, region, description, logo_url, google_rating, google_reviews_count')
          .not('google_rating', 'is', null)
          .gte('google_rating', 4.0)
          .limit(100);

        if (data && data.length > 0) {
          // Shuffle and pick 3
          const shuffled = data.sort(() => 0.5 - Math.random());
          setRandomBusinesses(shuffled.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading businesses data:', error);
      }
    };

    loadBusinessesData();
  }, []);

  const onSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (what) params.set('q', what);
    if (where) params.set('city', where);
    const queryString = params.toString();
    navigate(queryString ? `/recherche?${queryString}` : '/recherche');
  };

  const getLabel = (item) => {
    return i18n.language === 'en' ? item.label_en : item.label_fr;
  };

  const getSubCategoriesForMain = (mainCategoryId) => {
    return subCategories
      .filter(sub => sub.main_category_id === mainCategoryId)
      .slice(0, 5);
  };

  // Split into 4 columns
  const categoriesPerColumn = Math.ceil(mainCategories.length / 4);
  const categoryColumns = [
    mainCategories.slice(0, categoriesPerColumn),
    mainCategories.slice(categoriesPerColumn, categoriesPerColumn * 2),
    mainCategories.slice(categoriesPerColumn * 2, categoriesPerColumn * 3),
    mainCategories.slice(categoriesPerColumn * 3)
  ];

  // Get all regions from Quebec municipalities
  const allRegions = getAllRegions();
  const regionsPerColumn = Math.ceil(allRegions.length / 4);
  const regionColumns = [
    allRegions.slice(0, regionsPerColumn),
    allRegions.slice(regionsPerColumn, regionsPerColumn * 2),
    allRegions.slice(regionsPerColumn * 2, regionsPerColumn * 3),
    allRegions.slice(regionsPerColumn * 3)
  ];

  return (
    <section className="hero-section">
      <div className="container hero-content">
        <div>
          <h1 className="hero-title">
            {i18n.language === 'fr' ? (
              <>
                Trouvez les meilleurs professionnels<br />
                près de chez vous
              </>
            ) : (
              <>
                Find the best professionals<br />
                near you
              </>
            )}
          </h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
        </div>
        <form className="search-boxes" onSubmit={onSubmit}>
          <input
            type="search"
            placeholder={t('hero.whatPlaceholder')}
            value={what}
            onChange={(event) => setWhat(event.target.value)}
            aria-label={t('hero.whatPlaceholder')}
          />
          <CityAutocomplete
            value={where}
            onChange={setWhere}
            placeholder={t('hero.wherePlaceholder')}
            className="hero-city-input"
          />
          <button type="submit" className="primary-button">
            {t('hero.searchButton')}
          </button>
        </form>

        {/* Découvertes du jour avec total d'entreprises */}
        <div className="hero-discoveries">
          <div className="discoveries-header">
            <h2 className="discoveries-title">{t('home.randomBusinessesTitle')}</h2>
            <p className="discoveries-subtitle">
              {t('home.randomBusinessesSubtitle')}{' '}
              {i18n.language === 'fr' ? 'parmi' : 'among'}{' '}
              <strong>{totalBusinesses.toLocaleString()}</strong> {i18n.language === 'fr' ? 'entreprises' : 'businesses'}.{' '}
              <Link to="/ajouter" className="discoveries-cta">
                {i18n.language === 'fr' ? 'Ajoutez la vôtre, c\'est gratuit!' : 'Add yours for free!'}
              </Link>
            </p>
          </div>

          <div className="discoveries-grid">
            {randomBusinesses.map((business) => (
              <Link
                key={business.id}
                to={`/entreprise/${business.slug}`}
                className="discovery-card"
              >
                <div className="discovery-content">
                  <h3 className="discovery-name">{business.name}</h3>
                  <p className="discovery-location">
                    {business.city}{business.region && `, ${business.region}`}
                  </p>
                  {business.google_rating && (
                    <div className="discovery-rating">
                      <span className="rating-stars">{'★'.repeat(Math.round(business.google_rating))}</span>
                      <span className="rating-value">{business.google_rating.toFixed(1)}</span>
                      {business.google_reviews_count && (
                        <span className="rating-count">({business.google_reviews_count})</span>
                      )}
                    </div>
                  )}
                  {(() => {
                    const isEnglish = i18n.language === 'en';
                    const description = isEnglish
                      ? (business.description_en || business.description)
                      : (business.description || business.description_en);
                    return description && (
                      <p className="discovery-description">
                        {description.substring(0, 100)}...
                      </p>
                    );
                  })()}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="hero-browse-section">
          <h2 className="browse-title">
            <Lottie
              animationData={listAnimation}
              loop={true}
              className="browse-title-icon"
            />
            <span className="browse-title-text">Explorer par catégorie</span>
          </h2>
          <div className="browse-grid">
            {categoryColumns.map((columnCategories, colIndex) => (
              <div key={colIndex} className="browse-column">
                {columnCategories.map((category) => (
                  <div key={category.id} className="browse-group">
                    <Link
                      to={`/recherche?category=${category.slug}`}
                      className="browse-main-link"
                    >
                      {getLabel(category)}
                    </Link>
                    <ul className="browse-sub-list">
                      {getSubCategoriesForMain(category.id).map((subCat) => (
                        <li key={subCat.id}>
                          <Link
                            to={`/recherche?category=${category.slug}&subcategory=${subCat.slug}`}
                            className="browse-sub-link"
                          >
                            {getLabel(subCat)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Regions Grid */}
        <div className="hero-browse-section">
          <h2 className="browse-title">
            <Lottie
              animationData={cityAnimation}
              loop={true}
              className="browse-title-icon"
            />
            <span className="browse-title-text">Explorer par région</span>
          </h2>
          <div className="browse-grid">
            {regionColumns.map((columnRegions, colIndex) => (
              <div key={colIndex} className="browse-column">
                {columnRegions.map((region) => {
                  const mrcs = getMRCsByRegion(region.slug);
                  const cities = getCitiesByRegion(region.slug);

                  // Get top 8 cities, prioritizing major ones
                  const topCities = cities.slice(0, 8);

                  return (
                    <div key={region.slug} className="browse-group">
                      <Link
                        to={`/recherche?region=${region.slug}`}
                        className="browse-main-link"
                      >
                        {region.name} ({region.code})
                      </Link>
                      <div className="region-info">
                        <small style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                          {mrcs.length} MRC{mrcs.length > 1 ? 's' : ''} · {cities.length} municipalités
                        </small>
                      </div>
                      <ul className="browse-sub-list">
                        {topCities.map((city, cityIndex) => (
                          <li key={cityIndex}>
                            <Link
                              to={`/recherche?city=${encodeURIComponent(city)}`}
                              className="browse-sub-link"
                            >
                              {city}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {cities.length > 8 && (
                        <Link
                          to={`/recherche?region=${region.slug}`}
                          className="browse-sub-link"
                          style={{
                            fontStyle: 'italic',
                            color: '#ffbd3d',
                            marginTop: '0.25rem',
                            display: 'block'
                          }}
                        >
                          + {cities.length - 8} autres villes
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchHero;
