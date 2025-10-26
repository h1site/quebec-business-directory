import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep2_Details = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  const companySizeOptions = [
    { value: '1-10', label: t('wizard.step2.sizeOptions.1-10') },
    { value: '11-50', label: t('wizard.step2.sizeOptions.11-50') },
    { value: '51-200', label: t('wizard.step2.sizeOptions.51-200') },
    { value: '201-500', label: t('wizard.step2.sizeOptions.201-500') },
    { value: '501+', label: t('wizard.step2.sizeOptions.501+') }
  ];

  const currentYear = new Date().getFullYear();
  const minYear = 1800;

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.company_size) {
      newErrors.company_size = t('wizard.step2.sizeError');
    }

    if (!formData.founded_year) {
      newErrors.founded_year = t('wizard.step2.foundedError');
    } else if (formData.founded_year < minYear || formData.founded_year > currentYear) {
      newErrors.founded_year = t('wizard.step2.foundedErrorRange', { min: minYear, max: currentYear });
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.company_size, formData.founded_year, onValidationChange, currentYear, t]);

  const handleCompanySizeChange = (e) => {
    updateFormData({ company_size: e.target.value });
  };

  const handleFoundedYearChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) || e.target.value === '') {
      updateFormData({ founded_year: e.target.value === '' ? '' : value });
    }
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step2.title')}</h2>
        <p className="step-description">
          {t('wizard.step2.description')}
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="company-size" className="form-label required">
            {t('wizard.step2.sizeLabel')}
          </label>
          <select
            id="company-size"
            className={`form-select ${errors.company_size ? 'error' : ''}`}
            value={formData.company_size || ''}
            onChange={handleCompanySizeChange}
          >
            <option value="">{t('wizard.step2.sizePlaceholder')}</option>
            {companySizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.company_size && (
            <span className="error-message">{errors.company_size}</span>
          )}
          <span className="help-text">
            {t('wizard.step2.sizeHelp')}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="founded-year" className="form-label required">
            {t('wizard.step2.foundedLabel')}
          </label>
          <input
            id="founded-year"
            type="number"
            className={`form-input ${errors.founded_year ? 'error' : ''}`}
            value={formData.founded_year || ''}
            onChange={handleFoundedYearChange}
            placeholder={currentYear.toString()}
            min={minYear}
            max={currentYear}
          />
          {errors.founded_year && (
            <span className="error-message">{errors.founded_year}</span>
          )}
          <span className="help-text">
            {t('wizard.step2.foundedHelp')}
          </span>
        </div>
      </div>
    </div>
  );
};

WizardStep2_Details.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep2_Details;
