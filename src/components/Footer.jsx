import { useTranslation } from 'react-i18next';
import { popularCategories, popularCities } from '../data/popularSearches.js';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-columns">
          <div>
            <h3>{t('footer.localSearches')}</h3>
            <ul>
              {popularCategories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t('footer.popularLocations')}</h3>
            <ul>
              {popularCities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
