import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import SponsorLogoUpload from '../../components/SponsorLogoUpload';
import './AdminSponsors.css';

export default function AdminSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [statsRange, setStatsRange] = useState('7'); // 7, 14, 30 jours
  const [editForm, setEditForm] = useState({
    company_name: '',
    slogan: '',
    cta_url: '',
    is_active: true
  });

  useEffect(() => {
    loadSponsors();
  }, []);

  useEffect(() => {
    if (selectedSponsor) {
      loadSponsorStats(selectedSponsor.id, parseInt(statsRange));
    }
  }, [selectedSponsor, statsRange]);

  async function loadSponsors() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsors(data || []);

      // Mettre à jour le sponsor sélectionné avec les nouvelles données
      if (selectedSponsor && data) {
        const updatedSponsor = data.find(s => s.id === selectedSponsor.id);
        if (updatedSponsor) {
          setSelectedSponsor(updatedSponsor);
        }
      }

      // Sélectionner le premier sponsor par défaut si aucun n'est sélectionné
      if (data && data.length > 0 && !selectedSponsor) {
        setSelectedSponsor(data[0]);
      }
    } catch (error) {
      console.error('Erreur chargement sponsors:', error);
      alert('Erreur lors du chargement des commanditaires');
    } finally {
      setLoading(false);
    }
  }

  async function loadSponsorStats(sponsorId, days) {
    setStatsLoading(true);
    try {
      // Récupérer le résumé des stats
      const { data: summary, error: summaryError } = await supabase
        .rpc('get_sponsor_stats_summary', {
          p_sponsor_id: sponsorId,
          p_days: days
        });

      if (summaryError) throw summaryError;

      // Récupérer les stats détaillées par jour
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: dailyStats, error: dailyError } = await supabase
        .rpc('get_sponsor_stats', {
          p_sponsor_id: sponsorId,
          p_start_date: startDate.toISOString().split('T')[0],
          p_end_date: new Date().toISOString().split('T')[0]
        });

      if (dailyError) throw dailyError;

      setStats({
        summary: summary[0] || {
          total_impressions: 0,
          total_clicks: 0,
          avg_ctr: 0,
          best_day_impressions: 0,
          best_day_clicks: 0
        },
        daily: dailyStats || []
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }

  function startEdit(sponsor) {
    setEditing(true);
    setSelectedSponsor(sponsor);
    setEditForm({
      company_name: sponsor.company_name,
      slogan: sponsor.slogan || '',
      cta_url: sponsor.cta_url,
      is_active: sponsor.is_active
    });
  }

  function cancelEdit() {
    setEditing(false);
    setEditForm({
      company_name: '',
      slogan: '',
      cta_url: '',
      is_active: true
    });
  }

  async function saveChanges() {
    if (!selectedSponsor) return;

    try {
      const { error } = await supabase
        .from('sponsors')
        .update({
          company_name: editForm.company_name,
          slogan: editForm.slogan,
          cta_url: editForm.cta_url,
          is_active: editForm.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSponsor.id);

      if (error) throw error;

      alert('Modifications enregistrées avec succès!');
      setEditing(false);
      loadSponsors();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async function createNewSponsor() {
    const name = prompt('Nom de l\'entreprise commanditaire:');
    if (!name) return;

    const url = prompt('URL de destination:');
    if (!url) return;

    try {
      const { data, error } = await supabase
        .from('sponsors')
        .insert({
          company_name: name,
          slogan: '',
          logo_path: '/images/fiches/sponsors/placeholder.svg',
          cta_url: url,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      alert('Commanditaire créé! N\'oubliez pas d\'uploader le logo.');
      loadSponsors();
      setSelectedSponsor(data);
    } catch (error) {
      console.error('Erreur création:', error);
      alert('Erreur lors de la création');
    }
  }

  async function deleteSponsor(sponsor) {
    if (!confirm(`Supprimer le commanditaire "${sponsor.company_name}"? Cette action est irréversible.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsor.id);

      if (error) throw error;

      alert('Commanditaire supprimé');
      loadSponsors();
      if (selectedSponsor?.id === sponsor.id) {
        setSelectedSponsor(null);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="admin-sponsors">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="admin-sponsors">
      <div className="sponsors-header">
        <h1>Gestion des Commanditaires</h1>
        <button onClick={createNewSponsor} className="btn-primary">
          + Nouveau Commanditaire
        </button>
      </div>

      <div className="sponsors-layout">
        {/* Liste des commanditaires */}
        <aside className="sponsors-list">
          <h2>Commanditaires ({sponsors.length})</h2>
          {sponsors.map(sponsor => (
            <div
              key={sponsor.id}
              className={`sponsor-item ${selectedSponsor?.id === sponsor.id ? 'active' : ''}`}
              onClick={() => setSelectedSponsor(sponsor)}
            >
              <div className="sponsor-item-header">
                <strong>{sponsor.company_name}</strong>
                <span className={`status ${sponsor.is_active ? 'active' : 'inactive'}`}>
                  {sponsor.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="sponsor-item-meta">
                Créé le {formatDate(sponsor.created_at)}
              </div>
            </div>
          ))}

          {sponsors.length === 0 && (
            <div className="empty-state">
              Aucun commanditaire. Cliquez sur "Nouveau Commanditaire" pour commencer.
            </div>
          )}
        </aside>

        {/* Détails et stats du commanditaire sélectionné */}
        <main className="sponsor-details">
          {selectedSponsor ? (
            <>
              {/* Section Édition */}
              <section className="details-section">
                <div className="section-header">
                  <h2>Détails</h2>
                  {!editing ? (
                    <div className="button-group">
                      <button onClick={() => startEdit(selectedSponsor)} className="btn-secondary">
                        Modifier
                      </button>
                      <button onClick={() => deleteSponsor(selectedSponsor)} className="btn-danger">
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <div className="button-group">
                      <button onClick={saveChanges} className="btn-primary">
                        Enregistrer
                      </button>
                      <button onClick={cancelEdit} className="btn-secondary">
                        Annuler
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom de l'entreprise</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.company_name}
                        onChange={e => setEditForm({ ...editForm, company_name: e.target.value })}
                      />
                    ) : (
                      <div className="form-value">{selectedSponsor.company_name}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Slogan</label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.slogan}
                        onChange={e => setEditForm({ ...editForm, slogan: e.target.value })}
                        placeholder="Ex: Votre partenaire web au Québec"
                      />
                    ) : (
                      <div className="form-value">{selectedSponsor.slogan || '—'}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>URL de destination</label>
                    {editing ? (
                      <input
                        type="url"
                        value={editForm.cta_url}
                        onChange={e => setEditForm({ ...editForm, cta_url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    ) : (
                      <div className="form-value">
                        <a href={selectedSponsor.cta_url} target="_blank" rel="noopener noreferrer">
                          {selectedSponsor.cta_url}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      {editing ? (
                        <input
                          type="checkbox"
                          checked={editForm.is_active}
                          onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })}
                        />
                      ) : (
                        <input type="checkbox" checked={selectedSponsor.is_active} disabled />
                      )}
                      <span>Commandite active</span>
                    </label>
                  </div>
                </div>

                {/* Upload de logo */}
                <div className="logo-section">
                  <h3>Logo</h3>
                  <SponsorLogoUpload
                    sponsorId={selectedSponsor.id}
                    currentLogoUrl={selectedSponsor.use_storage_logo && selectedSponsor.logo_storage_path
                      ? supabase.storage.from('sponsor-logos').getPublicUrl(selectedSponsor.logo_storage_path).data.publicUrl
                      : selectedSponsor.logo_path
                    }
                    onUploadSuccess={() => loadSponsors()}
                  />
                </div>
              </section>

              {/* Section Statistiques */}
              <section className="stats-section">
                <div className="section-header">
                  <h2>Statistiques</h2>
                  <select
                    value={statsRange}
                    onChange={e => setStatsRange(e.target.value)}
                    className="stats-range-select"
                  >
                    <option value="7">7 derniers jours</option>
                    <option value="14">14 derniers jours</option>
                    <option value="30">30 derniers jours</option>
                  </select>
                </div>

                {statsLoading ? (
                  <div className="loading">Chargement des statistiques...</div>
                ) : stats ? (
                  <>
                    {/* Cartes de résumé */}
                    <div className="stats-cards">
                      <div className="stat-card">
                        <div className="stat-label">Impressions totales</div>
                        <div className="stat-value">{stats.summary.total_impressions?.toLocaleString()}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Clicks totaux</div>
                        <div className="stat-value">{stats.summary.total_clicks?.toLocaleString()}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">CTR moyen</div>
                        <div className="stat-value">{stats.summary.avg_ctr?.toFixed(2)}%</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Meilleur jour (vues)</div>
                        <div className="stat-value">{stats.summary.best_day_impressions?.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Tableau quotidien */}
                    <div className="stats-table-container">
                      <h3>Détails par jour</h3>
                      <table className="stats-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>CTR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.daily.length > 0 ? (
                            stats.daily.map((day, index) => (
                              <tr key={index}>
                                <td>{formatDate(day.date)}</td>
                                <td>{day.impressions?.toLocaleString()}</td>
                                <td>{day.clicks?.toLocaleString()}</td>
                                <td>{day.ctr?.toFixed(2)}%</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="empty-stats">
                                Aucune donnée pour cette période
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="error-state">
                    Impossible de charger les statistiques
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="empty-selection">
              Sélectionnez un commanditaire pour voir les détails et statistiques
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
