import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import { supabase } from '../services/supabaseClient';
import './PopularCities.css';

// Top Quebec cities by population (aligned with SSR in api/seo.js)
const POPULAR_CITIES = [
  { name: 'Montréal', nameEn: 'Montreal', slug: 'montreal' },
  { name: 'Québec', nameEn: 'Quebec City', slug: 'quebec' },
  { name: 'Laval', nameEn: 'Laval', slug: 'laval' },
  { name: 'Gatineau', nameEn: 'Gatineau', slug: 'gatineau' },
  { name: 'Longueuil', nameEn: 'Longueuil', slug: 'longueuil' },
  { name: 'Sherbrooke', nameEn: 'Sherbrooke', slug: 'sherbrooke' },
  { name: 'Saguenay', nameEn: 'Saguenay', slug: 'saguenay' },
  { name: 'Lévis', nameEn: 'Levis', slug: 'levis' },
  { name: 'Trois-Rivières', nameEn: 'Trois-Rivieres', slug: 'trois-rivieres' },
  { name: 'Terrebonne', nameEn: 'Terrebonne', slug: 'terrebonne' },
  { name: 'Saint-Jean-sur-Richelieu', nameEn: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu' },
  { name: 'Repentigny', nameEn: 'Repentigny', slug: 'repentigny' },
];

function PopularCities() {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [cityCounts, setCityCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCityCounts();
  }, []);

  const loadCityCounts = async () => {
    try {
      // Get counts for each popular city
      const cityNames = POPULAR_CITIES.map(c => c.name);

      const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .in('city', cityNames);

      if (error) {
        console.error('Error loading city counts:', error);
        setLoading(false);
        return;
      }

      // Count businesses per city
      const counts = {};
      data.forEach(b => {
        if (b.city) {
          counts[b.city] = (counts[b.city] || 0) + 1;
        }
      });

      setCityCounts(counts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading city counts:', error);
      setLoading(false);
    }
  };

  const formatCount = (count) => {
    if (!count) return '';
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k+`;
    }
    return count.toLocaleString();
  };

  return (
    <section className="popular-cities">
      <div className="container">
        <div className="popular-cities-header">
          <h2 className="popular-cities-title">
            {isEnglish ? 'Popular Cities' : 'Villes populaires'}
          </h2>
          <p className="popular-cities-subtitle">
            {isEnglish
              ? 'Find businesses in the largest Quebec cities'
              : 'Trouvez des entreprises dans les plus grandes villes du Québec'}
          </p>
        </div>

        <div className="popular-cities-grid">
          {POPULAR_CITIES.map((city) => (
            <LocalizedLink
              key={city.slug}
              to={`/ville/${city.slug}`}
              className="popular-city-card"
            >
              <span className="popular-city-icon">🏙️</span>
              <div className="popular-city-info">
                <span className="popular-city-name">{isEnglish ? city.nameEn : city.name}</span>
                {!loading && cityCounts[city.name] && (
                  <span className="popular-city-count">
                    {formatCount(cityCounts[city.name])} {isEnglish ? 'businesses' : 'entreprises'}
                  </span>
                )}
              </div>
              <span className="popular-city-arrow">→</span>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCities;
