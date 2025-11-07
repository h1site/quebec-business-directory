import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../services/supabaseClient.js';
import { getBusinessUrl } from '../../utils/urlHelpers.js';
import Breadcrumb from '../../components/Breadcrumb.jsx';
import './Browse.css';

const CityBrowse = () => {
  const { citySlug } = useParams();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [cityName, setCityName] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Normalize slug to city name
  const slugToCity = (slug) => {
    const cityMap = {
      'montreal': 'Montréal',
      'quebec': 'Québec',
      'laval': 'Laval',
      'gatineau': 'Gatineau',
      'longueuil': 'Longueuil',
      'sherbrooke': 'Sherbrooke',
      'saguenay': 'Saguenay',
      'levis': 'Lévis',
      'trois-rivieres': 'Trois-Rivières',
      'terrebonne': 'Terrebonne',
      'saint-jean-sur-richelieu': 'Saint-Jean-sur-Richelieu',
      'repentigny': 'Repentigny',
      'brossard': 'Brossard',
      'drummondville': 'Drummondville',
      'granby': 'Granby',
      'saint-jerome': 'Saint-Jérôme',
      'mirabel': 'Mirabel',
      'rimouski': 'Rimouski',
      'vaudreuil-dorion': 'Vaudreuil-Dorion',
      'victoriaville': 'Victoriaville'
    };
    return cityMap[slug] || null;
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);

        // Get city name from slug
        const city = slugToCity(citySlug);

        // If city doesn't exist in our list, show 404
        if (!city) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setCityName(city);

        // Load ALL businesses using cursor-based batch loading (only needed fields for performance)
        let allBusinesses = [];
        const batchSize = 200; // Small batch size to avoid timeout on large cities like Montréal
        let hasMoreBatches = true;

        // First, show loading state but continue loading in background
        setLoading(false); // Show UI immediately
        setLoadingMore(true); // Show progressive loading indicator

        while (hasMoreBatches) {
          // Use cursor-based pagination instead of offset to avoid timeout
          let query = supabase
            .from('businesses_enriched')
            .select('id, name, slug, city, main_category_slug')
            .eq('city', city);

          // Add cursor for subsequent batches
          if (allBusinesses.length > 0) {
            const lastBusiness = allBusinesses[allBusinesses.length - 1];
            query = query.gt('name', lastBusiness.name);
          }

          query = query.order('name').limit(batchSize);

          const { data: batch, error: batchError } = await query;

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

          console.log(`📊 CityBrowse - Loaded batch: ${batch.length} businesses, Total: ${allBusinesses.length}`);

          // If we got less than batchSize, we've reached the end
          if (batch.length < batchSize) {
            hasMoreBatches = false;
          }
        }

        console.log('📊 CityBrowse - All businesses loaded:', allBusinesses.length);
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
  }, [citySlug]);

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
        {/* Breadcrumb Navigation with Schema */}
        <Breadcrumb
          items={[
            { name: 'Accueil', url: '/' },
            { name: 'Villes', url: '/villes' },
            { name: cityName }
          ]}
        />

        <div className="browse-header">
          <h1>
            Entreprises à {cityName}
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
            <p>Aucune entreprise trouvée dans cette ville</p>
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

export default CityBrowse;
