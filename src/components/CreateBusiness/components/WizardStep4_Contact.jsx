import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep4_Contact = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    // At least one contact method is required
    const hasPhone = formData.phone && formData.phone.trim().length > 0;
    const hasEmail = formData.email && formData.email.trim().length > 0;
    const hasWebsite = formData.website && formData.website.trim().length > 0;

    if (!hasPhone && !hasEmail && !hasWebsite) {
      newErrors.contact = t('wizard.step4.contactError');
    }

    // Validate phone format if provided
    if (hasPhone) {
      const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = t('wizard.step4.phoneError');
      }
    }

    // Validate email format if provided
    if (hasEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('wizard.step4.emailError');
      }
    }

    // Validate website format if provided
    if (hasWebsite) {
      const websiteRegex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
      if (!websiteRegex.test(formData.website)) {
        newErrors.website = t('wizard.step4.websiteError');
      }
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.phone, formData.email, formData.website, onValidationChange, t]);

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
        <h2>{t('wizard.step4.title')}</h2>
        <p className="step-description">
          {t('wizard.step4.description')}
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
            {t('wizard.step4.phoneLabel')}
          </label>
          <input
            id="phone"
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={formData.phone || ''}
            onChange={handlePhoneChange}
            placeholder={t('wizard.step4.phonePlaceholder')}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
          <span className="help-text">
            {t('wizard.step4.phoneHelp')}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            {t('wizard.step4.emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={formData.email || ''}
            onChange={handleEmailChange}
            placeholder={t('wizard.step4.emailPlaceholder')}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
          <span className="help-text">
            {t('wizard.step4.emailHelp')}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="website" className="form-label">
            {t('wizard.step4.websiteLabel')}
          </label>
          <input
            id="website"
            type="url"
            className={`form-input ${errors.website ? 'error' : ''}`}
            value={formData.website || ''}
            onChange={handleWebsiteChange}
            placeholder={t('wizard.step4.websitePlaceholder')}
          />
          {errors.website && <span className="error-message">{errors.website}</span>}
          <span className="help-text">
            {t('wizard.step4.websiteHelp')}
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
