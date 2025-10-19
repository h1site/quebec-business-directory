import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BusinessCard from '../components/BusinessCard.jsx';
import CityAutocompleteQuebec from '../components/CityAutocompleteQuebec.jsx';
import { searchBusinesses } from '../services/businessService.js';
import { getAllRegions, getMRCsByRegion } from '../data/quebecMunicipalities.js';
import {
  getMainCategories,
  getSubCategories,
  getBusinessSizes,
  getServiceLanguages,
  getServiceModes
} from '../services/lookupService.js';

const initialFilters = {
  q: '',
  city: '',
  region: '',
  mrc: '',
  category: '',
  phone: '',
  distance: '',
  language: '',
  serviceMode: '',
  businessSize: ''
};

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const SearchResults = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const query = useQuery();
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allRegions] = useState(getAllRegions());
  const [mrcsInSelectedRegion, setMrcsInSelectedRegion] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [businessSizes, setBusinessSizes] = useState([]);
  const [serviceLanguages, setServiceLanguages] = useState([]);
  const [serviceModes, setServiceModes] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [isSyncingFromUrl, setIsSyncingFromUrl] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load all lookup data on mount
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        const [mainCatsResult, subCatsResult, sizesResult, langsResult, modesResult] = await Promise.all([
          getMainCategories(),
          getSubCategories(),
          getBusinessSizes(),
          getServiceLanguages(),
          getServiceModes()
        ]);
        setMainCategories(mainCatsResult.data || []);
        setSubCategories(subCatsResult.data || []);
        setBusinessSizes(sizesResult.data || []);
        setServiceLanguages(langsResult.data || []);
        setServiceModes(modesResult.data || []);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error('Error loading lookup data:', error);
        setCategoriesLoaded(true); // Mark as loaded even on error
      }
    };
    loadLookupData();
  }, []);

  // Update MRCs when region changes
  useEffect(() => {
    if (filters.region) {
      const mrcs = getMRCsByRegion(filters.region);
      setMrcsInSelectedRegion(mrcs);
    } else {
      setMrcsInSelectedRegion([]);
      // Clear MRC if no region selected
      if (filters.mrc) {
        setFilters(prev => ({ ...prev, mrc: '' }));
      }
    }
  }, [filters.region, filters.mrc]);

  // Sync URL params to filters and perform search
  useEffect(() => {
    const q = query.get('q') ?? '';
    const city = query.get('city') ?? '';
    const region = query.get('region') ?? '';
    const mrc = query.get('mrc') ?? '';
    const category = query.get('category') ?? '';
    const subcategory = query.get('subcategory') ?? '';
    const phone = query.get('phone') ?? '';
    const language = query.get('language') ?? '';
    const serviceMode = query.get('serviceMode') ?? '';
    const businessSize = query.get('businessSize') ?? '';

    // Use subcategory if available, otherwise use category
    const categoryFilter = subcategory || category;

    setIsSyncingFromUrl(true);
    setFilters((prev) => ({
      ...prev,
      q,
      city,
      region,
      mrc,
      category: categoryFilter,
      phone,
      language,
      serviceMode,
      businessSize
    }));

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: serviceError } = await searchBusinesses({
        query: q,
        city,
        region,
        mrc,
        category: categoryFilter,
        phone,
        language,
        serviceMode,
        businessSize
      });
      if (serviceError) {
        setError(serviceError.message);
      } else {
        const formatted = data?.map((item) => ({
          ...item,
          categories: Array.isArray(item.categories) ? item.categories : []
        }));
        setResults(formatted ?? []);
      }
      setLoading(false);
      // Reset sync flag after a short delay to allow state to settle
      setTimeout(() => setIsSyncingFromUrl(false), 100);
    };

    fetchData();
  }, [query]);

  // Update URL when filters change manually (not from URL sync)
  useEffect(() => {
    // Skip if we're syncing from URL to prevent infinite loop
    if (isSyncingFromUrl) return;

    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.city) params.set('city', filters.city);
    if (filters.region) params.set('region', filters.region);
    if (filters.mrc) params.set('mrc', filters.mrc);
    if (filters.category) params.set('category', filters.category);
    if (filters.phone) params.set('phone', filters.phone);
    if (filters.distance) params.set('distance', filters.distance);
    if (filters.language) params.set('language', filters.language);
    if (filters.serviceMode) params.set('serviceMode', filters.serviceMode);
    if (filters.businessSize) params.set('businessSize', filters.businessSize);

    const newSearch = params.toString();
    const currentSearch = window.location.search.substring(1);

    // Only update if URL actually changed
    if (newSearch !== currentSearch) {
      const newPath = newSearch ? `/recherche?${newSearch}` : '/recherche';
      navigate(newPath, { replace: true });
    }
  }, [filters, navigate, isSyncingFromUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setShowAdvancedFilters(false);
    // useEffect will automatically trigger search when filters change
  };

  // Show loading state while lookup data is being loaded
  if (!categoriesLoaded) {
    return (
      <section className="container" style={{ padding: '3rem 0' }}>
        <div className="loading-spinner">
          <p>Chargement...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container" style={{ padding: '3rem 0' }}>
      <h1>{t('search.resultsTitle')}</h1>
      <div className="search-layout">
        <aside className="filter-panel">
          <h3>{t('search.filters')}</h3>
          <form className="form" onSubmit={handleSubmit}>
            {/* Basic Filters */}
            <div className="form-group">
              <label htmlFor="q">{t('hero.whatPlaceholder')}</label>
              <input name="q" value={filters.q} onChange={handleChange} id="q" placeholder="Nom, mot-clé..." />
            </div>

            <div className="form-group">
              <label htmlFor="region">Région</label>
              <select
                name="region"
                value={filters.region}
                onChange={handleChange}
                id="region"
              >
                <option value="">Toutes les régions</option>
                {allRegions.map((region) => (
                  <option key={region.slug} value={region.slug}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {filters.region && mrcsInSelectedRegion.length > 0 && (
              <div className="form-group">
                <label htmlFor="mrc">MRC</label>
                <select
                  name="mrc"
                  value={filters.mrc}
                  onChange={handleChange}
                  id="mrc"
                >
                  <option value="">Toutes les MRCs</option>
                  {mrcsInSelectedRegion.map((mrc) => (
                    <option key={mrc.slug} value={mrc.name}>
                      {mrc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="city">{t('search.city')}</label>
              <CityAutocompleteQuebec
                value={filters.city}
                onChange={(city) => setFilters((prev) => ({ ...prev, city }))}
                placeholder="Rechercher une ville..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">{t('search.category')}</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleChange}
                id="category"
              >
                <option value="">Toutes les catégories</option>
                {mainCategories.map((mainCat) => {
                  const subs = subCategories.filter(sub => sub.main_category_id === mainCat.id);
                  return (
                    <optgroup key={mainCat.id} label={i18n.language === 'en' ? mainCat.label_en : mainCat.label_fr}>
                      <option value={mainCat.slug}>
                        {i18n.language === 'en' ? mainCat.label_en : mainCat.label_fr} (tous)
                      </option>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.slug}>
                          → {i18n.language === 'en' ? sub.label_en : sub.label_fr}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className="language-toggle"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                style={{ width: '100%', background: '#2563eb', color: '#ffffff' }}
              >
                {showAdvancedFilters ? '▲ Masquer filtres avancés' : '▼ Afficher filtres avancés'}
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <>
                <div className="form-group">
                  <label htmlFor="language">Langue de service</label>
                  <select
                    name="language"
                    value={filters.language}
                    onChange={handleChange}
                    id="language"
                  >
                    <option value="">Toutes les langues</option>
                    {serviceLanguages.map((lang) => (
                      <option key={lang.id} value={lang.code}>
                        {i18n.language === 'en' ? lang.label_en : lang.label_fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="serviceMode">Mode de service</label>
                  <select
                    name="serviceMode"
                    value={filters.serviceMode}
                    onChange={handleChange}
                    id="serviceMode"
                  >
                    <option value="">Tous les modes</option>
                    {serviceModes.map((mode) => (
                      <option key={mode.id} value={mode.key}>
                        {i18n.language === 'en' ? mode.label_en : mode.label_fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="businessSize">Taille d'entreprise</label>
                  <select
                    name="businessSize"
                    value={filters.businessSize}
                    onChange={handleChange}
                    id="businessSize"
                  >
                    <option value="">Toutes les tailles</option>
                    {businessSizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {i18n.language === 'en' ? size.label_en : size.label_fr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">{t('search.telephone')}</label>
                  <input name="phone" value={filters.phone} onChange={handleChange} id="phone" placeholder="514-555-..." />
                </div>

                <div className="form-group">
                  <label htmlFor="distance">{t('search.distance')} (km)</label>
                  <input
                    name="distance"
                    value={filters.distance}
                    onChange={handleChange}
                    id="distance"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ex: 25"
                  />
                </div>
              </>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="language-toggle"
                onClick={handleReset}
                style={{ width: '100%' }}
              >
                {t('search.clearFilters')}
              </button>
            </div>
          </form>
        </aside>
        <section style={{ display: 'grid', gap: '1.5rem' }}>
          {loading && <p>Chargement des résultats...</p>}
          {error && (
            <div className="alert" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              {error}
            </div>
          )}
          {!loading && results.length === 0 && <p>{t('search.noResults')}</p>}
          {!loading && results.length > 0 && (
            <div style={{ marginBottom: '1rem', fontSize: '0.95rem', color: '#6b7280' }}>
              {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
            </div>
          )}
          {results.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </section>
      </div>
    </section>
  );
};

export default SearchResults;
