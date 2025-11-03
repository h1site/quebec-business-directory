import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import { getBusinessUrl } from '../utils/urlHelpers.js';

const BusinessCard = ({ business }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const description = isEnglish
    ? (business.description_en || business.description)
    : (business.description || business.description_en);

  return (
    <LocalizedLink to={getBusinessUrl(business)} className="business-card-link">
      <article className="business-card">
        <div>
          <h3>{business.name}</h3>
          <p>{description}</p>
        </div>
    <div className="meta">
      {business.phone && <span>📞 {business.phone}</span>}
      {business.email && <span>✉️ {business.email}</span>}
      {business.city && business.address && (
        <span>
          📍 {business.address}, {business.city}
        </span>
      )}
    </div>
    </article>
  </LocalizedLink>
  );
};

BusinessCard.propTypes = {
  business: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default BusinessCard;
