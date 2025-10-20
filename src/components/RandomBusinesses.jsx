import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient.js';
import { Link } from 'react-router-dom';
import './RandomBusinesses.css';

const RandomBusinesses = () => {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomBusinesses();
  }, []);

  const fetchRandomBusinesses = async () => {
    try {
      setLoading(true);

      // Get 3 random businesses with rating and reviews
      const { data, error } = await supabase
        .from('businesses')
        .select('id, slug, name, city, region, description, logo_url, google_rating, google_reviews_count')
        .not('google_rating', 'is', null)
        .gte('google_rating', 4.0)
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        // Pick 3 random businesses from the top rated ones
        const shuffled = data.sort(() => 0.5 - Math.random());
        setBusinesses(shuffled.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching random businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (businesses.length === 0) {
    return null; // Don't show if no businesses found
  }

  return (
    <section className="random-businesses">
      <div className="container">
        <div className="random-businesses-header">
          <h2 className="random-businesses-title">
            {t('home.randomBusinessesTitle')}
          </h2>
          <p className="random-businesses-subtitle">
            {t('home.randomBusinessesSubtitle')}
          </p>
        </div>

        <div className="random-businesses-grid">
          {businesses.map((business) => (
            <Link
              key={business.id}
              to={`/entreprise/${business.slug}`}
              className="random-business-card"
            >
              {business.logo_url ? (
                <div className="random-business-logo">
                  <img src={business.logo_url} alt={business.name} />
                </div>
              ) : (
                <div className="random-business-logo random-business-logo-placeholder">
                  <span>{business.name.charAt(0)}</span>
                </div>
              )}

              <div className="random-business-content">
                <h3 className="random-business-name">{business.name}</h3>

                <div className="random-business-location">
                  📍 {business.city}{business.region && `, ${business.region}`}
                </div>

                {business.google_rating && (
                  <div className="random-business-rating">
                    <span className="stars">⭐ {business.google_rating.toFixed(1)}</span>
                    {business.google_reviews_count && (
                      <span className="reviews-count">
                        ({business.google_reviews_count} {t('home.reviews')})
                      </span>
                    )}
                  </div>
                )}

                {business.description && (
                  <p className="random-business-description">
                    {business.description.substring(0, 120)}
                    {business.description.length > 120 ? '...' : ''}
                  </p>
                )}

                <div className="random-business-cta">
                  {t('home.seeDetails')} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="random-businesses-footer">
          <button
            onClick={fetchRandomBusinesses}
            className="btn-refresh-random"
          >
            🔄 {t('home.discoverOthers')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default RandomBusinesses;
