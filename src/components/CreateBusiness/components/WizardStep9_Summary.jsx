import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep9_Summary = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.terms_accepted) {
      newErrors.terms = t('wizard.step9.termsError');
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.terms_accepted, onValidationChange, t]);

  const handleTermsChange = (e) => {
    updateFormData({ terms_accepted: e.target.checked });
  };

  // Helper to display data or placeholder
  const displayValue = (value) => {
    return value || t('wizard.step9.valueNotSpecified');
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step9.title')}</h2>
        <p className="step-description">
          {t('wizard.step9.description')}
        </p>
      </div>

      <div className="step-content">
        <div className="summary-section">
          <h3 className="summary-section-title">{t('wizard.step9.sectionBasic')}</h3>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelName')}</span>
            <span className="summary-value">{displayValue(formData.name)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelDescription')}</span>
            <span className="summary-value">{displayValue(formData.description)}</span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">{t('wizard.step9.sectionMedia')}</h3>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelLogo')}</span>
            <span className="summary-value">
              {formData.logo_preview ? t('wizard.step9.valueLogoAdded') : t('wizard.step9.valueLogoNotAdded')}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelPhotos')}</span>
            <span className="summary-value">
              {formData.images?.length > 0 ? t('wizard.step9.valuePhotosCount', { count: formData.images.length }) : t('wizard.step9.valuePhotosNone')}
            </span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">{t('wizard.step9.sectionContact')}</h3>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelPhone')}</span>
            <span className="summary-value">{displayValue(formData.phone)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelEmail')}</span>
            <span className="summary-value">{displayValue(formData.email)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelWebsite')}</span>
            <span className="summary-value">{displayValue(formData.website)}</span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">{t('wizard.step9.sectionLocation')}</h3>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelAddress')}</span>
            <span className="summary-value">
              {formData.address && formData.city
                ? `${formData.address}, ${formData.city}, ${formData.province} ${formData.postal_code}`
                : t('wizard.step9.valueNotSpecified')}
            </span>
          </div>
        </div>

        <div className="summary-section">
          <h3 className="summary-section-title">{t('wizard.step9.sectionCategory')}</h3>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelCategory')}</span>
            <span className="summary-value">{displayValue(formData.main_category_name)}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">{t('wizard.step9.labelServices')}</span>
            <span className="summary-value">
              {formData.services?.length > 0
                ? formData.services.join(', ')
                : t('wizard.step9.valueServicesNone')}
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
              {t('wizard.step9.termsText')}
            </span>
          </label>
          {errors.terms && (
            <span className="error-message">{errors.terms}</span>
          )}
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
