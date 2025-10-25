import PropTypes from 'prop-types';
import './BusinessPreview.css';

const BusinessPreview = ({ formData }) => {
  const {
    name,
    description,
    company_size,
    founded_year,
    logo_preview,
    image_previews,
    phone,
    email,
    website,
    address,
    city,
    province,
    postal_code,
    services
  } = formData;

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Format full address
  const fullAddress = [address, city, province, postal_code]
    .filter(Boolean)
    .join(', ');

  // Company size labels
  const companySizeLabels = {
    '1-10': '1-10 employés',
    '11-50': '11-50 employés',
    '51-200': '51-200 employés',
    '201-500': '201-500 employés',
    '500+': '500+ employés'
  };

  return (
    <div className="business-preview">
      <div className="preview-header">
        <h3>Aperçu du profil</h3>
        <span className="preview-badge">Mise à jour en temps réel</span>
      </div>

      <div className="preview-content">
        {/* Header section with logo and name */}
        <div className="preview-business-header">
          {logo_preview ? (
            <img src={logo_preview} alt="Logo" className="preview-logo" />
          ) : (
            <div className="preview-logo-placeholder">
              <span>Logo</span>
            </div>
          )}

          <div className="preview-business-info">
            <h1 className="preview-business-name">
              {name || 'Nom de l\'entreprise'}
            </h1>

            {/* Rating placeholder */}
            <div className="preview-rating">
              <div className="preview-stars">
                {'★'.repeat(5)}
              </div>
              <span className="preview-rating-text">Nouveau</span>
            </div>

            {/* Company details */}
            {(company_size || founded_year) && (
              <div className="preview-company-details">
                {company_size && (
                  <span className="preview-detail-badge">
                    👥 {companySizeLabels[company_size] || company_size}
                  </span>
                )}
                {founded_year && (
                  <span className="preview-detail-badge">
                    📅 Fondée en {founded_year}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact information */}
        {(phone || email || website || fullAddress) && (
          <div className="preview-contact">
            {phone && (
              <div className="preview-contact-item">
                <span className="preview-contact-icon">📞</span>
                <span className="preview-contact-text">{formatPhone(phone)}</span>
              </div>
            )}

            {website && (
              <div className="preview-contact-item">
                <span className="preview-contact-icon">🌐</span>
                <a href={website} target="_blank" rel="noopener noreferrer" className="preview-contact-link">
                  {website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              </div>
            )}

            {email && (
              <div className="preview-contact-item">
                <span className="preview-contact-icon">✉️</span>
                <a href={`mailto:${email}`} className="preview-contact-link">
                  {email}
                </a>
              </div>
            )}

            {fullAddress && (
              <div className="preview-contact-item">
                <span className="preview-contact-icon">📍</span>
                <span className="preview-contact-text">{fullAddress}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="preview-section">
            <h3 className="preview-section-title">À propos</h3>
            <p className="preview-description">
              {description || 'Aucune description fournie.'}
            </p>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div className="preview-section">
            <h3 className="preview-section-title">Services</h3>
            <div className="preview-services">
              {services.map((service, index) => (
                <span key={index} className="preview-service-tag">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Images gallery */}
        {image_previews && image_previews.length > 0 && (
          <div className="preview-section">
            <h3 className="preview-section-title">Photos</h3>
            <div className="preview-gallery">
              {image_previews.slice(0, 6).map((imageUrl, index) => (
                <div key={index} className="preview-gallery-item">
                  <img src={imageUrl} alt={`Photo ${index + 1}`} />
                </div>
              ))}
              {image_previews.length > 6 && (
                <div className="preview-gallery-more">
                  +{image_previews.length - 6} photos
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!name && !description && !phone && !website && (
          <div className="preview-empty">
            <div className="preview-empty-icon">👀</div>
            <p className="preview-empty-text">
              Commencez à remplir le formulaire pour voir un aperçu de votre profil
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

BusinessPreview.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    company_size: PropTypes.string,
    founded_year: PropTypes.number,
    logo_preview: PropTypes.string,
    image_previews: PropTypes.arrayOf(PropTypes.string),
    phone: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    province: PropTypes.string,
    postal_code: PropTypes.string,
    services: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default BusinessPreview;
