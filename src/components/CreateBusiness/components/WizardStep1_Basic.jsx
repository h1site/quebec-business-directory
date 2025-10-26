import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep1_Basic = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = t('wizard.step1.nameError');
    }

    if (!formData.description || formData.description.trim().length < 50) {
      newErrors.description = t('wizard.step1.descriptionError');
    } else if (formData.description.trim().length > 500) {
      newErrors.description = t('wizard.step1.descriptionErrorMax');
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.name, formData.description, onValidationChange, t]);

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
        <h2>{t('wizard.step1.title')}</h2>
        <p className="step-description">
          {t('wizard.step1.description')}
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="business-name" className="form-label required">
            {t('wizard.step1.nameLabel')}
          </label>
          <input
            id="business-name"
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={formData.name || ''}
            onChange={handleNameChange}
            placeholder={t('wizard.step1.namePlaceholder')}
            maxLength={100}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
          <span className="help-text">
            {t('wizard.step1.nameHelp')}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="business-description" className="form-label required">
            {t('wizard.step1.descriptionLabel')}
          </label>
          <textarea
            id="business-description"
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            value={formData.description || ''}
            onChange={handleDescriptionChange}
            placeholder={t('wizard.step1.descriptionPlaceholder')}
            rows={8}
          />
          <div className="textarea-footer">
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <span className={`char-counter ${descriptionRemaining < 50 ? 'warning' : ''}`}>
              {t('wizard.step1.charCount', { count: descriptionLength })}
              {descriptionLength < 50 && ` ${t('wizard.step1.charCountMin', { min: 50 - descriptionLength })}`}
            </span>
          </div>
          <span className="help-text">
            {t('wizard.step1.descriptionHelp')}
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
