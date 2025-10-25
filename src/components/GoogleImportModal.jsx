import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { importFromGoogle } from '../services/googleBusinessService.js';
import { getQuotaInfo, getQuotaStatusMessage, formatQuotaDisplay, isQuotaExceeded } from '../services/importQuotaService.js';
import GoogleImportConfirmation from './GoogleImportConfirmation.jsx';
import './GoogleImportModal.css';

const GoogleImportModal = ({ isOpen, onClose, onImport }) => {
  const [importType, setImportType] = useState('url'); // 'url' or 'search'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('input'); // 'input' or 'confirm'
  const [foundBusinesses, setFoundBusinesses] = useState([]);

  // Quota state
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(true);

  // For URL/Place ID import
  const [googleUrl, setGoogleUrl] = useState('');

  // For search import
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Fetch quota info when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchQuotaInfo();
    }
  }, [isOpen]);

  const fetchQuotaInfo = async () => {
    setQuotaLoading(true);
    try {
      const info = await getQuotaInfo(90);
      setQuotaInfo(info);
    } catch (error) {
      console.error('Failed to fetch quota:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let input, address, returnMultiple;

      if (importType === 'url') {
        if (!googleUrl.trim()) {
          throw new Error('Veuillez entrer une URL ou un Place ID');
        }
        input = googleUrl.trim();
        address = '';
        returnMultiple = false; // Direct URL/Place ID = single result
      } else {
        if (!businessName.trim()) {
          throw new Error('Veuillez entrer le nom de l\'entreprise');
        }
        input = businessName.trim();
        address = businessAddress.trim();
        returnMultiple = true; // Search query = potentially multiple results
      }

      // Fetch business data from Google
      const result = await importFromGoogle(input, address, returnMultiple);

      // Handle results
      if (Array.isArray(result)) {
        // Multiple results - show confirmation screen
        if (result.length === 0) {
          throw new Error('Aucune entreprise trouvée avec ces critères');
        }
        setFoundBusinesses(result);
        setStep('confirm');
      } else {
        // Single result - show confirmation screen
        setFoundBusinesses([result]);
        setStep('confirm');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'import');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async (selectedBusiness) => {
    try {
      setLoading(true);
      await onImport(selectedBusiness);
      // Refresh quota info after successful import
      await fetchQuotaInfo();
      handleClose();
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'import');
      setLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setStep('input');
    setFoundBusinesses([]);
    setError(null);
  };

  const handleClose = () => {
    setGoogleUrl('');
    setBusinessName('');
    setBusinessAddress('');
    setError(null);
    setImportType('url');
    setStep('input');
    setFoundBusinesses([]);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importer depuis Google Business</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="modal-body">
          {step === 'input' ? (
            <>
              <div className="import-type-selector">
                <button
                  className={`import-type-btn ${importType === 'url' ? 'active' : ''}`}
                  onClick={() => setImportType('url')}
                  type="button"
                >
                  URL / Place ID
                </button>
                <button
                  className={`import-type-btn ${importType === 'search' ? 'active' : ''}`}
                  onClick={() => setImportType('search')}
                  type="button"
                >
                  Recherche
                </button>
              </div>

              <form onSubmit={handleSubmit}>
            {importType === 'url' ? (
              <div className="form-section">
                <p className="help-text">
                  Collez l'URL de votre fiche Google Business ou votre Place ID
                </p>

                <div className="form-group">
                  <label htmlFor="googleUrl">URL ou Place ID Google</label>
                  <input
                    type="text"
                    id="googleUrl"
                    value={googleUrl}
                    onChange={(e) => setGoogleUrl(e.target.value)}
                    placeholder="https://maps.google.com/... ou ChIJ..."
                    className="form-input"
                  />
                </div>

                <div className="info-box">
                  <strong>Comment trouver votre URL?</strong>
                  <ol>
                    <li>Ouvrez Google Maps</li>
                    <li>Recherchez votre entreprise</li>
                    <li>Cliquez sur "Partager" ou copiez l'URL depuis la barre d'adresse</li>
                    <li>Collez l'URL ci-dessus</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="form-section">
                <p className="help-text">
                  Entrez le nom de votre entreprise et son adresse pour la rechercher sur Google
                </p>

                <div className="form-group">
                  <label htmlFor="businessName">
                    Nom de l'entreprise <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Restaurant Le Gourmet"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="businessAddress">Adresse (recommandé)</label>
                  <input
                    type="text"
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="123 Rue Principale, Montréal, QC"
                    className="form-input"
                  />
                  <small className="field-hint">
                    Ajouter l'adresse améliore la précision de la recherche
                  </small>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <strong>Erreur:</strong> {error}
              </div>
            )}

            {/* Quota Display */}
            {!quotaLoading && quotaInfo && (
              <div className={`quota-info quota-${getQuotaStatusMessage(quotaInfo).type}`}>
                <span className="quota-icon">{getQuotaStatusMessage(quotaInfo).icon}</span>
                <span className="quota-text">{getQuotaStatusMessage(quotaInfo).message}</span>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || quotaLoading || isQuotaExceeded(quotaInfo)}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    Rechercher
                    {!quotaLoading && quotaInfo && !quotaInfo.error && (
                      <span className="quota-badge">{formatQuotaDisplay(quotaInfo)}</span>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
            </>
          ) : (
            <GoogleImportConfirmation
              businesses={foundBusinesses}
              onConfirm={handleConfirmImport}
              onCancel={handleCancelConfirmation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

GoogleImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired
};

export default GoogleImportModal;
