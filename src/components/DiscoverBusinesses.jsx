import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './DiscoverBusinesses.css';

/**
 * Discover Businesses Component
 * Displays 3 random businesses from the same region to improve internal linking
 */
const DiscoverBusinesses = ({ businesses, currentBusinessId }) => {
  const { t, i18n } = useTranslation();

  if (!businesses || businesses.length === 0) {
    return null;
  }

  // Filter out current business and limit to 3
  const displayBusinesses = businesses
    .filter(b => b.id !== currentBusinessId)
    .slice(0, 3);

  if (displayBusinesses.length === 0) {
    return null;
  }

  // Generate slug for URL
  const generateSlug = (text) => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <section className="discover-businesses-section">
      <h2 className="discover-title">{t('discover.title')}</h2>
      <p className="discover-subtitle">{t('discover.subtitle')}</p>

      <div className="discover-grid">
        {displayBusinesses.map((business) => {
          const citySlug = generateSlug(business.city);
          const categorySlug = business.main_category_slug || 'entreprise';
          const businessUrl = i18n.language === 'en'
            ? `/en/${categorySlug}/${citySlug}/${business.slug}`
            : `/${categorySlug}/${citySlug}/${business.slug}`;

          return (
            <a
              key={business.id}
              href={businessUrl}
              className="discover-card"
              aria-label={t('discover.viewBusiness', { name: business.name })}
            >
              <div className="discover-card-header">
                <h3 className="discover-business-name">{business.name}</h3>
                {business.google_rating && (
                  <div className="discover-rating">
                    <span className="rating-star">★</span>
                    <span className="rating-value">{business.google_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="discover-card-body">
                <p className="discover-location">
                  📍 {business.city}{business.region ? `, ${business.region}` : ''}
                </p>

                {business.description && (
                  <p className="discover-description">
                    {business.description.substring(0, 100)}
                    {business.description.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>

              <div className="discover-card-footer">
                <span className="discover-link-text">{t('discover.viewDetails')}</span>
                <span className="discover-arrow">→</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

DiscoverBusinesses.propTypes = {
  businesses: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    region: PropTypes.string,
    main_category_slug: PropTypes.string,
    google_rating: PropTypes.number,
    description: PropTypes.string
  })),
  currentBusinessId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default DiscoverBusinesses;
