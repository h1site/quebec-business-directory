import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const WizardStep8_Services = ({ formData, updateFormData, onValidationChange }) => {
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
      alert('Le service doit contenir au moins 2 caractères');
      return;
    }

    if (trimmed.length > 50) {
      alert('Le service ne peut pas dépasser 50 caractères');
      return;
    }

    const currentServices = formData.services || [];

    if (currentServices.includes(trimmed)) {
      alert('Ce service existe déjà');
      return;
    }

    if (currentServices.length >= 20) {
      alert('Vous ne pouvez pas ajouter plus de 20 services');
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
        <h2>Services</h2>
        <p className="step-description">
          Quels services offrez-vous ? (Optionnel - maximum 20)
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="new-service" className="form-label">
            Ajouter un service ({serviceCount}/20)
          </label>
          <div className="input-with-button">
            <input
              id="new-service"
              type="text"
              className="form-input"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Consultation gratuite, Livraison à domicile..."
              maxLength={50}
              disabled={serviceCount >= 20}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddService}
              disabled={!newService.trim() || serviceCount >= 20}
            >
              ➕ Ajouter
            </button>
          </div>
          <span className="help-text">
            Appuyez sur Entrée ou cliquez sur Ajouter
          </span>
        </div>

        {formData.services && formData.services.length > 0 ? (
          <div className="services-list">
            <h4 className="list-title">Services ajoutés</h4>
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
            <p>Aucun service ajouté. Vous pouvez en ajouter pour mieux décrire vos offres.</p>
          </div>
        )}

        <div className="info-box">
          <div className="info-icon">💡</div>
          <div className="info-content">
            <strong>Exemples de services :</strong>
            <p>Livraison gratuite, Consultation en ligne, Service 24/7, Garantie satisfaction, Estimation gratuite, etc.</p>
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
