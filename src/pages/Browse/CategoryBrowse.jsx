import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js';
import { getBusinessUrl } from '../../utils/urlHelpers.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import './Browse.css';

const CategoryBrowse = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);

        // Get category info
        const { data: mainCat, error: catError } = await supabase
          .from('main_categories')
          .select('id, label_fr')
          .eq('slug', categorySlug)
          .single();

        // If category doesn't exist, show 404
        if (catError || !mainCat) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCategoryName(mainCat.label_fr);

        // Build query
        let query = supabase
          .from('businesses_enriched')
          .select('*');

        if (subCategorySlug) {
          // Get subcategory info
          const { data: subCat, error: subCatError } = await supabase
            .from('sub_categories')
            .select('label_fr')
            .eq('slug', subCategorySlug)
            .single();

          // If subcategory doesn't exist, show 404
          if (subCatError || !subCat) {
            setNotFound(true);
            setLoading(false);
            return;
          }

          setSubCategoryName(subCat.label_fr);

          // Filter by subcategory
          query = query.eq('primary_sub_category_slug', subCategorySlug);
        } else {
          // Filter by main category using main_category_id instead of slug
          if (mainCat && mainCat.id) {
            query = query.eq('main_category_id', mainCat.id);
          }
        }

        // Load businesses in batches of 1000 (Supabase max per query)
        // Get count for total results
        const { data, error: searchError, count } = await query
          .select('*', { count: 'exact' })
          .range(0, 999);

        if (searchError) {
          setError('Erreur lors du chargement des entreprises');
          return;
        }

        console.log('📊 CategoryBrowse - Results received:', data?.length || 0, 'Total count:', count);
        setBusinesses(data || []);
        setTotalCount(count || 0);
        setHasMore((data?.length || 0) === 1000 && (count || 0) > 1000);
      } catch (err) {
        setError('Erreur lors du chargement des entreprises');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [categorySlug, subCategorySlug]);

  const handleLoadMore = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      const offset = businesses.length;

      // Build the same query as initial load
      let query = supabase
        .from('businesses_enriched')
        .select('*');

      if (subCategorySlug) {
        query = query.eq('primary_sub_category_slug', subCategorySlug);
      } else {
        // Get category ID for filtering
        const { data: mainCat } = await supabase
          .from('main_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();

        if (mainCat?.id) {
          query = query.eq('main_category_id', mainCat.id);
        }
      }

      const { data, error: searchError } = await query.range(offset, offset + 999);

      if (searchError) {
        console.error('Error loading more:', searchError);
        return;
      }

      console.log('📊 CategoryBrowse - Load more results:', data?.length || 0);
      setBusinesses(prev => [...prev, ...(data || [])]);
      setHasMore((data?.length || 0) === 1000 && businesses.length + (data?.length || 0) < totalCount);
    } catch (err) {
      console.error('Error loading more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Redirect to 404 page if category/subcategory doesn't exist
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

  const displayName = subCategoryName || categoryName;
  const titlePrefix = subCategorySlug ? 'Entreprises en' : 'Entreprises de';
  const canonicalUrl = subCategorySlug
    ? `https://registreduquebec.com/categorie/${categorySlug}/${subCategorySlug}`
    : `https://registreduquebec.com/categorie/${categorySlug}`;

  // Generate ItemList Schema
  const itemListSchema = businesses.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${titlePrefix} ${displayName}`,
    "description": `Liste des entreprises ${subCategorySlug ? 'en' : 'de'} ${displayName} au Québec`,
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
        <title>{titlePrefix} {displayName} | Registre du Québec</title>
        <meta name="description" content={`Découvrez ${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} ${subCategorySlug ? 'en' : 'de'} ${displayName} au Québec. Coordonnées, avis et informations détaillées.`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`${titlePrefix} ${displayName}`} />
        <meta property="og:description" content={`${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} ${subCategorySlug ? 'en' : 'de'} ${displayName} au Québec`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:title" content={`${titlePrefix} ${displayName}`} />
        <meta name="twitter:description" content={`${businesses.length} entreprise${businesses.length > 1 ? 's' : ''} ${subCategorySlug ? 'en' : 'de'} ${displayName}`} />

        {/* ItemList Schema.org */}
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        )}
      </Helmet>

      <div className="container browse-page">
        {/* Breadcrumb Navigation with Schema */}
        <Breadcrumb
          items={[
            { name: 'Accueil', url: '/' },
            { name: categoryName, url: `/categorie/${categorySlug}` },
            ...(subCategorySlug && subCategoryName ? [{ name: subCategoryName }] : [])
          ]}
        />

        <div className="browse-header">
          <h1>{titlePrefix} {displayName}</h1>
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
            <p>Aucune entreprise trouvée dans cette catégorie</p>
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

export default CategoryBrowse;
