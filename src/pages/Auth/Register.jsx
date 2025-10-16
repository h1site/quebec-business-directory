import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient.js';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
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

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe doivent correspondre.');
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        "Supabase n'est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
      );
      return;
    }

    try {
      setSubmitting(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password
      });
      if (signUpError) {
        throw signUpError;
      }
      setMessage('Compte créé! Vérifiez votre courriel pour confirmer votre inscription.');
      navigate('/connexion');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container" style={{ padding: '3rem 0' }}>
      <h1>{t('auth.registerTitle')}</h1>
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
        <label>
          {t('auth.confirmPassword')}
          <input
            type="password"
            name="confirmPassword"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </label>
        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? '...' : t('auth.submit')}
        </button>
      </form>
    </section>
  );
};

export default Register;
