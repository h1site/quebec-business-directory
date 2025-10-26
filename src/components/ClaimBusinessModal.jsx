import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabaseClient';
import './ClaimBusinessModal.css';

const ClaimBusinessModal = ({ business, user, onClose, onSuccess }) => {
  const { t } = useTranslation();
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
        throw new Error(t('claim.errorAlreadyClaimed'));
      }

      // SECURITY: Check if user already has a pending claim for this business
      const { data: existingClaim, error: claimCheckError } = await supabase
        .from('business_claims')
        .select('id, status')
        .eq('business_id', business.id)
        .eq('user_id', user.id)
        .single();

      if (existingClaim && existingClaim.status === 'pending') {
        throw new Error(t('claim.errorPendingClaim'));
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
            <h2>{t('claim.title')}</h2>
            <p className="modal-subtitle">
              {t('claim.subtitle', { businessName: business.name })}
            </p>
            <p className="modal-subtitle" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {t('claim.verificationTime')}
            </p>

            <form onSubmit={handleManualVerification}>
              <div className="form-group">
                <label>{t('claim.nameLabel')} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('claim.namePlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('claim.emailLabel')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('claim.emailPlaceholder')}
                  required
                />
                <small>{t('claim.emailHelp')}</small>
              </div>

              <div className="form-group">
                <label>{t('claim.phoneLabel')} *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('claim.phonePlaceholder')}
                  required
                />
                <small>{t('claim.phoneHelp')}</small>
              </div>

              <div className="form-group">
                <label>{t('claim.reasonLabel')} *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder={t('claim.reasonPlaceholder')}
                  rows="4"
                  required
                />
                <small>{t('claim.reasonHelp')}</small>
              </div>

              <div className="verification-instructions">
                <p><strong>{t('claim.processTitle')}</strong></p>
                <ul>
                  <li>{t('claim.processList.sent')}</li>
                  <li>{t('claim.processList.email')}</li>
                  <li>{t('claim.processList.verify')}</li>
                  <li>{t('claim.processList.approved')}</li>
                </ul>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  {t('claim.btnCancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? t('claim.btnSubmitting') : t('claim.btnSubmit')}
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'pending' && (
          <div className="status-message pending">
            <div className="status-icon">✅</div>
            <h2>{t('claim.successTitle')}</h2>
            <p>{t('claim.successMessage')}</p>
            <p><strong>{t('claim.successVerification')}</strong></p>
            <p className="status-subtitle">{t('claim.successEmail')}</p>
          </div>
        )}

        {step === 'error' && (
          <div className="status-message error">
            <div className="status-icon">❌</div>
            <h2>{t('claim.errorTitle')}</h2>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => setStep('manual')}
            >
              {t('claim.btnRetry')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimBusinessModal;
