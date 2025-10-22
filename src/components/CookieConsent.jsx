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

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
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
                <h3>Utilisation des cookies</h3>
                <p>
                  Nous utilisons des cookies essentiels pour assurer le bon fonctionnement du site
                  et améliorer votre expérience. Nous n'utilisons pas de cookies publicitaires ou de tracking.
                </p>
                <p className="cookie-details">
                  En continuant, vous acceptez notre utilisation des cookies.
                  Consultez notre <Link to="/mentions-legales" className="cookie-link">politique de confidentialité</Link> pour plus d'informations.
                </p>
              </>
            ) : (
              <>
                <h3>Cookie Usage</h3>
                <p>
                  We use essential cookies to ensure the proper functioning of the site
                  and improve your experience. We do not use advertising or tracking cookies.
                </p>
                <p className="cookie-details">
                  By continuing, you accept our use of cookies.
                  View our <Link to="/legal-notice" className="cookie-link">privacy policy</Link> for more information.
                </p>
              </>
            )}
          </div>
        </div>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="btn-accept">
            {i18n.language === 'fr' ? 'Accepter' : 'Accept'}
          </button>
          <button onClick={handleDecline} className="btn-decline">
            {i18n.language === 'fr' ? 'Refuser' : 'Decline'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
