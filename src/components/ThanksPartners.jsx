import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import { supabase } from '../services/supabaseClient';
import { getBusinessUrl } from '../utils/urlHelpers';
import './ThanksPartners.css';

function ThanksPartners() {
  const { t, i18n } = useTranslation();
  const [newBusinesses, setNewBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewBusinesses();
  }, []);

  const loadNewBusinesses = async () => {
    try {
      // Charger les 3 dernières entreprises ajoutées manuellement (data_source = 'manual' OU 'user_created')
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, city, categories, main_category_slug')
        .in('data_source', ['manual', 'user_created'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Erreur chargement nouvelles entreprises:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setNewBusinesses(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement nouvelles entreprises:', error);
      setLoading(false);
    }
  };

  if (loading || newBusinesses.length === 0) {
    return null; // Ne rien afficher si pas de données
  }

  return (
    <section className="thanks-partners">
      <div className="container">
        <div className="thanks-header">
          <h2 className="thanks-title">{t('home.newBusinessesTitle')}</h2>
          <p className="thanks-subtitle">{t('home.newBusinessesSubtitle')}</p>
        </div>
        <div className="thanks-grid">
          {newBusinesses.map((business) => {
            // Générer URL: utiliser legacy /entreprise/:slug si pas de main_category_slug
            const businessUrl = business.main_category_slug && business.city
              ? `/${business.main_category_slug}/${business.city.toLowerCase().replace(/\s+/g, '-')}/${business.slug}`
              : `/entreprise/${business.slug}`;

            return (
              <LocalizedLink
                key={business.id}
                to={businessUrl}
                className="thanks-card"
              >
                <div className="thanks-content">
                  <h3 className="thanks-business-name">{business.name}</h3>
                  {business.city && (
                    <p className="thanks-city">📍 {business.city}</p>
                  )}
                  {business.categories && (
                    <p className="thanks-category">
                      {business.categories}
                    </p>
                  )}
                </div>
                <div className="thanks-cta">
                  {t('home.viewListing')} →
                </div>
              </LocalizedLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ThanksPartners;
