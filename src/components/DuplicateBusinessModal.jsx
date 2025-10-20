import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './DuplicateBusinessModal.css';

const DuplicateBusinessModal = ({ matches, onClose, onClaimExisting, onCreateNew, businessData }) => {
  const [claiming, setClaiming] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const handleClaimBusiness = async (match) => {
    setClaiming(true);
    setSelectedMatch(match.id);

    try {
      // Auto-claim the existing business for the current user
      await onClaimExisting(match);
    } catch (error) {
      console.error('Error claiming business:', error);
      alert('Erreur lors de la réclamation: ' + error.message);
    } finally {
      setClaiming(false);
      setSelectedMatch(null);
    }
  };

  // Get the best match (highest confidence)
  const bestMatch = matches[0];
  const otherMatches = matches.slice(1);

  return (
    <div className="duplicate-modal-overlay" onClick={onClose}>
      <div className="duplicate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="duplicate-modal-header">
          <h2>🔍 Entreprise similaire détectée</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="duplicate-modal-body">
          <div className="alert alert-warning">
            <strong>⚠️ Doublon potentiel</strong>
            <p>
              Nous avons trouvé {matches.length} {matches.length === 1 ? 'entreprise existante' : 'entreprises existantes'} similaire
              {matches.length > 1 ? 's' : ''} à celle que vous essayez d'ajouter.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Pour éviter les doublons, veuillez vérifier s'il s'agit de votre entreprise.
            </p>
          </div>

          <div className="your-data">
            <h3>Entreprise que vous essayez d'ajouter:</h3>
            <div className="business-info">
              <div className="info-row">
                <strong>Nom:</strong> {businessData.name}
              </div>
              {businessData.address && (
                <div className="info-row">
                  <strong>Adresse:</strong> {businessData.address}, {businessData.city}
                </div>
              )}
              {businessData.phone && (
                <div className="info-row">
                  <strong>Téléphone:</strong> {businessData.phone}
                </div>
              )}
            </div>
          </div>

          {/* Best Match */}
          <div className="match-section">
            <h3>Meilleure correspondance trouvée:</h3>
            <div className={`match-card confidence-${bestMatch.confidence >= 90 ? 'high' : bestMatch.confidence >= 70 ? 'medium' : 'low'}`}>
              <div className="match-header">
                <div className="match-name">
                  <strong>{bestMatch.name}</strong>
                  {bestMatch.is_claimed && <span className="claimed-badge">✓ Réclamée</span>}
                  {bestMatch.data_source === 'req' && <span className="source-badge">REQ</span>}
                </div>
                <div className="confidence-score">
                  {bestMatch.confidence}% similaire
                </div>
              </div>

              <div className="match-details">
                <div className="detail-item">
                  <span className="detail-label">Raison:</span>
                  <span className="detail-value">{bestMatch.matchReason}</span>
                </div>
                {bestMatch.address && (
                  <div className="detail-item">
                    <span className="detail-label">Adresse:</span>
                    <span className="detail-value">{bestMatch.address}, {bestMatch.city}</span>
                  </div>
                )}
                {bestMatch.phone && (
                  <div className="detail-item">
                    <span className="detail-label">Téléphone:</span>
                    <span className="detail-value">{bestMatch.phone}</span>
                  </div>
                )}
              </div>

              <div className="match-actions">
                <Link
                  to={`/entreprise/${bestMatch.slug}`}
                  target="_blank"
                  className="btn btn-secondary"
                >
                  👁 Voir la fiche
                </Link>
                {!bestMatch.is_claimed && (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleClaimBusiness(bestMatch)}
                    disabled={claiming && selectedMatch === bestMatch.id}
                  >
                    {claiming && selectedMatch === bestMatch.id ? 'Réclamation...' : '📋 Réclamer cette fiche'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Other Matches */}
          {otherMatches.length > 0 && (
            <div className="other-matches">
              <h4>Autres correspondances possibles:</h4>
              {otherMatches.map((match) => (
                <div key={match.id} className="match-card-compact">
                  <div className="match-compact-header">
                    <strong>{match.name}</strong>
                    <span className="confidence-compact">{match.confidence}%</span>
                  </div>
                  <div className="match-compact-details">
                    {match.city} • {match.matchReason}
                  </div>
                  <div className="match-compact-actions">
                    <Link to={`/entreprise/${match.slug}`} target="_blank" className="link-view">
                      Voir la fiche →
                    </Link>
                    {!match.is_claimed && (
                      <button
                        className="btn-claim-small"
                        onClick={() => handleClaimBusiness(match)}
                        disabled={claiming && selectedMatch === match.id}
                      >
                        {claiming && selectedMatch === match.id ? 'Réclamation...' : 'Réclamer'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action to create new anyway */}
          <div className="create-new-section">
            <p className="help-text">
              Si aucune de ces fiches ne correspond à votre entreprise, vous pouvez créer une nouvelle fiche.
            </p>
            <button className="btn btn-create-new" onClick={onCreateNew}>
              ➕ Non, créer une nouvelle fiche
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateBusinessModal;
