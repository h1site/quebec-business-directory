import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import './AdminClaims.css';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // all, pending, approved, rejected
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadClaims();
  }, [filter]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('business_claims')
        .select(`
          *,
          businesses:business_id (
            id,
            name,
            slug,
            city,
            website,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setClaims(data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claim) => {
    if (!confirm(`Approuver la réclamation de ${claim.user_email} pour ${claim.businesses.name}?`)) {
      return;
    }

    setProcessing(claim.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      // Update claim status
      const { error: claimError } = await supabase
        .from('business_claims')
        .update({
          status: 'approved',
          verified_at: new Date().toISOString(),
          verified_by: userId
        })
        .eq('id', claim.id);

      if (claimError) throw claimError;

      // Update business
      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          owner_id: claim.user_id,
          claimed_at: new Date().toISOString(),
          is_claimed: true
        })
        .eq('id', claim.business_id);

      if (businessError) throw businessError;

      // Send approval email to user
      try {
        await supabase.functions.invoke('send-claim-notification', {
          body: {
            type: 'claim_approved',
            claim: {
              id: claim.id,
              user_email: claim.user_email,
              user_name: claim.user_name,
              status: 'approved'
            },
            business: {
              name: claim.businesses.name,
              city: claim.businesses.city,
              slug: claim.businesses.slug
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      alert('Réclamation approuvée avec succès!');
      loadClaims();
    } catch (error) {
      console.error('Error approving claim:', error);
      alert('Erreur lors de l\'approbation: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClaim = async (claim) => {
    const reason = prompt(`Raison du refus pour ${claim.user_email}:`);
    if (!reason) return;

    setProcessing(claim.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      const { error } = await supabase
        .from('business_claims')
        .update({
          status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: userId,
          notes: reason
        })
        .eq('id', claim.id);

      if (error) throw error;

      // Send rejection email to user
      try {
        await supabase.functions.invoke('send-claim-notification', {
          body: {
            type: 'claim_rejected',
            claim: {
              id: claim.id,
              user_email: claim.user_email,
              user_name: claim.user_name,
              status: 'rejected',
              notes: reason
            },
            business: {
              name: claim.businesses.name,
              city: claim.businesses.city,
              slug: claim.businesses.slug
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }

      alert('Réclamation rejetée.');
      loadClaims();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      alert('Erreur lors du refus: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { className: 'status-pending', label: 'En attente' },
      approved: { className: 'status-approved', label: 'Approuvé' },
      rejected: { className: 'status-rejected', label: 'Rejeté' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const getVerificationMethodLabel = (method) => {
    const labels = {
      email_domain: '📧 Email domaine (auto)',
      google_business: '🔗 Google My Business',
      manual: '📝 Demande manuelle'
    };
    return labels[method] || method;
  };

  return (
    <div className="admin-claims-page">
      <div className="admin-header">
        <h1>Gestion des réclamations</h1>
        <Link to="/admin" className="btn btn-secondary">
          ← Retour au dashboard
        </Link>
      </div>

      <div className="claims-filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Toutes ({claims.length})
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          En attente
        </button>
        <button
          className={filter === 'approved' ? 'active' : ''}
          onClick={() => setFilter('approved')}
        >
          Approuvées
        </button>
        <button
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          Rejetées
        </button>
      </div>

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : claims.length === 0 ? (
        <div className="no-claims">
          <p>Aucune réclamation trouvée.</p>
        </div>
      ) : (
        <div className="claims-list">
          {claims.map((claim) => (
            <div key={claim.id} className="claim-card">
              <div className="claim-header">
                <div>
                  <h3>{claim.businesses.name}</h3>
                  <p className="claim-city">{claim.businesses.city}</p>
                </div>
                {getStatusBadge(claim.status)}
              </div>

              <div className="claim-details">
                <div className="detail-row">
                  <span className="label">Demandeur:</span>
                  <span className="value">
                    {claim.user_name || 'N/A'} ({claim.user_email})
                  </span>
                </div>

                {claim.user_phone && (
                  <div className="detail-row">
                    <span className="label">Téléphone:</span>
                    <span className="value">{claim.user_phone}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="label">Méthode:</span>
                  <span className="value">{getVerificationMethodLabel(claim.verification_method)}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">
                    {new Date(claim.claimed_at).toLocaleString('fr-CA')}
                  </span>
                </div>

                {claim.businesses.website && (
                  <div className="detail-row">
                    <span className="label">Site web:</span>
                    <span className="value">
                      <a href={claim.businesses.website} target="_blank" rel="noopener noreferrer">
                        {claim.businesses.website}
                      </a>
                    </span>
                  </div>
                )}

                {claim.businesses.phone && (
                  <div className="detail-row">
                    <span className="label">Tél. entreprise:</span>
                    <span className="value">{claim.businesses.phone}</span>
                  </div>
                )}

                {claim.verification_data?.message && (
                  <div className="detail-row">
                    <span className="label">Message:</span>
                    <div className="message-box">{claim.verification_data.message}</div>
                  </div>
                )}

                {claim.verification_data?.googleBusinessUrl && (
                  <div className="detail-row">
                    <span className="label">Google Business:</span>
                    <span className="value">
                      <a href={claim.verification_data.googleBusinessUrl} target="_blank" rel="noopener noreferrer">
                        Voir la fiche Google
                      </a>
                    </span>
                  </div>
                )}

                {claim.notes && (
                  <div className="detail-row">
                    <span className="label">Notes admin:</span>
                    <div className="message-box error">{claim.notes}</div>
                  </div>
                )}
              </div>

              {claim.status === 'pending' && (
                <div className="claim-actions">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleApproveClaim(claim)}
                    disabled={processing === claim.id}
                  >
                    {processing === claim.id ? 'Traitement...' : '✓ Approuver'}
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleRejectClaim(claim)}
                    disabled={processing === claim.id}
                  >
                    ✗ Rejeter
                  </button>
                  <Link
                    to={`/entreprise/${claim.businesses.slug}`}
                    className="btn btn-view"
                    target="_blank"
                  >
                    👁 Voir la fiche
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminClaims;
