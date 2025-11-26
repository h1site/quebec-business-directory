import { useEffect, useState, useCallback } from 'react';
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

  const ITEMS_PER_PAGE = 24;

  // Normalize city slug to name with proper capitalization
  const normalizeCityName = useCallback((slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-');
  }, []);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const name = normalizeCityName(citySlug);
        setCityName(name);

        // Use RPC function for faster indexed query, fallback to ilike
        let data, searchError, count;

        // Try the fast RPC first (requires index on city)
        const rpcResult = await supabase.rpc('get_businesses_by_city', {
          city_name: name,
          page_limit: ITEMS_PER_PAGE,
          page_offset: 0
        });

        if (rpcResult.error) {
          // Fallback to regular query if RPC doesn't exist
          console.log('RPC not available, using fallback query');
          const fallbackResult = await supabase
            .from('businesses')
            .select('id, name, slug, city, address, phone, email, description, main_category_slug, categories', { count: 'exact' })
            .ilike('city', name)
            .order('name')
            .range(0, ITEMS_PER_PAGE - 1);

          data = fallbackResult.data;
          searchError = fallbackResult.error;
          count = fallbackResult.count;
        } else {
          data = rpcResult.data;
          // Get count using the fast RPC function
          const countResult = await supabase.rpc('get_businesses_count_by_city', { city_name: name });
          count = countResult.data || 0;
        }

        if (searchError) {
          setError('Erreur lors du chargement des entreprises');
          console.error('City browse error:', searchError);
          return;
        }

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
  }, [citySlug, normalizeCityName]);

  const handleLoadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      const offset = businesses.length;

      // Try RPC first, fallback to regular query
      const rpcResult = await supabase.rpc('get_businesses_by_city', {
        city_name: cityName,
        page_limit: ITEMS_PER_PAGE,
        page_offset: offset
      });

      let data;
      if (rpcResult.error) {
        const fallbackResult = await supabase
          .from('businesses')
          .select('id, name, slug, city, address, phone, email, description, main_category_slug, categories')
          .ilike('city', cityName)
          .order('name')
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (fallbackResult.error) {
          console.error('Error loading more:', fallbackResult.error);
          return;
        }
        data = fallbackResult.data;
      } else {
        data = rpcResult.data;
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
