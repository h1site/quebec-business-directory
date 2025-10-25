import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const companySizeOptions = [
  { value: '1-10', label: '1-10 employés' },
  { value: '11-50', label: '11-50 employés' },
  { value: '51-200', label: '51-200 employés' },
  { value: '201-500', label: '201-500 employés' },
  { value: '501+', label: '501+ employés' }
];

const WizardStep2_Details = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});

  const currentYear = new Date().getFullYear();
  const minYear = 1800;

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.company_size) {
      newErrors.company_size = 'Veuillez sélectionner la taille de l\'entreprise';
    }

    if (!formData.founded_year) {
      newErrors.founded_year = 'Veuillez entrer l\'année de fondation';
    } else if (formData.founded_year < minYear || formData.founded_year > currentYear) {
      newErrors.founded_year = `L'année doit être entre ${minYear} et ${currentYear}`;
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.company_size, formData.founded_year, onValidationChange, currentYear]);

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
        <h2>Détails de l'entreprise</h2>
        <p className="step-description">
          Informations complémentaires sur votre entreprise
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="company-size" className="form-label required">
            Taille de l'entreprise
          </label>
          <select
            id="company-size"
            className={`form-select ${errors.company_size ? 'error' : ''}`}
            value={formData.company_size || ''}
            onChange={handleCompanySizeChange}
          >
            <option value="">Sélectionnez la taille</option>
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
            Nombre approximatif d'employés dans votre entreprise
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="founded-year" className="form-label required">
            Année de fondation
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
            L'année de création de votre entreprise
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
