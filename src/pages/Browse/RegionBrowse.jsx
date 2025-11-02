import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchBusinesses } from '../../services/businessService.js';
import { getBusinessUrl } from '../../utils/urlHelpers.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import './Browse.css';

const RegionBrowse = () => {
  const { regionSlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionName, setRegionName] = useState('');
  const [notFound, setNotFound] = useState(false);

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

        const name = regionMap[regionSlug];

        // If region doesn't exist in our map, show 404
        if (!name) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setRegionName(name);

        // Show all businesses in region for SEO (limit 100k for large regions)
        const { data, error: searchError } = await searchBusinesses({
          region: regionSlug,
          limit: 100000
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

  // Redirect to 404 page if region doesn't exist
  if (notFound) {
    return <Navigate to="/404" replace />;
  }

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

  const canonicalUrl = `https://registreduquebec.com/region/${regionSlug}`;

  // Generate ItemList Schema
  const itemListSchema = businesses.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Entreprises en ${regionName}`,
    "description": `Liste des entreprises en ${regionName}, Québec`,
    "numberOfItems": businesses.length,
    "itemListElement": businesses.slice(0, 50).map((business, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": business.name,
        "url": `https://registreduquebec.com${getBusinessUrl(business)}`,
        ...(business.address && { "address": {
          "@type": "PostalAddress",
          "streetAddress": business.address,
          "addressLocality": business.city,
          "addressRegion": "QC",
          "postalCode": business.postal_code,
          "addressCountry": "CA"
        }}),
        ...(business.phone && { "telephone": business.phone })
      }
    }))
  } : null;

  return (
    <>
      <Helmet>
        <title>Entreprises en {regionName} | Registre du Québec</title>
        <meta name="description" content={`Découvrez ${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} en ${regionName}, Québec. Coordonnées, avis et informations détaillées.`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`Entreprises en ${regionName}`} />
        <meta property="og:description" content={`${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} en ${regionName}, Québec`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:title" content={`Entreprises en ${regionName}`} />
        <meta name="twitter:description" content={`${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} en ${regionName}`} />

        {/* ItemList Schema.org */}
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        )}
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
