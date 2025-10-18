import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BusinessCard from '../components/BusinessCard.jsx';
import CityAutocompleteQuebec from '../components/CityAutocompleteQuebec.jsx';
import { searchBusinesses } from '../services/businessService.js';
import { getAllRegions, getCitiesByRegion } from '../data/quebecMunicipalities.js';
import { getMainCategories, getSubCategories } from '../services/lookupService.js';

const initialFilters = {
  q: '',
  city: '',
  region: '',
  category: '',
  phone: '',
  distance: ''
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
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [mainCatsResult, subCatsResult] = await Promise.all([
          getMainCategories(),
          getSubCategories()
        ]);
        setMainCategories(mainCatsResult.data || []);
        setSubCategories(subCatsResult.data || []);
        setCategoriesLoaded(true);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategoriesLoaded(true); // Mark as loaded even on error
      }
    };
    loadCategories();
  }, []);

  // Sync URL params to filters and perform search
  useEffect(() => {
    const q = query.get('q') ?? '';
    const city = query.get('city') ?? '';
    const region = query.get('region') ?? '';
    const category = query.get('category') ?? '';
    const subcategory = query.get('subcategory') ?? '';
    const phone = query.get('phone') ?? '';

    // Use subcategory if available, otherwise use category
    const categoryFilter = subcategory || category;

    setFilters((prev) => ({
      ...prev,
      q,
      city,
      region,
      category: categoryFilter,
      phone
    }));

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: serviceError } = await searchBusinesses({
        query: q,
        city,
        region,
        category: categoryFilter,
        phone
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
    };

    fetchData();
  }, [query]);

  // Update URL when filters change manually
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.city) params.set('city', filters.city);
    if (filters.region) params.set('region', filters.region);
    if (filters.category) params.set('category', filters.category);
    if (filters.phone) params.set('phone', filters.phone);
    if (filters.distance) params.set('distance', filters.distance);

    const newSearch = params.toString();
    const currentSearch = window.location.search.substring(1);

    // Only update if URL actually changed
    if (newSearch !== currentSearch) {
      const newPath = newSearch ? `/recherche?${newSearch}` : '/recherche';
      navigate(newPath, { replace: true });
    }
  }, [filters, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  const handleReset = () => {
    setFilters(initialFilters);
    // useEffect will automatically trigger search when filters change
  };

  // Show loading state while categories are being loaded
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
            <div className="form-group">
              <label htmlFor="q">{t('hero.whatPlaceholder')}</label>
              <input name="q" value={filters.q} onChange={handleChange} id="q" />
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
            <div className="form-group">
              <label htmlFor="phone">{t('search.telephone')}</label>
              <input name="phone" value={filters.phone} onChange={handleChange} id="phone" />
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
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
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
          {results.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </section>
      </div>
    </section>
  );
};

export default SearchResults;
