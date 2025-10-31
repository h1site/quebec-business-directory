import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import './AdminStats.css';

const AdminStatsNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    claimedBusinesses: 0,
    totalViews: 0,
    totalClicks: 0,
    viewsToday: 0,
    viewsThisMonth: 0,
    clicksToday: 0,
    clicksThisMonth: 0
  });
  const [businessList, setBusinessList] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // 1. Total d'entreprises
      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      // 2. Entreprises réclamées
      const { count: claimedBusinesses } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('is_claimed', true);

      // 3. Vues totales (si la table existe)
      let totalViews = 0;
      let viewsToday = 0;
      let viewsThisMonth = 0;

      try {
        const { count: views } = await supabase
          .from('business_views')
          .select('*', { count: 'exact', head: true });
        totalViews = views || 0;

        // Vues aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const { count: todayViews } = await supabase
          .from('business_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);
        viewsToday = todayViews || 0;

        // Vues ce mois
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const { count: monthViews } = await supabase
          .from('business_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth.toISOString());
        viewsThisMonth = monthViews || 0;
      } catch (error) {
        console.log('Table business_views non disponible:', error);
      }

      // 4. Clics totaux (CTA)
      let totalClicks = 0;
      let clicksToday = 0;
      let clicksThisMonth = 0;

      try {
        const { count: clicks } = await supabase
          .from('website_clicks')
          .select('*', { count: 'exact', head: true });
        totalClicks = clicks || 0;

        // Clics aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const { count: todayClicks } = await supabase
          .from('website_clicks')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today);
        clicksToday = todayClicks || 0;

        // Clics ce mois
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        const { count: monthClicks } = await supabase
          .from('website_clicks')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth.toISOString());
        clicksThisMonth = monthClicks || 0;
      } catch (error) {
        console.log('Table website_clicks non disponible:', error);
      }

      setStats({
        totalBusinesses: totalBusinesses || 0,
        claimedBusinesses: claimedBusinesses || 0,
        totalViews,
        totalClicks,
        viewsToday,
        viewsThisMonth,
        clicksToday,
        clicksThisMonth
      });

    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      // Récupérer toutes les entreprises avec leurs stats
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          city,
          region,
          phone,
          website,
          email,
          is_claimed,
          created_at,
          primary_main_category_fr,
          primary_sub_category_fr
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Pour chaque entreprise, obtenir les stats de vues et clics
      const businessesWithStats = await Promise.all(
        businesses.map(async (business) => {
          let views = 0;
          let clicks = 0;

          try {
            const { count: viewCount } = await supabase
              .from('business_views')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id);
            views = viewCount || 0;
          } catch (err) {
            // Table n'existe pas
          }

          try {
            const { count: clickCount } = await supabase
              .from('website_clicks')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', business.id);
            clicks = clickCount || 0;
          } catch (err) {
            // Table n'existe pas
          }

          return {
            ...business,
            views,
            clicks,
            ctr: views > 0 ? ((clicks / views) * 100).toFixed(2) : '0'
          };
        })
      );

      setBusinessList(businessesWithStats);

      // Créer le CSV
      const csvContent = convertToCSV(businessesWithStats);
      downloadCSV(csvContent, 'entreprises-stats.csv');

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    // En-têtes
    const headers = [
      'ID',
      'Nom',
      'Ville',
      'Région',
      'Téléphone',
      'Site Web',
      'Email',
      'Réclamée',
      'Date création',
      'Catégorie principale',
      'Sous-catégorie',
      'Vues totales',
      'Clics totaux',
      'CTR (%)'
    ];

    // Lignes de données
    const rows = data.map(b => [
      b.id,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${(b.city || '').replace(/"/g, '""')}"`,
      `"${(b.region || '').replace(/"/g, '""')}"`,
      b.phone || '',
      b.website || '',
      b.email || '',
      b.is_claimed ? 'Oui' : 'Non',
      b.created_at ? new Date(b.created_at).toLocaleDateString('fr-CA') : '',
      `"${(b.primary_main_category_fr || '').replace(/"/g, '""')}"`,
      `"${(b.primary_sub_category_fr || '').replace(/"/g, '""')}"`,
      b.views || 0,
      b.clicks || 0,
      b.ctr || 0
    ]);

    // Assembler le CSV
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const BOM = '\uFEFF'; // UTF-8 BOM pour Excel
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const claimRate = stats.totalBusinesses > 0
    ? ((stats.claimedBusinesses / stats.totalBusinesses) * 100).toFixed(1)
    : 0;

  const avgCTR = stats.totalViews > 0
    ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2)
    : 0;

  return (
    <div className="admin-stats-container">
      {/* Header */}
      <div className="stats-header">
        <h1>📊 Statistiques & Analytics</h1>
        <div className="stats-header-actions">
          <button onClick={loadStats} className="btn-refresh" disabled={loading}>
            🔄 Actualiser
          </button>
          <button
            onClick={exportToExcel}
            className="btn-export"
            disabled={exporting}
          >
            {exporting ? '⏳ Export en cours...' : '📥 Exporter Excel (CSV)'}
          </button>
        </div>
      </div>

      {/* Vue d'ensemble - Cartes de stats */}
      <div className="stats-overview">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Total Entreprises</h3>
            <p className="stat-value">{stats.totalBusinesses.toLocaleString()}</p>
            <p className="stat-label">Enregistrées dans la base</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Entreprises Réclamées</h3>
            <p className="stat-value">{stats.claimedBusinesses.toLocaleString()}</p>
            <p className="stat-label">{claimRate}% du total</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <h3>Vues Totales</h3>
            <p className="stat-value">{stats.totalViews.toLocaleString()}</p>
            <p className="stat-label">
              Aujourd'hui: {stats.viewsToday} | Ce mois: {stats.viewsThisMonth}
            </p>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">🖱️</div>
          <div className="stat-content">
            <h3>Clics CTA (Site Web)</h3>
            <p className="stat-value">{stats.totalClicks.toLocaleString()}</p>
            <p className="stat-label">
              Aujourd'hui: {stats.clicksToday} | Ce mois: {stats.clicksThisMonth}
            </p>
          </div>
        </div>

        <div className="stat-card stat-card-secondary">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Taux de Conversion (CTR)</h3>
            <p className="stat-value">{avgCTR}%</p>
            <p className="stat-label">Clics / Vues totales</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="stats-info-box">
        <h3>📥 Export des données</h3>
        <p>
          Cliquez sur "Exporter Excel (CSV)" pour télécharger un fichier Excel avec toutes les entreprises
          et leurs statistiques (vues, clics, CTR).
        </p>
        <p>
          Le fichier peut être ouvert dans Excel, Google Sheets ou tout autre tableur.
        </p>
      </div>

      {/* Tableau de prévisualisation si déjà exporté */}
      {businessList.length > 0 && (
        <div className="stats-table-container">
          <h3>📋 Aperçu des données ({businessList.length} entreprises)</h3>
          <div className="stats-table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Ville</th>
                  <th>Réclamée</th>
                  <th>Vues</th>
                  <th>Clics</th>
                  <th>CTR</th>
                </tr>
              </thead>
              <tbody>
                {businessList.slice(0, 20).map((business) => (
                  <tr key={business.id}>
                    <td>{business.name}</td>
                    <td>{business.city}</td>
                    <td>{business.is_claimed ? '✅' : '❌'}</td>
                    <td>{business.views}</td>
                    <td>{business.clicks}</td>
                    <td>{business.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {businessList.length > 20 && (
              <p className="table-note">
                Affichage des 20 premières lignes. Téléchargez le CSV pour voir toutes les données.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStatsNew;
