import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BusinessCard from '../components/BusinessCard.jsx';
import { searchBusinesses } from '../services/businessService.js';

const initialFilters = {
  q: '',
  city: '',
  category: '',
  phone: '',
  distance: ''
};

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const SearchResults = () => {
  const { t } = useTranslation();
  const query = useQuery();
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query.get('q') ?? '';
    const city = query.get('city') ?? '';
    const category = query.get('category') ?? '';
    const phone = query.get('phone') ?? '';

    setFilters((prev) => ({ ...prev, q, city, category, phone }));

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data, error: serviceError } = await searchBusinesses({
        query: q,
        city,
        category,
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: serviceError } = await searchBusinesses({
      query: filters.q,
      city: filters.city,
      category: filters.category,
      phone: filters.phone,
      distance: filters.distance
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

  const handleReset = () => {
    setFilters(initialFilters);
    searchBusinesses({}).then(({ data }) => {
      const formatted = data?.map((item) => ({
        ...item,
        categories: Array.isArray(item.categories) ? item.categories : []
      }));
      setResults(formatted ?? []);
    });
  };

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
              <label htmlFor="city">{t('search.city')}</label>
              <input name="city" value={filters.city} onChange={handleChange} id="city" />
            </div>
            <div className="form-group">
              <label htmlFor="category">{t('search.category')}</label>
              <input
                name="category"
                value={filters.category}
                onChange={handleChange}
                id="category"
              />
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="primary-button" disabled={loading}>
                {t('search.applyFilters')}
              </button>
              <button type="button" className="language-toggle" onClick={handleReset}>
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
