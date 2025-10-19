import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchBusinesses } from '../../services/businessService.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import './Browse.css';

const RegionBrowse = () => {
  const { regionSlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionName, setRegionName] = useState('');

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        // Convert slug to region name (monteregie -> Montérégie)
        const regionMap = {
          'monteregie': 'Montérégie',
          'montreal': 'Montréal',
          'laval': 'Laval',
          'laurentides': 'Laurentides',
          'lanaudiere': 'Lanaudière',
          'capitale-nationale': 'Capitale-Nationale',
          'estrie': 'Estrie',
          'mauricie': 'Mauricie',
          'saguenay-lac-saint-jean': 'Saguenay-Lac-Saint-Jean',
          'outaouais': 'Outaouais',
          'abitibi-temiscamingue': 'Abitibi-Témiscamingue',
          'cote-nord': 'Côte-Nord',
          'bas-saint-laurent': 'Bas-Saint-Laurent',
          'gaspesie-iles-de-la-madeleine': 'Gaspésie-Îles-de-la-Madeleine',
          'chaudiere-appalaches': 'Chaudière-Appalaches',
          'centre-du-quebec': 'Centre-du-Québec',
          'nord-du-quebec': 'Nord-du-Québec'
        };

        const name = regionMap[regionSlug] || regionSlug;
        setRegionName(name);

        const { data, error: searchError } = await searchBusinesses({
          region: regionSlug,
          limit: 100
        });

        if (searchError) {
          setError('Erreur lors du chargement des entreprises');
          return;
        }

        setBusinesses(data || []);
      } catch (err) {
        setError('Erreur lors du chargement des entreprises');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [regionSlug]);

  if (loading) {
    return (
      <div className="container browse-page">
        <div className="loading-state">Chargement des entreprises...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container browse-page">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Entreprises en {regionName} | Registre du Québec</title>
        <meta name="description" content={`Découvrez ${businesses.length} entreprises en ${regionName}, Québec`} />
      </Helmet>

      <div className="container browse-page">
        <div className="browse-header">
          <h1>Entreprises en {regionName}</h1>
          <p className="browse-count">{businesses.length} entreprise{businesses.length > 1 ? 's' : ''} trouvée{businesses.length > 1 ? 's' : ''}</p>
        </div>

        {businesses.length === 0 ? (
          <div className="no-results">
            <p>Aucune entreprise trouvée en {regionName}</p>
            <Link to="/recherche" className="btn btn-primary">
              Rechercher ailleurs
            </Link>
          </div>
        ) : (
          <div className="business-grid">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RegionBrowse;
