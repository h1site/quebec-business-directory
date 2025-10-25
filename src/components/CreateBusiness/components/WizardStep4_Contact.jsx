import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const WizardStep4_Contact = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    // At least one contact method is required
    const hasPhone = formData.phone && formData.phone.trim().length > 0;
    const hasEmail = formData.email && formData.email.trim().length > 0;
    const hasWebsite = formData.website && formData.website.trim().length > 0;

    if (!hasPhone && !hasEmail && !hasWebsite) {
      newErrors.contact = 'Au moins un moyen de contact est requis (téléphone, email ou site web)';
    }

    // Validate phone format if provided
    if (hasPhone) {
      const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Format de téléphone invalide (ex: 514-555-1234)';
      }
    }

    // Validate email format if provided
    if (hasEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Adresse email invalide';
      }
    }

    // Validate website format if provided
    if (hasWebsite) {
      const websiteRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
      if (!websiteRegex.test(formData.website)) {
        newErrors.website = 'URL du site web invalide';
      }
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.phone, formData.email, formData.website, onValidationChange]);

  const handlePhoneChange = (e) => {
    updateFormData({ phone: e.target.value });
  };

  const handleEmailChange = (e) => {
    updateFormData({ email: e.target.value });
  };

  const handleWebsiteChange = (e) => {
    updateFormData({ website: e.target.value });
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Informations de contact</h2>
        <p className="step-description">
          Comment les clients peuvent-ils vous joindre ? (Au moins un moyen requis)
        </p>
      </div>

      <div className="step-content">
        {errors.contact && (
          <div className="alert alert-warning">
            <span className="alert-icon">⚠️</span>
            {errors.contact}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            📞 Numéro de téléphone
          </label>
          <input
            id="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={formData.phone || ''}
            onChange={handlePhoneChange}
            placeholder="514-555-1234"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
          <span className="help-text">
            Format recommandé: XXX-XXX-XXXX
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            ✉️ Adresse email
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email || ''}
            onChange={handleEmailChange}
            placeholder="contact@entreprise.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
          <span className="help-text">
            Email de contact pour votre entreprise
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="website" className="form-label">
            🌐 Site web
          </label>
          <input
            id="website"
            type="url"
            className={`form-input ${errors.website ? 'error' : ''}`}
            value={formData.website || ''}
            onChange={handleWebsiteChange}
            placeholder="https://www.votre-entreprise.com"
          />
          {errors.website && <span className="error-message">{errors.website}</span>}
          <span className="help-text">
            URL complète de votre site web (incluant https://)
          </span>
        </div>
      </div>
    </div>
  );
};

WizardStep4_Contact.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep4_Contact;
