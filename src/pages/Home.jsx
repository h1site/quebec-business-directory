import { useTranslation } from 'react-i18next';
import SearchHero from '../components/SearchHero.jsx';
import { popularCategories, popularCities } from '../data/popularSearches.js';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div>
      <SearchHero />
      <section className="container" style={{ padding: '3rem 0' }}>
        <div className="grid">
          <div>
            <h2 className="section-title">{t('home.popularCategoriesTitle')}</h2>
            <div className="card-grid">
              {popularCategories.slice(0, 12).map((category) => (
                <div key={category} className="card">
                  <h3>{category}</h3>
                  <p>{t('home.categoryDescription', { category })}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="section-title">{t('home.popularCitiesTitle')}</h2>
            <div className="card-grid">
              {popularCities.slice(0, 12).map((city) => (
                <div key={city} className="card">
                  <h3>{city}</h3>
                  <p>{t('home.cityDescription', { city })}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
