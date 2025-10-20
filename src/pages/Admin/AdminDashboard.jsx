import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, req, manual, claimed, unclaimed
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    req: 0,
    manual: 0,
    claimed: 0,
    unclaimed: 0,
    withCategories: 0,
    withoutCategories: 0
  });

  useEffect(() => {
    loadStats();
    loadBusinesses();
  }, [filter, search]);

  async function loadStats() {
    const { count: total } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    const { count: req } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('data_source', 'req');

    const { count: manual } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('data_source', 'manual');

    const { count: claimed } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_claimed', true);

    setStats({
      total: total || 0,
      req: req || 0,
      manual: manual || 0,
      claimed: claimed || 0,
      unclaimed: (total || 0) - (claimed || 0)
    });
  }

  async function loadBusinesses() {
    setLoading(true);

    let query = supabase
      .from('businesses')
      .select('id, name, city, data_source, is_claimed, neq, phone, website, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    // Filtres
    if (filter === 'req') query = query.eq('data_source', 'req');
    if (filter === 'manual') query = query.eq('data_source', 'manual');
    if (filter === 'claimed') query = query.eq('is_claimed', true);
    if (filter === 'unclaimed') query = query.eq('is_claimed', false);

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
    if (!confirm(`Supprimer "${name}" ?`)) return;

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

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🎛️ Administration</h1>
        <p>Gestion des entreprises et réclamations</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.req}</div>
          <div className="stat-label">REQ</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.manual}</div>
          <div className="stat-label">Manuelles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.claimed}</div>
          <div className="stat-label">Réclamées</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.unclaimed}</div>
          <div className="stat-label">Non réclamées</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="admin-filters">
        <div className="filter-group">
          <label>Filtre:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Toutes</option>
            <option value="req">REQ</option>
            <option value="manual">Manuelles</option>
            <option value="claimed">Réclamées</option>
            <option value="unclaimed">Non réclamées</option>
          </select>
        </div>

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
                <th>Ville</th>
                <th>Source</th>
                <th>NEQ</th>
                <th>Téléphone</th>
                <th>Site web</th>
                <th>Statut</th>
                <th>Date</th>
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
                  <td>{biz.city || '-'}</td>
                  <td>
                    <span className={`badge badge-${biz.data_source}`}>
                      {biz.data_source === 'req' ? 'REQ' : 'Manuelle'}
                    </span>
                  </td>
                  <td>{biz.neq || '-'}</td>
                  <td>{biz.phone ? '✅' : '❌'}</td>
                  <td>{biz.website ? '✅' : '❌'}</td>
                  <td>
                    {biz.is_claimed ? (
                      <span className="badge badge-claimed">Réclamée</span>
                    ) : (
                      <span className="badge badge-unclaimed">Non réclamée</span>
                    )}
                  </td>
                  <td>{new Date(biz.created_at).toLocaleDateString('fr-CA')}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/business/${biz.id}`} className="btn-action btn-edit">
                        ✏️
                      </Link>
                      <button
                        onClick={() => deleteBusiness(biz.id, biz.name)}
                        className="btn-action btn-delete"
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
            <p>Aucune entreprise trouvée</p>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="admin-quick-actions">
        <h3>Actions rapides</h3>
        <div className="quick-action-buttons">
          <Link to="/admin/tools" className="btn-quick-action">
            🛠️ Outils & Scripts
          </Link>
          <Link to="/admin/tools" className="btn-quick-action">
            📥 Importer des entreprises
          </Link>
          <Link to="/admin/tools" className="btn-quick-action">
            🌐 Enrichir données
          </Link>
          <Link to="/admin/migration" className="btn-quick-action">
            🔄 Migration Google
          </Link>
        </div>
      </div>
    </div>
  );
}
