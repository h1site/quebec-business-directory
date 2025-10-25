import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const WizardStep6_Geolocation = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.latitude && formData.latitude !== 0) {
      newErrors.latitude = 'La latitude est requise';
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      newErrors.latitude = 'La latitude doit être entre -90 et 90';
    }

    if (!formData.longitude && formData.longitude !== 0) {
      newErrors.longitude = 'La longitude est requise';
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      newErrors.longitude = 'La longitude doit être entre -180 et 180';
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.latitude, formData.longitude, onValidationChange]);

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
      alert('Veuillez d\'abord remplir l\'adresse et la ville (étape précédente)');
      return;
    }

    const fullAddress = `${address}, ${city}, ${province}, Canada ${postal_code}`;
    setIsGeocoding(true);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        updateFormData({
          latitude: location.lat,
          longitude: location.lng
        });
      } else {
        alert('Impossible de trouver les coordonnées pour cette adresse. Veuillez les entrer manuellement.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Erreur lors de la recherche des coordonnées. Veuillez les entrer manuellement.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const openGoogleMaps = () => {
    const { address, city, province } = formData;
    if (!address || !city) {
      alert('Veuillez d\'abord remplir l\'adresse et la ville (étape précédente)');
      return;
    }
    const fullAddress = `${address}, ${city}, ${province}, Canada`;
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`, '_blank');
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Géolocalisation</h2>
        <p className="step-description">
          Coordonnées GPS pour localiser précisément votre entreprise
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <strong>Comment obtenir vos coordonnées ?</strong>
            <ol>
              <li><strong>Automatiquement</strong> : Cliquez sur "Obtenir automatiquement" pour utiliser votre adresse</li>
              <li><strong>Manuellement</strong> : Cherchez votre entreprise sur Google Maps, cliquez droit sur l'emplacement et sélectionnez les coordonnées qui apparaissent</li>
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
            {isGeocoding ? '⏳ Recherche en cours...' : '🎯 Obtenir automatiquement'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={openGoogleMaps}
          >
            🗺️ Ouvrir Google Maps
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude" className="form-label required">
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              step="0.000001"
              className={`form-input ${errors.latitude ? 'error' : ''}`}
              value={formData.latitude ?? ''}
              onChange={handleLatitudeChange}
              placeholder="45.5017"
            />
            {errors.latitude && <span className="error-message">{errors.latitude}</span>}
            <span className="help-text">
              Entre -90 et 90
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="longitude" className="form-label required">
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              step="0.000001"
              className={`form-input ${errors.longitude ? 'error' : ''}`}
              value={formData.longitude ?? ''}
              onChange={handleLongitudeChange}
              placeholder="-73.5673"
            />
            {errors.longitude && <span className="error-message">{errors.longitude}</span>}
            <span className="help-text">
              Entre -180 et 180
            </span>
          </div>
        </div>

        {formData.latitude && formData.longitude && (
          <div className="success-box">
            <span className="success-icon">✓</span>
            Coordonnées enregistrées : {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
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
