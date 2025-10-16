import PropTypes from 'prop-types';

const BusinessCard = ({ business }) => (
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
    {business.categories?.length > 0 && (
      <div className="badge-list">
        {business.categories.map((category) => (
          <span key={category} className="badge">
            {category}
          </span>
        ))}
      </div>
    )}
  </article>
);

BusinessCard.propTypes = {
  business: PropTypes.shape({
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
