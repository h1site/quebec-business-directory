import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const ClaimGMBCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the access token from Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
          throw new Error('Aucune session trouvée. Veuillez vous reconnecter.');
        }

        // The access token is in session.provider_token
        const accessToken = session.provider_token;

        if (!accessToken) {
          throw new Error('Token d\'accès Google non trouvé.');
        }

        // Store in localStorage for the GMB component to use
        localStorage.setItem('gmb_access_token', accessToken);
        localStorage.setItem('gmb_token_expiry', Date.now() + (3600 * 1000)); // 1 hour

        setStatus('success');

        // Redirect back to the business page or claim page
        const businessSlug = localStorage.getItem('claim_business_slug');

        setTimeout(() => {
          if (businessSlug) {
            localStorage.removeItem('claim_business_slug');
            navigate(`/entreprise/${businessSlug}?claim=gmb`);
          } else {
            navigate('/');
          }
        }, 1000);

      } catch (err) {
        console.error('Callback error:', err);
        setError(err.message);
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7fafc',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        {status === 'processing' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 1.5rem',
              border: '4px solid #e2e8f0',
              borderTopColor: '#4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>
              {`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
            <h2 style={{ color: '#1a202c', marginBottom: '0.5rem' }}>
              Connexion à Google My Business...
            </h2>
            <p style={{ color: '#718096', margin: 0 }}>
              Veuillez patienter pendant que nous vérifions votre compte.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>
              Connexion réussie!
            </h2>
            <p style={{ color: '#718096', margin: 0 }}>
              Redirection en cours...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>
              Erreur de connexion
            </h2>
            <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
              {error || 'Une erreur est survenue lors de la connexion.'}
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                background: '#0f4c81',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ClaimGMBCallback;
