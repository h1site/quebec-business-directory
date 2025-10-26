import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep8_Services = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [newService, setNewService] = useState('');

  // Services are optional, so always valid
  useEffect(() => {
    onValidationChange(true);
  }, [onValidationChange]);

  const handleAddService = (e) => {
    e.preventDefault();

    const trimmed = newService.trim();
    if (!trimmed) return;

    if (trimmed.length < 2) {
      alert(t('wizard.step8.errorTooShort'));
      return;
    }

    if (trimmed.length > 50) {
      alert(t('wizard.step8.errorTooLong'));
      return;
    }

    const currentServices = formData.services || [];

    if (currentServices.includes(trimmed)) {
      alert(t('wizard.step8.errorDuplicate'));
      return;
    }

    if (currentServices.length >= 20) {
      alert(t('wizard.step8.errorMaxReached'));
      return;
    }

    updateFormData({
      services: [...currentServices, trimmed]
    });
    setNewService('');
  };

  const handleRemoveService = (index) => {
    const currentServices = [...(formData.services || [])];
    currentServices.splice(index, 1);
    updateFormData({ services: currentServices });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddService(e);
    }
  };

  const serviceCount = formData.services?.length || 0;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step8.title')}</h2>
        <p className="step-description">
          {t('wizard.step8.description')}
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="new-service" className="form-label">
            {t('wizard.step8.addLabel', { count: serviceCount, max: 20 })}
          </label>
          <div className="input-with-button">
            <input
              id="new-service"
              type="text"
              className="form-input"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('wizard.step8.addPlaceholder')}
              maxLength={50}
              disabled={serviceCount >= 20}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddService}
              disabled={!newService.trim() || serviceCount >= 20}
            >
              {t('wizard.step8.addButton')}
            </button>
          </div>
          <span className="help-text">
            {t('wizard.step8.addHelp')}
          </span>
        </div>

        {formData.services && formData.services.length > 0 ? (
          <div className="services-list">
            <h4 className="list-title">{t('wizard.step8.listTitle')}</h4>
            <div className="services-tags">
              {formData.services.map((service, index) => (
                <div key={index} className="service-tag">
                  <span>{service}</span>
                  <button
                    type="button"
                    className="remove-tag-btn"
                    onClick={() => handleRemoveService(index)}
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>{t('wizard.step8.emptyState')}</p>
          </div>
        )}

        <div className="info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <strong>{t('wizard.step8.examplesTitle')}</strong>
            <p>{t('wizard.step8.examplesText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

WizardStep8_Services.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep8_Services;
