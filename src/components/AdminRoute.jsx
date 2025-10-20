import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAILS = ['karpe_25@hotmail.com', 'info@h1site.com'];

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div>Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '4rem auto',
        padding: '2rem',
        textAlign: 'center',
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px'
      }}>
        <h2>🚫 Accès refusé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <p><strong>Seuls les administrateurs autorisés peuvent accéder à cette section.</strong></p>
      </div>
    );
  }

  return children;
}
