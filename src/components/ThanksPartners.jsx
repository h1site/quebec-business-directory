import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import './ThanksPartners.css';

function ThanksPartners() {
  const { t } = useTranslation();

  const partners = [
    {
      id: 1,
      name: 'Légende Cycle Inc',
      city: 'Cap-Santé',
      category: 'Garages & mécanique',
      categorySlug: 'Garages%20&%20m%C3%A9canique',
      citySlug: 'cap-sante',
      slug: 'legende-cycle-inc',
      url: '/Garages%20&%20m%C3%A9canique/cap-sante/legende-cycle-inc'
    },
    {
      id: 2,
      name: 'Eve laser Brossard',
      city: 'Longueuil',
      category: 'Spas & centres esthétiques',
      categorySlug: 'Spas%20&%20centres%20esth%C3%A9tiques',
      citySlug: 'longueuil',
      slug: 'eve-laser-brossard',
      url: '/Spas%20&%20centres%20esth%C3%A9tiques/longueuil/eve-laser-brossard'
    }
  ];

  return (
    <section className="thanks-partners">
      <div className="container">
        <div className="thanks-header">
          <h2 className="thanks-title">{t('home.thanksTitle')}</h2>
          <p className="thanks-subtitle">{t('home.thanksSubtitle')}</p>
        </div>
        <div className="thanks-grid">
          {partners.map((partner) => (
            <LocalizedLink
              key={partner.id}
              to={partner.url}
              className="thanks-card"
            >
              <div className="thanks-content">
                <h3 className="thanks-business-name">{partner.name}</h3>
                <p className="thanks-city">📍 {partner.city}</p>
                <p className="thanks-category">{partner.category}</p>
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
