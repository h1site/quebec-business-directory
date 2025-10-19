import { useState } from 'react';
import './LocationPrompt.css';

const LocationPrompt = ({ onDetectLocation, onSkip }) => {
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  const handleDetect = async () => {
    setDetecting(true);
    setError(null);

    try {
      await onDetectLocation();
    } catch (err) {
      if (err.code === 1) {
        setError('Vous avez refusé l\'accès à votre position. Vous pouvez toujours sélectionner votre région manuellement.');
      } else if (err.code === 2) {
        setError('Impossible de déterminer votre position. Veuillez sélectionner votre région manuellement.');
      } else if (err.code === 3) {
        setError('La demande de localisation a expiré. Veuillez réessayer.');
      } else {
        setError('Erreur lors de la détection de votre position. Veuillez sélectionner votre région manuellement.');
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="location-prompt">
      <div className="location-prompt-icon">📍</div>
      <h2 className="location-prompt-title">Découvrez les entreprises près de vous</h2>
      <p className="location-prompt-subtitle">
        Permettez-nous de détecter votre position pour afficher les entreprises de votre région automatiquement.
      </p>

      {error && (
        <div className="location-prompt-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      <div className="location-prompt-actions">
        <button
          className="btn-detect-location"
          onClick={handleDetect}
          disabled={detecting}
        >
          {detecting ? (
            <>
              <span className="spinner-small"></span>
              Détection en cours...
            </>
          ) : (
            <>
              <span className="location-icon">📍</span>
              Détecter ma position
            </>
          )}
        </button>

        <button className="btn-skip-location" onClick={onSkip}>
          Utiliser les filtres manuellement
        </button>
      </div>

      <p className="location-prompt-note">
        💡 Vous pouvez aussi utiliser les filtres à gauche pour rechercher par région, ville ou catégorie.
      </p>
    </div>
  );
};

export default LocationPrompt;
