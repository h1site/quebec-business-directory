import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './CookieConsent.css';

const CookieConsent = () => {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté les cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-content">
          <div className="cookie-icon">🍪</div>
          <div className="cookie-text">
            {i18n.language === 'fr' ? (
              <>
                <h3>🍪 Cookies essentiels</h3>
                <p>
                  Ce site utilise uniquement des <strong>cookies strictement nécessaires</strong> à son fonctionnement
                  (authentification, préférences de langue, session).
                </p>
                <p className="cookie-details">
                  Aucun cookie publicitaire ou de tracking.{' '}
                  <Link to="/politique-confidentialite" className="cookie-link">En savoir plus</Link>
                </p>
              </>
            ) : (
              <>
                <h3>🍪 Essential Cookies</h3>
                <p>
                  This site only uses <strong>strictly necessary cookies</strong> for its operation
                  (authentication, language preferences, session).
                </p>
                <p className="cookie-details">
                  No advertising or tracking cookies.{' '}
                  <Link to="/privacy-policy" className="cookie-link">Learn more</Link>
                </p>
              </>
            )}
          </div>
        </div>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="btn-accept">
            {i18n.language === 'fr' ? 'J\'ai compris' : 'I Understand'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
