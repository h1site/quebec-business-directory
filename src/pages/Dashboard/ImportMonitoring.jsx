import { useState, useEffect } from 'react';
import { getQuotaInfo, getAdminQuotaStatusMessage } from '../../services/importQuotaService.js';
import './ImportMonitoring.css';

const ImportMonitoring = () => {
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchQuotaInfo();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQuotaInfo();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchQuotaInfo = async () => {
    try {
      setLoading(true);
      const info = await getQuotaInfo(90);
      setQuotaInfo(info);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la récupération des statistiques');
      console.error('Failed to fetch quota:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading && !quotaInfo) {
    return (
      <div className="import-monitoring">
        <div className="monitoring-header">
          <h1>Monitoring des Imports Google</h1>
        </div>
        <div className="monitoring-loading">
          <div className="spinner-large"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error && !quotaInfo) {
    return (
      <div className="import-monitoring">
        <div className="monitoring-header">
          <h1>Monitoring des Imports Google</h1>
        </div>
        <div className="monitoring-error">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRefresh}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const statusMessage = getAdminQuotaStatusMessage(quotaInfo);
  const percentageUsed = quotaInfo?.percentage_used || 0;

  return (
    <div className="import-monitoring">
      <div className="monitoring-header">
        <h1>📊 Monitoring des Imports Google</h1>
        <button
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? '⟳ Actualisation...' : '🔄 Actualiser'}
        </button>
      </div>

      {/* Status Alert */}
      <div className={`status-alert status-${statusMessage.type}`}>
        <span className="status-icon">{statusMessage.icon}</span>
        <div className="status-content">
          <h3 className="status-title">
            {statusMessage.costWarning ? 'Limite Gratuite Atteinte!' : 'Statut du Quota'}
          </h3>
          <p className="status-message">{statusMessage.message}</p>
          {statusMessage.costWarning && (
            <p className="cost-warning">
              ⚠️ Les prochains imports coûteront <strong>$0.02 CAD chacun</strong>
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-label">Imports Aujourd'hui</div>
            <div className="stat-value">{quotaInfo?.imports_today || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Limite Quotidienne</div>
            <div className="stat-value">{quotaInfo?.limit || 90}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Imports Restants</div>
            <div className="stat-value">{quotaInfo?.remaining || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Utilisation</div>
            <div className="stat-value">{percentageUsed.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-header">
          <h3>Utilisation du Quota</h3>
          <span className="progress-label">
            {quotaInfo?.imports_today || 0} / {quotaInfo?.limit || 90}
          </span>
        </div>
        <div className="progress-bar-container">
          <div
            className={`progress-bar progress-bar-${statusMessage.type}`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          >
            <span className="progress-bar-text">{percentageUsed.toFixed(1)}%</span>
          </div>
        </div>
        <div className="progress-milestones">
          <span className="milestone">0%</span>
          <span className="milestone milestone-warning">80%</span>
          <span className="milestone milestone-danger">100%</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card info-card-free">
          <h3>🎉 Limite Gratuite Google</h3>
          <p><strong>100 imports / jour</strong> sont gratuits</p>
          <p>Notre limite: <strong>90 imports</strong> (marge de sécurité de 10)</p>
        </div>

        <div className="info-card info-card-cost">
          <h3>💰 Coûts après la Limite</h3>
          <p>Après 100 imports/jour: <strong>$0.017 USD / import</strong> (~$0.02 CAD)</p>
          <p>Exemple: 200 imports = $3.40 CAD supplémentaires</p>
        </div>

        <div className="info-card info-card-reset">
          <h3>🔄 Réinitialisation</h3>
          <p>Le compteur se réinitialise automatiquement à <strong>minuit</strong> (heure du serveur)</p>
          <p>Date actuelle: <strong>{quotaInfo?.date}</strong></p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations-section">
        <h3>💡 Recommandations</h3>
        <ul className="recommendations-list">
          <li>
            <strong>À 80 imports:</strong> Surveillez attentivement les nouveaux imports
          </li>
          <li>
            <strong>À 90 imports:</strong> Le système désactive automatiquement l'import pour le public
          </li>
          <li>
            <strong>Admin:</strong> Vous pouvez continuer à importer même après 90, mais avec un avertissement de coût
          </li>
          <li>
            <strong>Alternative:</strong> Utilisez la demande manuelle pour les cas non urgents
          </li>
        </ul>
      </div>

      {/* Last Updated */}
      <div className="monitoring-footer">
        <p className="last-updated">
          Dernière mise à jour: {new Date().toLocaleString('fr-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
        <p className="auto-refresh">
          ⟳ Actualisation automatique toutes les 30 secondes
        </p>
      </div>
    </div>
  );
};

export default ImportMonitoring;
