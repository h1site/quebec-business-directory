import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminModeration() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    manual: 0,
    claimed: 0
  });

  useEffect(() => {
    loadStats();
    loadBusinesses();
  }, [search]);

  async function loadStats() {
    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    const { count: total } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyOneDaysAgo.toISOString());

    const { count: manual } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('data_source', 'manual')
      .gte('created_at', thirtyOneDaysAgo.toISOString());

    const { count: claimed } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_claimed', true)
      .gte('created_at', thirtyOneDaysAgo.toISOString());

    setStats({
      total: total || 0,
      manual: manual || 0,
      claimed: claimed || 0
    });
  }

  async function loadBusinesses() {
    setLoading(true);

    const thirtyOneDaysAgo = new Date();
    thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

    let query = supabase
      .from('businesses')
      .select('id, name, city, data_source, is_claimed, neq, phone, website, email, description, created_at, address')
      .gte('created_at', thirtyOneDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Recherche
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,neq.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (!error) {
      setBusinesses(data || []);
    }

    setLoading(false);
  }

  async function deleteBusiness(id, name) {
    if (!confirm(`Supprimer "${name}" ?\n\nCette action est irréversible.`)) return;

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (!error) {
      alert('Entreprise supprimée');
      loadBusinesses();
      loadStats();
    } else {
      alert('Erreur: ' + error.message);
    }
  }

  function getDaysAgo(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🔍 Modération - 31 derniers jours</h1>
        <p>Vérification des nouvelles entreprises pour contenu inapproprié</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total (31 jours)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.manual}</div>
          <div className="stat-label">Ajoutées manuellement</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.claimed}</div>
          <div className="stat-label">Réclamées</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Recherche:</label>
          <input
            type="text"
            placeholder="Nom, ville, NEQ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button onClick={loadBusinesses} className="btn-refresh">
          🔄 Rafraîchir
        </button>

        <Link to="/admin" className="btn-refresh">
          ← Retour admin
        </Link>
      </div>

      {/* Liste */}
      <div className="admin-table-container">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Ville</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Ajouté il y a</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map(biz => (
                <tr key={biz.id}>
                  <td>
                    <Link to={`/entreprise/${biz.city?.toLowerCase().replace(/\s+/g, '-') || 'ville'}/${biz.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} target="_blank">
                      <strong>{biz.name}</strong>
                    </Link>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '0.9em' }}>
                    {biz.description ? (
                      biz.description.length > 100
                        ? biz.description.substring(0, 100) + '...'
                        : biz.description
                    ) : '-'}
                  </td>
                  <td>{biz.city || '-'}</td>
                  <td style={{ fontSize: '0.85em' }}>
                    {biz.phone && <div>📞 {biz.phone}</div>}
                    {biz.email && <div>📧 {biz.email}</div>}
                    {biz.website && <div>🌐 <a href={biz.website} target="_blank" rel="noopener noreferrer">Site</a></div>}
                    {!biz.phone && !biz.email && !biz.website && '-'}
                  </td>
                  <td>
                    <span className={`badge badge-${biz.data_source}`}>
                      {biz.data_source === 'req' ? 'REQ' : 'Manuelle'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85em' }}>
                      {getDaysAgo(biz.created_at)} jour{getDaysAgo(biz.created_at) > 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '0.75em', color: '#666' }}>
                      {new Date(biz.created_at).toLocaleDateString('fr-CA')}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/business/${biz.id}`} className="btn-action btn-edit" title="Modifier">
                        ✏️
                      </Link>
                      <button
                        onClick={() => deleteBusiness(biz.id, biz.name)}
                        className="btn-action btn-delete"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && businesses.length === 0 && (
          <div className="empty-state">
            <p>Aucune entreprise trouvée dans les 31 derniers jours</p>
          </div>
        )}
      </div>
    </div>
  );
}
