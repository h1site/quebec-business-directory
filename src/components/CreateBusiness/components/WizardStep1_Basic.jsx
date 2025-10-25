import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const WizardStep1_Basic = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.description || formData.description.trim().length < 50) {
      newErrors.description = 'La description doit contenir au moins 50 caractères';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.name, formData.description, onValidationChange]);

  const handleNameChange = (e) => {
    updateFormData({ name: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      updateFormData({ description: value });
    }
  };

  const descriptionLength = formData.description?.length || 0;
  const descriptionRemaining = 500 - descriptionLength;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Informations de base</h2>
        <p className="step-description">
          Commencez par les informations essentielles de votre entreprise
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="business-name" className="form-label required">
            Nom de l'entreprise
          </label>
          <input
            id="business-name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={formData.name || ''}
            onChange={handleNameChange}
            placeholder="Ex: Restaurant Le Gourmet"
            maxLength={100}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
          <span className="help-text">
            Le nom complet de votre entreprise tel qu'il apparaîtra sur votre profil
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="business-description" className="form-label required">
            Description
          </label>
          <textarea
            id="business-description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            value={formData.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Décrivez votre entreprise, vos services, ce qui vous rend unique..."
            rows={8}
          />
          <div className="textarea-footer">
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <span className={`char-counter ${descriptionRemaining < 50 ? 'warning' : ''}`}>
              {descriptionLength}/500 caractères
              {descriptionLength < 50 && ` (minimum ${50 - descriptionLength} de plus)`}
            </span>
          </div>
          <span className="help-text">
            Une bonne description aide les clients à comprendre votre entreprise et ce que vous offrez
          </span>
        </div>
      </div>
    </div>
  );
};

WizardStep1_Basic.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep1_Basic;
