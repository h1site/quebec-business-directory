import { useState } from 'react';
import { updateBusinessSlugs, fixBusinessSlugByName } from '../../services/migrationService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './MigrationTools.css';

const MigrationTools = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState({ type: null, message: null });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [businessName, setBusinessName] = useState('');

  const handleMigrateSlugs = async () => {
    try {
      setRunning(true);
      setStatus({ type: 'info', message: 'Migration en cours...' });
      setResults(null);

      const migrationResults = await updateBusinessSlugs();

      setResults(migrationResults);
      setStatus({
        type: 'success',
        message: `Migration terminée! ${migrationResults.success} entreprises mises à jour.`
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Erreur: ${error.message}`
      });
      console.error(error);
    } finally {
      setRunning(false);
    }
  };

  const handleFixSingleBusiness = async (e) => {
    e.preventDefault();

    if (!businessName.trim()) {
      setStatus({ type: 'error', message: 'Veuillez entrer un nom d\'entreprise' });
      return;
    }

    try {
      setRunning(true);
      setStatus({ type: 'info', message: 'Correction en cours...' });

      const updated = await fixBusinessSlugByName(businessName);

      setStatus({
        type: 'success',
        message: `✓ Entreprise mise à jour: ${updated.name} → slug: ${updated.slug}`
      });
      setBusinessName('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Erreur: ${error.message}`
      });
      console.error(error);
    } finally {
      setRunning(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>Accès refusé</h2>
        <p>Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="migration-tools-page">
      <div className="container">
        <h1>Outils de migration</h1>
        <p className="subtitle">
          Utilisez ces outils pour mettre à jour les données de la base de données.
        </p>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        {/* Migration des slugs */}
        <div className="migration-card">
          <h2>Migration des slugs manquants</h2>
          <p>
            Cette opération va générer automatiquement des slugs pour toutes les entreprises
            qui n'en ont pas encore. Le slug est nécessaire pour créer les URLs publiques.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleMigrateSlugs}
            disabled={running}
          >
            {running ? 'Migration en cours...' : 'Lancer la migration'}
          </button>

          {results && (
            <div className="migration-results">
              <h3>Résultats de la migration</h3>
              <p>
                <strong>{results.success}</strong> entreprise(s) mise(s) à jour
              </p>
              {results.errors.length > 0 && (
                <div className="errors-list">
                  <h4>Erreurs ({results.errors.length})</h4>
                  <ul>
                    {results.errors.map((err, index) => (
                      <li key={index}>
                        {err.name} (ID: {err.id}): {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Correction d'une entreprise spécifique */}
        <div className="migration-card">
          <h2>Corriger une entreprise spécifique</h2>
          <p>
            Entrez le nom d'une entreprise pour générer ou corriger son slug.
          </p>
          <form onSubmit={handleFixSingleBusiness} className="fix-business-form">
            <div className="form-group">
              <label htmlFor="businessName">Nom de l'entreprise</label>
              <input
                type="text"
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: H1site"
                disabled={running}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={running}
            >
              {running ? 'Correction...' : 'Corriger'}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="migration-card info-card">
          <h2>ℹ️ Information</h2>
          <p>
            <strong>Qu'est-ce qu'un slug?</strong>
          </p>
          <p>
            Le slug est la partie de l'URL qui identifie une entreprise de manière unique.
            Par exemple, pour "H1site", le slug sera "h1site" et l'URL sera:
          </p>
          <code>https://votre-site.com/entreprise/h1site</code>
          <p style={{ marginTop: '1rem' }}>
            Si une entreprise n'a pas de slug, elle ne sera pas accessible via une URL publique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MigrationTools;
