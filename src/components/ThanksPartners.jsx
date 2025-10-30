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
      // Charger les 3 dernières entreprises ajoutées manuellement (data_source = 'manual')
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, slug, city, primary_main_category_fr, primary_main_category_en, primary_main_category_slug')
        .eq('data_source', 'manual')
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
          {newBusinesses.map((business) => (
            <LocalizedLink
              key={business.id}
              to={getBusinessUrl(business)}
              className="thanks-card"
            >
              <div className="thanks-content">
                <h3 className="thanks-business-name">{business.name}</h3>
                {business.city && (
                  <p className="thanks-city">📍 {business.city}</p>
                )}
                {business.primary_main_category_fr && (
                  <p className="thanks-category">
                    {i18n.language === 'en' ? business.primary_main_category_en : business.primary_main_category_fr}
                  </p>
                )}
              </div>
              <div className="thanks-cta">
                {t('home.viewListing')} →
              </div>
            </LocalizedLink>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ThanksPartners;
