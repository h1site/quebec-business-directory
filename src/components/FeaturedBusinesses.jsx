import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import { supabase } from '../services/supabaseClient';
import { getBusinessUrl } from '../utils/urlHelpers';
import './FeaturedBusinesses.css';

function FeaturedBusinesses() {
  const { t } = useTranslation();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedBusinesses();
  }, []);

  const loadFeaturedBusinesses = async () => {
    try {
      // Charger 3 entreprises aléatoires (ville et description optionnelles)
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, city, description, logo_url')
        .limit(100); // Charger 100 pour sélectionner 3 au hasard

      if (error) {
        console.error('Erreur Supabase détails:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (data && data.length > 0) {
        // Sélectionner 3 entreprises aléatoires
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        setBusinesses(selected);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
      setLoading(false);
    }
  };

  if (loading || businesses.length === 0) {
    return null; // Ne rien afficher si pas de données
  }

  return (
    <section className="featured-businesses desktop-only">
      <div className="container">
        <h2 className="featured-title">{t('home.featuredTitle')}</h2>
        <div className="featured-grid">
          {businesses.map((business) => (
            <LocalizedLink
              key={business.id}
              to={getBusinessUrl(business)}
              className="featured-card"
            >
              {business.logo_url && (
                <div className="featured-logo">
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    loading="lazy"
                    decoding="async"
                    width="120"
                    height="120"
                  />
                </div>
              )}
              <div className="featured-content">
                <h3 className="featured-business-name">{business.name}</h3>
                {business.city && (
                  <p className="featured-city">📍 {business.city}</p>
                )}
                {business.description && (
                  <p className="featured-description">
                    {business.description.length > 120
                      ? business.description.substring(0, 120) + '...'
                      : business.description}
                  </p>
                )}
              </div>
              <div className="featured-cta">
                {t('home.viewListing')} →
              </div>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedBusinesses;
