import { useState } from 'react';
import GoogleMyBusinessClaim from './GoogleMyBusinessClaim';
import './ClaimBusinessModal.css';

const ClaimBusinessModalSimple = ({ business, user, onClose, onSuccess }) => {
  const [showGMBClaim, setShowGMBClaim] = useState(false);

  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <div className="modal-body">
            <h2>Connexion requise</h2>
            <p>Vous devez être connecté pour réclamer cette entreprise.</p>
            <button className="btn-primary" onClick={() => window.location.href = '/connexion'}>
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showGMBClaim) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <GoogleMyBusinessClaim
            business={business}
            onSuccess={() => {
              if (onSuccess) {
                onSuccess();
              }
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-body">
          <div className="claim-header">
            <h2>Réclamer cette entreprise</h2>
            <p className="claim-subtitle">{business.name}</p>
            <p className="claim-location">{business.city}, {business.province}</p>
          </div>

          <div className="claim-description">
            <p>
              Pour vérifier que vous êtes bien le propriétaire ou un représentant autorisé de cette entreprise,
              nous utilisons Google My Business pour une vérification sécurisée et instantanée.
            </p>
          </div>

          <div className="claim-benefits">
            <h3>Avantages de réclamer votre fiche:</h3>
            <ul>
              <li>✓ Modifier et mettre à jour vos informations</li>
              <li>✓ Ajouter des photos et description</li>
              <li>✓ Répondre aux avis clients</li>
              <li>✓ Voir les statistiques de votre fiche</li>
              <li>✓ Améliorer votre visibilité en ligne</li>
            </ul>
          </div>

          <div className="claim-actions">
            <button
              className="btn-google-claim"
              onClick={() => setShowGMBClaim(true)}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Réclamer avec Google My Business
            </button>

            <button className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
          </div>

          <div className="claim-notice">
            <p className="notice-text">
              <strong>Note:</strong> Vous devez avoir accès au profil Google My Business de cette entreprise
              pour compléter la vérification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimBusinessModalSimple;
