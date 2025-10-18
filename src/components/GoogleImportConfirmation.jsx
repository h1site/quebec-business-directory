import PropTypes from 'prop-types';
import './GoogleImportConfirmation.css';

const GoogleImportConfirmation = ({ businesses, onConfirm, onCancel }) => {
  if (!businesses || businesses.length === 0) return null;

  const isSingleResult = businesses.length === 1;

  return (
    <div className="import-confirmation">
      <h3 className="confirmation-title">
        {isSingleResult
          ? 'Confirmer l\'importation'
          : `${businesses.length} entreprises trouvées - Sélectionnez la bonne`}
      </h3>

      <div className="businesses-list">
        {businesses.map((business, index) => (
          <div key={index} className="business-preview">
            <div className="business-preview-header">
              <div className="business-preview-main">
                <h4 className="business-preview-name">{business.name}</h4>
                {business.rating_average > 0 && (
                  <div className="business-preview-rating">
                    ⭐ {business.rating_average} ({business.rating_count} avis)
                  </div>
                )}
              </div>
            </div>

            <div className="business-preview-details">
              {business.address && (
                <div className="preview-detail">
                  <span className="detail-icon">📍</span>
                  <span className="detail-text">
                    {business.address}
                    {business.city && `, ${business.city}`}
                    {business.postal_code && ` ${business.postal_code}`}
                  </span>
                </div>
              )}

              {business.phone && (
                <div className="preview-detail">
                  <span className="detail-icon">📞</span>
                  <span className="detail-text">{business.phone}</span>
                </div>
              )}

              {business.website && (
                <div className="preview-detail">
                  <span className="detail-icon">🌐</span>
                  <span className="detail-text">{business.website}</span>
                </div>
              )}

              {business.description && (
                <div className="preview-detail description">
                  <p>{business.description}</p>
                </div>
              )}

              {business.opening_hours && business.opening_hours.length > 0 && (
                <div className="preview-detail hours">
                  <span className="detail-icon">🕐</span>
                  <div className="hours-list">
                    {business.opening_hours.slice(0, 3).map((hour, idx) => (
                      <div key={idx} className="hour-text">{hour}</div>
                    ))}
                    {business.opening_hours.length > 3 && (
                      <div className="hour-text">
                        +{business.opening_hours.length - 3} autres jours
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="business-preview-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onConfirm(business)}
              >
                {isSingleResult ? 'Confirmer et importer' : 'Sélectionner cette entreprise'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="confirmation-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
};

GoogleImportConfirmation.propTypes = {
  businesses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      address: PropTypes.string,
      city: PropTypes.string,
      postal_code: PropTypes.string,
      phone: PropTypes.string,
      website: PropTypes.string,
      description: PropTypes.string,
      rating_average: PropTypes.number,
      rating_count: PropTypes.number,
      opening_hours: PropTypes.arrayOf(PropTypes.string)
    })
  ).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default GoogleImportConfirmation;
