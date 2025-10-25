import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import GoogleImportModal from './GoogleImportModal.jsx';
import './ClaimBusinessModal.css';

const ClaimBusinessModal = ({ business, user, onClose, onSuccess }) => {
  const [step, setStep] = useState('select'); // select, google, manual, googleImport, success, error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGoogleImportModal, setShowGoogleImportModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    googleBusinessUrl: '',
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
          user_email: user.email,
          user_name: formData.name || user.user_metadata?.name,
          user_phone: formData.phone,
          verification_method: verificationMethod,
          verification_data: verificationData,
          status: 'pending' // Will be auto-approved by trigger if email domain matches
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-claim-notification', {
          body: {
            type: 'new_claim',
            claim: {
              id: claim.id,
              user_email: user.email,
              user_name: formData.name || user.user_metadata?.name,
              user_phone: formData.phone,
              verification_method: verificationMethod,
              status: claim.status
            },
            business: {
              name: business.name,
              city: business.city,
              slug: business.slug
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue anyway - don't block the claim process
      }

      // Check if auto-approved
      if (claim.status === 'approved') {
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      } else {
        setStep('pending');
        setTimeout(() => {
          onClose();
        }, 4000);
      }
    } catch (err) {
      console.error('Claim error:', err);
      setError(err.message || 'Une erreur est survenue');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleVerification = async (e) => {
    e.preventDefault();
    await submitClaim('google_business', {
      googleBusinessUrl: formData.googleBusinessUrl,
      message: formData.message
    });
  };

  const handleManualVerification = async (e) => {
    e.preventDefault();
    await submitClaim('manual', {
      message: formData.message
    });
  };

  const canAutoApprove = () => {
    if (!business.website || !user.email) return false;

    // Extract domain from email
    const emailDomain = user.email.split('@')[1]?.toLowerCase();

    // Extract domain from website
    let websiteDomain = business.website.toLowerCase();
    websiteDomain = websiteDomain.replace(/^https?:\/\//, '');
    websiteDomain = websiteDomain.replace(/^www\./, '');
    websiteDomain = websiteDomain.replace(/\/.*$/, '');

    return emailDomain === websiteDomain;
  };

  const handleGoogleImport = async (importedData) => {
    try {
      setLoading(true);
      setShowGoogleImportModal(false);

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

      // Insert claim with auto-approval since they have Google My Business access
      const { data: claim, error: claimError } = await supabase
        .from('business_claims')
        .insert({
          business_id: business.id,
          user_id: user.id,
          user_email: user.email,
          user_name: importedData.name || user.user_metadata?.name,
          user_phone: importedData.phone,
          verification_method: 'google_import',
          verification_data: {
            imported_from_google: true,
            google_place_id: importedData.google_place_id,
            name: importedData.name,
            phone: importedData.phone,
            address: importedData.address
          },
          status: 'approved' // Auto-approve for Google Business imports
        })
        .select()
        .single();

      if (claimError) throw claimError;

      // Update the business with is_claimed and owner_id
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          is_claimed: true,
          owner_id: user.id,
          claimed_at: new Date().toISOString()
        })
        .eq('id', business.id);

      if (updateError) throw updateError;

      // Send email notification to admin
      try {
        await supabase.functions.invoke('send-claim-notification', {
          body: {
            type: 'new_claim',
            claim: {
              id: claim.id,
              user_email: user.email,
              user_name: importedData.name || user.user_metadata?.name,
              user_phone: importedData.phone,
              verification_method: 'google_import',
              status: 'approved'
            },
            business: {
              name: business.name,
              city: business.city,
              slug: business.slug
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue anyway - don't block the claim process
      }

      setStep('googleSuccess');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Google import claim error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'import Google');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {step === 'select' && (
          <>
            <h2>Réclamer votre fiche</h2>
            <p className="modal-subtitle">
              Vous réclamez: <strong>{business.name}</strong>
            </p>

            {canAutoApprove() && (
              <div className="auto-approve-notice">
                <div className="notice-icon">✅</div>
                <div>
                  <strong>Approbation automatique disponible!</strong>
                  <p>Votre email ({user.email}) correspond au domaine du site web ({business.website})</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Votre réclamation sera approuvée instantanément.
                  </p>
                </div>
              </div>
            )}

            {!canAutoApprove() && business.website && user.email && (
              <div className="auto-approve-notice" style={{ background: 'linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%)', borderLeft: '4px solid #ffc107' }}>
                <div className="notice-icon">ℹ️</div>
                <div>
                  <strong>Vérification manuelle requise</strong>
                  <p>Votre email ({user.email.split('@')[1]}) ne correspond pas au domaine du site web ({business.website})</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Un administrateur vérifiera votre demande dans les 24-48h.
                  </p>
                </div>
              </div>
            )}

            <div className="verification-methods">
              <div className="method-card featured">
                <div className="method-icon">⚡</div>
                <div className="badge-instant">Approbation instantanée</div>
                <h3>Importer depuis Google</h3>
                <p>Si vous gérez cette entreprise sur Google My Business, importez vos données et réclamez instantanément</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowGoogleImportModal(true)}
                >
                  Importer depuis Google
                </button>
              </div>

              <div className="method-card">
                <div className="method-icon">🔗</div>
                <h3>Vérification Google My Business</h3>
                <p>Prouvez que vous gérez la fiche Google de cette entreprise</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep('google')}
                >
                  Continuer avec Google
                </button>
              </div>

              <div className="method-card">
                <div className="method-icon">📝</div>
                <h3>Demande manuelle</h3>
                <p>Un administrateur vérifiera votre demande manuellement</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep('manual')}
                >
                  Soumettre une demande
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'google' && (
          <>
            <h2>Vérification Google My Business</h2>
            <p className="modal-subtitle">
              Pour vérifier que vous gérez cette entreprise sur Google
            </p>

            <form onSubmit={handleGoogleVerification}>
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
                <label>Numéro de téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="514-555-1234"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Format: 514-555-1234"
                  required
                />
                <small>Format requis: 514-555-1234</small>
              </div>

              <div className="form-group">
                <label>URL de votre fiche Google My Business *</label>
                <input
                  type="url"
                  name="googleBusinessUrl"
                  value={formData.googleBusinessUrl}
                  onChange={handleInputChange}
                  placeholder="https://g.page/votre-entreprise"
                  required
                />
                <small>Trouvez votre URL sur Google Maps en cliquant "Partager" sur votre fiche</small>
              </div>

              <div className="form-group">
                <label>Instructions de vérification</label>
                <div className="verification-instructions">
                  <p>Pour prouver que vous gérez cette fiche Google:</p>
                  <ol>
                    <li>Connectez-vous à Google My Business</li>
                    <li>Modifiez temporairement votre description pour inclure: <strong>CODE-VERIFICATION-{business.id.slice(0, 8).toUpperCase()}</strong></li>
                    <li>Collez l'URL de votre fiche ci-dessus</li>
                    <li>Notre système vérifiera automatiquement dans les prochaines minutes</li>
                  </ol>
                </div>
              </div>

              <div className="form-group">
                <label>Message (optionnel)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Informations additionnelles..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('select')}
                >
                  Retour
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

        {step === 'manual' && (
          <>
            <h2>Demande manuelle</h2>
            <p className="modal-subtitle">
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
                <label>Numéro de téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="514-555-1234"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  title="Format: 514-555-1234"
                  required
                />
                <small>Format requis: 514-555-1234</small>
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
                <small>Décrivez votre lien avec l'entreprise et comment vous pouvez prouver votre identité</small>
              </div>

              <div className="verification-instructions">
                <p><strong>L'administrateur vous contactera par courriel:</strong></p>
                <ul>
                  <li>📧 <strong>info@h1site.com</strong></li>
                </ul>
                <p>Si nécessaire, nous pourrons vous contacter par téléphone au numéro fourni.</p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep('select')}
                >
                  Retour
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

        {step === 'success' && (
          <div className="status-message success">
            <div className="status-icon">🎉</div>
            <h2>Fiche réclamée avec succès!</h2>
            <p>Votre email correspond au domaine du site web.</p>
            <p><strong>Approbation automatique accordée!</strong></p>
            <p className="status-subtitle">Vous pouvez maintenant gérer cette fiche.</p>
          </div>
        )}

        {step === 'pending' && (
          <div className="status-message pending">
            <div className="status-icon">⏳</div>
            <h2>Demande envoyée!</h2>
            <p>Votre demande de réclamation a été soumise.</p>
            <p><strong>Un administrateur la vérifiera sous peu.</strong></p>
            <p className="status-subtitle">Vous recevrez un email dès qu'elle sera approuvée.</p>
          </div>
        )}

        {step === 'googleSuccess' && (
          <div className="status-message success">
            <div className="status-icon">🎉</div>
            <h2>Fiche réclamée avec succès!</h2>
            <p>Vous avez prouvé que vous gérez cette entreprise sur Google My Business.</p>
            <p><strong>Approbation automatique accordée!</strong></p>
            <p className="status-subtitle">Vous pouvez maintenant gérer cette fiche.</p>
          </div>
        )}

        {step === 'error' && (
          <div className="status-message error">
            <div className="status-icon">❌</div>
            <h2>Erreur</h2>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => setStep('select')}
            >
              Réessayer
            </button>
          </div>
        )}

        <GoogleImportModal
          isOpen={showGoogleImportModal}
          onClose={() => setShowGoogleImportModal(false)}
          onImport={handleGoogleImport}
        />
      </div>
    </div>
  );
};

export default ClaimBusinessModal;
