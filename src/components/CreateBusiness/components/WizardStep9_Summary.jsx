import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const WizardStep9_Summary = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.terms_accepted) {
      newErrors.terms = 'Vous devez accepter les conditions pour soumettre';
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.terms_accepted, onValidationChange]);

  const handleTermsChange = (e) => {
    updateFormData({ terms_accepted: e.target.checked });
  };

  // Helper to display data or placeholder
  const displayValue = (value, placeholder = 'Non spécifié') => {
    return value || placeholder;
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Résumé et soumission</h2>
        <p className="step-description">
          Vérifiez vos informations avant de soumettre votre entreprise pour approbation
        </p>
      </div>

      <div className="step-content">
        <div className="summary-section">
          <h3 className="summary-section-title">📋 Informations de base</h3>
          <div className="summary-row">
            <span className="summary-label">Nom :</span>
            <span className="summary-value">{displayValue(formData.name)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Description :</span>
            <span className="summary-value">{displayValue(formData.description)}</span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">🏢 Détails</h3>
          <div className="summary-row">
            <span className="summary-label">Taille :</span>
            <span className="summary-value">{displayValue(formData.company_size)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Fondée en :</span>
            <span className="summary-value">{displayValue(formData.founded_year?.toString())}</span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">📸 Médias</h3>
          <div className="summary-row">
            <span className="summary-label">Logo :</span>
            <span className="summary-value">
              {formData.logo_preview ? '✓ Ajouté' : 'Non ajouté'}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Photos :</span>
            <span className="summary-value">
              {formData.images?.length > 0 ? `${formData.images.length} photo(s)` : 'Aucune photo'}
            </span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">📞 Contact</h3>
          <div className="summary-row">
            <span className="summary-label">Téléphone :</span>
            <span className="summary-value">{displayValue(formData.phone)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Email :</span>
            <span className="summary-value">{displayValue(formData.email)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Site web :</span>
            <span className="summary-value">{displayValue(formData.website)}</span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">📍 Localisation</h3>
          <div className="summary-row">
            <span className="summary-label">Adresse :</span>
            <span className="summary-value">
              {formData.address && formData.city
                ? `${formData.address}, ${formData.city}, ${formData.province} ${formData.postal_code}`
                : 'Non spécifiée'}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Coordonnées GPS :</span>
            <span className="summary-value">
              {formData.latitude && formData.longitude
                ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`
                : 'Non spécifiées'}
            </span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">🏷️ Catégorie et services</h3>
          <div className="summary-row">
            <span className="summary-label">Catégorie :</span>
            <span className="summary-value">{displayValue(formData.main_category_name)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Services :</span>
            <span className="summary-value">
              {formData.services?.length > 0
                ? formData.services.join(', ')
                : 'Aucun service spécifié'}
            </span>
          </div>
        </div>

        <div className="terms-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.terms_accepted || false}
              onChange={handleTermsChange}
              className="checkbox-input"
            />
            <span className="checkbox-text">
              J'accepte que mes informations soient vérifiées avant publication et je confirme que toutes les informations fournies sont exactes.
            </span>
          </label>
          {errors.terms && (
            <span className="error-message">{errors.terms}</span>
          )}
        </div>

        <div className="info-box">
          <div className="info-icon">⏳</div>
          <div className="info-content">
            <strong>Processus d'approbation</strong>
            <p>Votre entreprise sera examinée par notre équipe dans les 24-48 heures. Vous recevrez un email une fois qu'elle sera approuvée et publiée.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

WizardStep9_Summary.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep9_Summary;
