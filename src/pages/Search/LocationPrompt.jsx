import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LocationPrompt.css';

const LocationPrompt = ({ onDetectLocation, onSkip }) => {
  const { t } = useTranslation();
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState(null);

  const handleDetect = async () => {
    setDetecting(true);
    setError(null);

    try {
      await onDetectLocation();
    } catch (err) {
      if (err.code === 1) {
        setError(t('search.locationErrorDenied'));
      } else if (err.code === 2) {
        setError(t('search.locationErrorUnavailable'));
      } else if (err.code === 3) {
        setError(t('search.locationErrorTimeout'));
      } else {
        setError(t('search.locationErrorGeneric'));
      }
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="location-prompt">
      <div className="location-prompt-icon">📍</div>
      <h2 className="location-prompt-title">{t('search.locationPromptTitle')}</h2>
      <p className="location-prompt-subtitle">
        {t('search.locationPromptSubtitle')}
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
              {t('search.detectingLocation')}
            </>
          ) : (
            <>
              <span className="location-icon">📍</span>
              {t('search.detectLocation')}
            </>
          )}
        </button>

        <button className="btn-skip-location" onClick={onSkip}>
          {t('search.useFiltersManually')}
        </button>
      </div>

      <p className="location-prompt-note">
        💡 {t('search.locationNote')}
      </p>
    </div>
  );
};

export default LocationPrompt;
