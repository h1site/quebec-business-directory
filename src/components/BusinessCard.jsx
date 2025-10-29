import PropTypes from 'prop-types';
import LocalizedLink from './LocalizedLink.jsx';
import { getBusinessUrl } from '../utils/urlHelpers.js';

const BusinessCard = ({ business }) => (
  <LocalizedLink to={getBusinessUrl(business)} className="business-card-link">
    <article className="business-card">
      <div>
        <h3>{business.name}</h3>
        <p>{business.description}</p>
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
