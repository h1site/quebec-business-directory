import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import './ClaimBusinessModal.css';

const ClaimBusinessModal = ({ business, user, onClose, onSuccess }) => {
  const [step, setStep] = useState('manual'); // manual, success, error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const submitClaim = async (verificationMethod, verificationData = {}) => {
    setLoading(true);
    setError(null);

    try {
      // SECURITY: Check if business is already claimed by someone else
      const { data: existingBusiness, error: checkError } = await supabase
        .from('businesses')
        .select('is_claimed, owner_id')
        .eq('id', business.id)
        .single();

      if (checkError) throw checkError;

      if (existingBusiness?.is_claimed && existingBusiness?.owner_id !== user.id) {
        throw new Error('Cette entreprise a déjà été réclamée par un autre utilisateur.');
      }

      // SECURITY: Check if user already has a pending claim for this business
      const { data: existingClaim, error: claimCheckError } = await supabase
        .from('business_claims')
        .select('id, status')
        .eq('business_id', business.id)
        .eq('user_id', user.id)
        .single();

      if (existingClaim && existingClaim.status === 'pending') {
        throw new Error('Vous avez déjà une demande en attente pour cette entreprise.');
      }

      // Insert claim
      const { data: claim, error: claimError } = await supabase
        .from('business_claims')
        .insert({
          business_id: business.id,
          user_id: user.id,
          claimant_email: formData.email,
          claimant_name: formData.name,
          claimant_phone: formData.phone,
          verification_method: verificationMethod,
          verification_data: verificationData,
          admin_notes: formData.message,
          status: 'pending'
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Always show pending status
      setStep('pending');
      setTimeout(() => {
        onClose();
      }, 4000);
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Une erreur est survenue');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();
    await submitClaim('manual', {
      message: formData.message
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {step === 'manual' && (
          <>
            <h2>Réclamer votre fiche</h2>
            <p className="modal-subtitle">
              Vous réclamez: <strong>{business.name}</strong>
            </p>
            <p className="modal-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Un administrateur vérifiera votre demande dans les 24-48h
            </p>

            <form onSubmit={handleManualVerification}>
              <div className="form-group">
                <label>Votre nom complet *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jean Tremblay"
                  required
                />
              </div>

              <div className="form-group">
                <label>Votre courriel *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean.tremblay@exemple.com"
                  required
                />
                <small>Utilisé pour vous contacter et approuver votre demande</small>
              </div>

              <div className="form-group">
                <label>Numéro de téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="514-555-1234"
                  required
                />
                <small>Format recommandé: 514-555-1234</small>
              </div>

              <div className="form-group">
                <label>Pourquoi réclamez-vous cette fiche? *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Ex: Je suis le propriétaire de cette entreprise depuis 2015..."
                  rows="4"
                  required
                />
                <small>Décrivez votre lien avec l'entreprise</small>
              </div>

              <div className="verification-instructions">
                <p><strong>Processus de vérification:</strong></p>
                <ul>
                  <li>✅ Votre demande sera envoyée à l'administrateur</li>
                  <li>📧 Vous recevrez un email de confirmation</li>
                  <li>👤 L'admin vous contactera pour vérifier votre identité</li>
                  <li>🎉 Une fois approuvée, la fiche apparaîtra dans "Mes entreprises"</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'pending' && (
          <div className="status-message pending">
            <div className="status-icon">✅</div>
            <h2>Demande envoyée!</h2>
            <p>Votre demande de réclamation a été soumise avec succès.</p>
            <p><strong>Un administrateur vérifiera votre demande dans les 24-48h.</strong></p>
            <p className="status-subtitle">Vous recevrez un email dès qu'elle sera approuvée. Une fois approuvée, la fiche apparaîtra dans "Mes entreprises".</p>
          </div>
        )}

        {step === 'error' && (
          <div className="status-message error">
            <div className="status-icon">❌</div>
            <h2>Erreur</h2>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => setStep('manual')}
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimBusinessModal;
