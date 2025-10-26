import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep6_Geolocation = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    // Latitude and longitude are now optional
    if (formData.latitude && (formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = t('wizard.step6.latitudeErrorRange');
    }

    if (formData.longitude && (formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = t('wizard.step6.longitudeErrorRange');
    }

    setErrors(newErrors);
    // Always valid since fields are optional
    onValidationChange(true);
  }, [formData.latitude, formData.longitude, onValidationChange, t]);

  const handleLatitudeChange = (e) => {
    const value = e.target.value;
    updateFormData({ latitude: value === '' ? null : parseFloat(value) });
  };

  const handleLongitudeChange = (e) => {
    const value = e.target.value;
    updateFormData({ longitude: value === '' ? null : parseFloat(value) });
  };

  const geocodeAddress = async () => {
    const { address, city, province, postal_code } = formData;

    if (!address || !city) {
      alert(t('wizard.step6.addressRequired'));
      return;
    }

    const fullAddress = `${address}, ${city}, ${province}, Canada ${postal_code || ''}`;
    setIsGeocoding(true);

    try {
      // Nominatim API (OpenStreetMap) - 100% gratuit
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(fullAddress)}&` +
        `countrycodes=ca&` +
        `limit=1`,
        {
          headers: {
            'User-Agent': 'QuebecBusinessDirectory/1.0'
          }
        }
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const location = data[0];
        updateFormData({
          latitude: parseFloat(location.lat),
          longitude: parseFloat(location.lon)
        });
        alert(`✓ Coordonnées trouvées: ${location.lat}, ${location.lon}`);
      } else {
        alert(t('wizard.step6.geocodeError'));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert(t('wizard.step6.geocodeErrorGeneric'));
    } finally {
      setIsGeocoding(false);
    }
  };

  const openGoogleMaps = () => {
    const { address, city, province } = formData;
    if (!address || !city) {
      alert(t('wizard.step6.addressRequired'));
      return;
    }
    const fullAddress = `${address}, ${city}, ${province}, Canada`;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`, '_blank');
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step6.title')}</h2>
        <p className="step-description">
          {t('wizard.step6.description')}
        </p>
      </div>

      <div className="step-content">
        <div className="warning-box">
          <div className="warning-box-icon">⚠️</div>
          <div className="warning-box-content">
            <p className="warning-box-title">Coordonnées GPS optionnelles</p>
            <p className="warning-box-message">
              Si vous ne remplissez pas les coordonnées GPS, votre fiche n'aura pas de carte interactive.
              Il est fortement recommandé de les ajouter pour une meilleure visibilité.
            </p>
          </div>
        </div>

        <div className="info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <strong>{t('wizard.step6.infoTitle')}</strong>
            <ol>
              <li><strong>{t('wizard.step6.infoAuto')}</strong></li>
              <li><strong>{t('wizard.step6.infoManual')}</strong></li>
            </ol>
          </div>
        </div>

        <div className="button-group">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={geocodeAddress}
            disabled={isGeocoding}
          >
            {isGeocoding ? t('wizard.step6.btnAutoLoading') : t('wizard.step6.btnAuto')}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={openGoogleMaps}
          >
            {t('wizard.step6.btnMaps')}
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude" className="form-label">
              {t('wizard.step6.latitudeLabel')} <span className="optional">(optionnel)</span>
            </label>
            <input
              id="latitude"
              type="number"
              step="0.000001"
              className={`form-input ${errors.latitude ? 'error' : ''}`}
              value={formData.latitude ?? ''}
              onChange={handleLatitudeChange}
              placeholder={t('wizard.step6.latitudePlaceholder')}
            />
            {errors.latitude && <span className="error-message">{errors.latitude}</span>}
            <span className="help-text">
              {t('wizard.step6.latitudeHelp')}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="longitude" className="form-label">
              {t('wizard.step6.longitudeLabel')} <span className="optional">(optionnel)</span>
            </label>
            <input
              id="longitude"
              type="number"
              step="0.000001"
              className={`form-input ${errors.longitude ? 'error' : ''}`}
              value={formData.longitude ?? ''}
              onChange={handleLongitudeChange}
              placeholder={t('wizard.step6.longitudePlaceholder')}
            />
            {errors.longitude && <span className="error-message">{errors.longitude}</span>}
            <span className="help-text">
              {t('wizard.step6.longitudeHelp')}
            </span>
          </div>
        </div>

        {formData.latitude && formData.longitude && (
          <div className="success-box">
            <span className="success-icon">✓</span>
            {t('wizard.step6.successMessage', { lat: formData.latitude.toFixed(6), lon: formData.longitude.toFixed(6) })}
          </div>
        )}
      </div>
    </div>
  );
};

WizardStep6_Geolocation.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep6_Geolocation;
