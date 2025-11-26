import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js';
import { getBusinessUrl } from '../../utils/urlHelpers.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import './Browse.css';

const CityBrowse = () => {
  const { citySlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = 24; // Optimized for performance

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

        // Only select necessary columns for better performance
        const { data, error: searchError, count } = await supabase
          .from('businesses')
          .select('id, name, slug, city, address, phone, email, description, main_category_slug, categories', { count: 'exact' })
          .ilike('city', name)
          .order('name')
          .range(0, ITEMS_PER_PAGE - 1);

        if (searchError) {
          setError('Erreur lors du chargement des entreprises');
          console.error('City browse error:', searchError);
          return;
        }

        // If no businesses found in this city, show 404
        if (!data || data.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        console.log('📊 CityBrowse - Results received:', data?.length || 0, 'Total count:', count);
        setBusinesses(data);
        setTotalCount(count || 0);
        setHasMore((data?.length || 0) === ITEMS_PER_PAGE && (count || 0) > ITEMS_PER_PAGE);
      } catch (err) {
        setError('Erreur lors du chargement des entreprises');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [citySlug]);

  const handleLoadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      const offset = businesses.length;

      const { data, error: searchError } = await supabase
        .from('businesses')
        .select('id, name, slug, city, address, phone, email, description, main_category_slug, categories')
        .ilike('city', cityName)
        .order('name')
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (searchError) {
        console.error('Error loading more:', searchError);
        return;
      }

      console.log('📊 CityBrowse - Load more results:', data?.length || 0);
      setBusinesses(prev => [...prev, ...(data || [])]);
      setHasMore((data?.length || 0) === ITEMS_PER_PAGE && businesses.length + (data?.length || 0) < totalCount);
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Redirect to 404 page if city doesn't exist (no businesses)
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

  const canonicalUrl = `https://registreduquebec.com/ville/${citySlug}`;

  // Generate ItemList Schema
  const itemListSchema = businesses.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Entreprises à ${cityName}`,
    "description": `Liste des entreprises à ${cityName}, Québec`,
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
        <title>Entreprises à {cityName} | Registre du Québec</title>
        <meta name="description" content={`Découvrez ${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} à ${cityName}, Québec. Coordonnées, avis et informations détaillées.`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`Entreprises à ${cityName}`} />
        <meta property="og:description" content={`${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} à ${cityName}, Québec`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:title" content={`Entreprises à ${cityName}`} />
        <meta name="twitter:description" content={`${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} à ${cityName}`} />

        {/* ItemList Schema.org */}
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        )}
      </Helmet>

      <div className="container browse-page">
        <div className="browse-header">
          <h1>Entreprises à {cityName}</h1>
          <p className="browse-count">
            {totalCount > 0 ? (
              businesses.length < totalCount ? (
                <>Affichage de <strong>{businesses.length}</strong> sur <strong>{totalCount}</strong> entreprise{totalCount > 1 ? 's' : ''}</>
              ) : (
                <><strong>{totalCount}</strong> entreprise{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}</>
              )
            ) : (
              <>{businesses.length} entreprise{businesses.length > 1 ? 's' : ''} trouvée{businesses.length > 1 ? 's' : ''}</>
            )}
          </p>
        </div>

        {businesses.length === 0 ? (
          <div className="no-results">
            <p>Aucune entreprise trouvée à {cityName}</p>
            <Link to="/recherche" className="btn btn-primary">
              Rechercher ailleurs
            </Link>
          </div>
        ) : (
          <>
            <div className="business-grid">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-container">
                <button
                  className="btn-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="spinner-small"></div>
                      Chargement...
                    </>
                  ) : (
                    'Charger plus'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CityBrowse;
