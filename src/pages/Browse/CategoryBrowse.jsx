import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js';
import { getBusinessUrl } from '../../utils/urlHelpers.js';
import { getCategoryIconPath } from '../../utils/categoryIcons.js';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import './Browse.css';

const CategoryBrowse = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [notFound, setNotFound] = useState(false);
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
        setCategoryIcon(getCategoryIconPath(categorySlug));

        // Handle subcategory if specified
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
        }

        // Load ALL businesses using batch loading (only needed fields for performance)
        let allBusinesses = [];
        let offset = 0;
        const batchSize = 1000;
        let hasMoreBatches = true;

        // First, show loading state but continue loading in background
        setLoading(false); // Show UI immediately
        setLoadingMore(true); // Show progressive loading indicator

        while (hasMoreBatches) {
          let query = supabase
            .from('businesses_enriched')
            .select('id, name, slug, city, main_category_slug'); // Only load needed fields

          if (subCategorySlug) {
            query = query.eq('primary_sub_category_slug', subCategorySlug);
          } else {
            query = query.eq('main_category_id', mainCat.id);
          }

          const { data: batch, error: batchError } = await query
            .order('name')
            .limit(batchSize)
            .range(offset, offset + batchSize - 1);

          if (batchError) {
            console.error('Batch error:', batchError);
            setError('Erreur lors du chargement des entreprises');
            setLoadingMore(false);
            return;
          }

          if (!batch || batch.length === 0) {
            hasMoreBatches = false;
            break;
          }

          allBusinesses = allBusinesses.concat(batch);

          // Update UI progressively after each batch
          setBusinesses([...allBusinesses]);
          setFilteredBusinesses([...allBusinesses]);
          setTotalCount(allBusinesses.length);

          console.log(`📊 CategoryBrowse - Loaded batch: ${batch.length} businesses, Total: ${allBusinesses.length}`);

          // If we got less than batchSize, we've reached the end
          if (batch.length < batchSize) {
            hasMoreBatches = false;
          } else {
            offset += batchSize;
          }
        }

        console.log('📊 CategoryBrowse - All businesses loaded:', allBusinesses.length);
        setLoadingMore(false); // Done loading
      } catch (err) {
        setError('Erreur lors du chargement des entreprises');
        console.error(err);
        setLoadingMore(false);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, [categorySlug, subCategorySlug]);

  // Normalize text by removing accents
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
  };

  // Filter businesses based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBusinesses(businesses);
    } else {
      const normalizedSearch = normalizeText(searchTerm);
      const filtered = businesses.filter(business =>
        normalizeText(business.name).includes(normalizedSearch)
      );
      setFilteredBusinesses(filtered);
    }
  }, [searchTerm, businesses]);


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
          {categoryIcon && (
            <img
              src={categoryIcon}
              alt={displayName}
              className="category-icon-img"
              width="64"
              height="64"
            />
          )}
          <h1>
            {titlePrefix} {displayName}
          </h1>
          <p className="browse-count">
            <strong>{totalCount}</strong> entreprise{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
            {searchTerm && filteredBusinesses.length !== totalCount && (
              <> • <strong>{filteredBusinesses.length}</strong> résultat{filteredBusinesses.length > 1 ? 's' : ''} pour "{searchTerm}"</>
            )}
          </p>

          {/* Search field */}
          <div className="browse-search">
            <input
              type="text"
              placeholder="Rechercher par nom d'entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="browse-search-input"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="browse-search-clear"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="no-results">
            <p>Aucune entreprise trouvée dans cette catégorie</p>
            <Link to="/recherche" className="btn btn-primary">
              Rechercher ailleurs
            </Link>
          </div>
        ) : (
          <div className="business-list-simple">
            {filteredBusinesses.map((business) => {
              // Capitalize only first letter
              const displayName = business.name.charAt(0).toUpperCase() + business.name.slice(1).toLowerCase();

              return (
                <Link
                  key={business.id}
                  to={getBusinessUrl(business)}
                  className="business-list-item"
                >
                  {displayName}
                </Link>
              );
            })}
          </div>
        )}

        {/* Progressive loading indicator */}
        {loadingMore && filteredBusinesses.length > 0 && (
          <div className="loading-more-indicator">
            <div className="spinner-small"></div>
            <span>Chargement en cours... {filteredBusinesses.length} entreprises affichées</span>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryBrowse;
