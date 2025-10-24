import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient.js';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase n'est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
      );
      return;
    }

    try {
      setSubmitting(true);
      const { error: signInError } = await supabase.auth.signInWithPassword(form);
      if (signInError) {
        throw signInError;
      }
      setMessage('Connexion réussie!');
      navigate('/entreprise/nouvelle');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setError(
        "Supabase n'est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
      );
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/entreprise/nouvelle`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2070&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '100px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="container" style={{ maxWidth: '500px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/images/logos/logoblue.webp"
            alt="Logo"
            style={{
              maxWidth: '200px',
              height: 'auto'
            }}
          />
        </div>

        {/* Form Container with white background */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ textAlign: 'left', marginBottom: '1.5rem' }}>{t('auth.loginTitle')}</h1>
          {message && <div className="alert">{message}</div>}
          {error && (
            <div className="alert" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
        <label>
          {t('auth.email')}
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label>
          {t('auth.password')}
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? '...' : t('auth.submit')}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: '#a0aec0',
            fontSize: '0.875rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ padding: '0 1rem' }}>{t('auth.or')}</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>

          {/* Google Sign In Button - Centered with max-width */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleGoogleSignIn}
              disabled={submitting}
              type="button"
              style={{
                width: 'auto',
                minWidth: '280px',
                padding: '0.65rem 1.5rem',
                background: 'white',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                color: '#3c4043'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
              </svg>
              {submitting ? t('auth.connecting') : t('auth.continueWithGoogle')}
            </button>
          </div>

          {/* Create Account Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <p style={{ margin: '0 0 0.75rem 0', color: '#718096', fontSize: '0.875rem' }}>
              {t('auth.noAccount')}
            </p>
            <button
              onClick={() => navigate('/inscription')}
              type="button"
              style={{
                background: 'transparent',
                border: '2px solid #1e88e5',
                color: '#1e88e5',
                padding: '0.65rem 1.5rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#1e88e5';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#1e88e5';
              }}
            >
              {t('auth.createAccount')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
