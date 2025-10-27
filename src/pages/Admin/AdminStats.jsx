import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getGlobalStats,
  getCategoryStats,
  getGeographicStats,
  registerAdminIP
} from '../../services/analyticsService';
import './AdminStats.css';

const AdminStats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [geographicStats, setGeographicStats] = useState([]);
  const [timeRange, setTimeRange] = useState('30days'); // 7days, 30days, 90days, all

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!user) {
      navigate('/login');
      return;
    }

    // Enregistrer l'IP de l'admin au chargement
    if (user && user.id) {
      registerAdminIP(user.id);
    }

    loadAllStats();
  }, [user, navigate]);

  const loadAllStats = async () => {
    setLoading(true);
    try {
      const [global, categories, geographic] = await Promise.all([
        getGlobalStats(),
        getCategoryStats(),
        getGeographicStats()
      ]);

      setGlobalStats(global);
      setCategoryStats(categories);
      setGeographicStats(geographic);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-stats-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  const claimRate = globalStats?.totalBusinesses > 0
    ? ((globalStats.claimedBusinesses / globalStats.totalBusinesses) * 100).toFixed(1)
    : 0;

  return (
    <div className="admin-stats-container">
      {/* Header */}
      <div className="stats-header">
        <h1>📊 Tableau de bord des statistiques</h1>
        <div className="stats-header-actions">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="90days">90 derniers jours</option>
            <option value="all">Tout</option>
          </select>
          <button onClick={loadAllStats} className="btn-refresh">
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Vue d'ensemble - Cartes de stats */}
      <div className="stats-overview">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Total Entreprises</h3>
            <p className="stat-value">{globalStats?.totalBusinesses?.toLocaleString() || 0}</p>
            <p className="stat-label">Enregistrées</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Revendiquées</h3>
            <p className="stat-value">{globalStats?.claimedBusinesses?.toLocaleString() || 0}</p>
            <p className="stat-label">{claimRate}% du total</p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Non revendiquées</h3>
            <p className="stat-value">{globalStats?.unclaimedBusinesses?.toLocaleString() || 0}</p>
            <p className="stat-label">{(100 - claimRate).toFixed(1)}% du total</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>Vues Totales</h3>
            <p className="stat-value">
              {globalStats?.dailyStats?.reduce((sum, day) => sum + (day.total_views || 0), 0).toLocaleString() || 0}
            </p>
            <p className="stat-label">30 derniers jours</p>
          </div>
        </div>
      </div>

      {/* Section Top Fiches */}
      <div className="stats-section">
        <h2>🔥 Top 10 - Fiches les plus consultées</h2>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Entreprise</th>
                <th>Ville</th>
                <th>Vues Totales</th>
              </tr>
            </thead>
            <tbody>
              {globalStats?.topViewed?.map((item, index) => (
                <tr key={item.business_id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.businesses?.name || 'N/A'}</strong>
                  </td>
                  <td>{item.businesses?.city || 'N/A'}</td>
                  <td className="stat-number">{item.total_views?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Top Clics */}
      <div className="stats-section">
        <h2>🌐 Top 10 - Sites web les plus cliqués</h2>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Entreprise</th>
                <th>Ville</th>
                <th>Site Web</th>
                <th>Clics Totaux</th>
              </tr>
            </thead>
            <tbody>
              {globalStats?.topClicked?.map((item, index) => (
                <tr key={item.business_id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{item.businesses?.name || 'N/A'}</strong>
                  </td>
                  <td>{item.businesses?.city || 'N/A'}</td>
                  <td>
                    {item.businesses?.website ? (
                      <a href={item.businesses.website} target="_blank" rel="noopener noreferrer" className="website-link">
                        🔗 Visiter
                      </a>
                    ) : (
                      <span className="text-muted">Aucun</span>
                    )}
                  </td>
                  <td className="stat-number">{item.total_clicks?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Catégories */}
      <div className="stats-section">
        <h2>🏷️ Répartition par catégories</h2>
        <div className="stats-grid">
          {categoryStats?.slice(0, 12).map((cat) => (
            <div key={cat.slug} className="category-stat-card">
              <h4>{cat.name || cat.slug}</h4>
              <p className="category-count">{cat.count?.toLocaleString() || 0}</p>
              <p className="category-label">entreprises</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section Géographique */}
      <div className="stats-section">
        <h2>🏙️ Top 20 - Villes les plus actives</h2>
        <div className="stats-grid">
          {geographicStats?.slice(0, 20).map((geo) => (
            <div key={geo.city} className="geographic-stat-card">
              <h4>{geo.city}</h4>
              {geo.region && <p className="geo-region">{geo.region}</p>}
              <p className="geo-count">{geo.count?.toLocaleString() || 0}</p>
              <p className="geo-label">entreprises</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note sur l'exclusion des IPs admin */}
      <div className="stats-footer-note">
        <p>
          ℹ️ <strong>Note:</strong> Votre adresse IP actuelle a été enregistrée et est automatiquement exclue des statistiques pour éviter de fausser les données.
        </p>
      </div>
    </div>
  );
};

export default AdminStats;
