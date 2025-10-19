import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchBusinesses } from '../../services/businessService.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import './Browse.css';

const CityBrowse = () => {
  const { citySlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        // Convert slug to city name (vaudreuil-dorion -> Vaudreuil-Dorion)
        const name = citySlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('-');

        setCityName(name);

        const { data, error: searchError } = await searchBusinesses({
          city: name,
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
  }, [citySlug]);

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
        <title>Entreprises à {cityName} | Registre du Québec</title>
        <meta name="description" content={`Découvrez ${businesses.length} entreprises à ${cityName}, Québec`} />
      </Helmet>

      <div className="container browse-page">
        <div className="browse-header">
          <h1>Entreprises à {cityName}</h1>
          <p className="browse-count">{businesses.length} entreprise{businesses.length > 1 ? 's' : ''} trouvée{businesses.length > 1 ? 's' : ''}</p>
        </div>

        {businesses.length === 0 ? (
          <div className="no-results">
            <p>Aucune entreprise trouvée à {cityName}</p>
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

export default CityBrowse;
