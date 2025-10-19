import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchBusinesses } from '../../services/businessService.js';
import { getMainCategories, getSubCategories } from '../../services/lookupService.js';
import { getAllRegions } from '../../data/quebecMunicipalities.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import SearchBar from './SearchBar.jsx';
import SearchFilters from './SearchFilters.jsx';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [regions] = useState(getAllRegions());
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const [showFilters, setShowFilters] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const [mainCats, subCats] = await Promise.all([
        getMainCategories(),
        getSubCategories()
      ]);
      setCategories(mainCats.data || []);
      setSubCategories(subCats.data || []);
    };
    loadCategories();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategory && subCategories.length > 0) {
      const filtered = subCategories.filter(
        sub => sub.main_category_id === selectedCategory
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
      setSelectedSubCategory('');
    }
  }, [selectedCategory, subCategories]);

  // Sync with URL parameters on mount
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const region = searchParams.get('region') || '';
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';

    setQuery(q);
    setSelectedCity(city);
    setSelectedRegion(region);
    setSelectedCategory(category);
    setSelectedSubCategory(subcategory);

    // Auto-search if params present
    if (q || city || region || category || subcategory) {
      performSearch({ q, city, region, category, subcategory });
    }
  }, []);

  const performSearch = async (params = {}) => {
    setLoading(true);
    try {
      const searchParams = {
        query: params.q || query,
        city: params.city || selectedCity,
        region: params.region || selectedRegion,
        limit: 50
      };

      // Add category filter if present
      if (params.subcategory || selectedSubCategory) {
        // Search by subcategory slug
        const subCat = subCategories.find(s => s.id === (params.subcategory || selectedSubCategory));
        if (subCat) {
          searchParams.category = subCat.label_fr;
        }
      } else if (params.category || selectedCategory) {
        // Search by main category
        const mainCat = categories.find(c => c.id === (params.category || selectedCategory));
        if (mainCat) {
          searchParams.category = mainCat.label_fr;
        }
      }

      const { data, error } = await searchBusinesses(searchParams);

      if (error) {
        console.error('Search error:', error);
        setBusinesses([]);
        setTotalResults(0);
        return;
      }

      setBusinesses(data || []);
      setTotalResults(data?.length || 0);
    } catch (error) {
      console.error('Search error:', error);
      setBusinesses([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Update URL with search params
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedSubCategory) params.set('subcategory', selectedSubCategory);

    navigate(`/recherche?${params.toString()}`);
    performSearch();
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCity('');
    setSelectedRegion('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setBusinesses([]);
    setTotalResults(0);
    navigate('/recherche');
  };

  const hasActiveFilters = query || selectedCity || selectedRegion || selectedCategory || selectedSubCategory;

  return (
    <>
      <Helmet>
        <title>Recherche d'entreprises au Québec | Registre du Québec</title>
        <meta name="description" content="Recherchez parmi des milliers d'entreprises québécoises par nom, ville, région ou catégorie" />
      </Helmet>

      <div className="search-page">
        <div className="search-hero">
          <div className="container">
            <h1>Recherche d'entreprises</h1>
            <p className="search-subtitle">Trouvez l'entreprise qu'il vous faut parmi des milliers d'établissements au Québec</p>

            <SearchBar
              query={query}
              setQuery={setQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onSearch={handleSearch}
              loading={loading}
            />

            <button
              type="button"
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '▲ Masquer les filtres' : '▼ Afficher les filtres'}
            </button>

            {showFilters && (
              <SearchFilters
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                regions={regions}
                categories={categories}
                filteredSubCategories={filteredSubCategories}
                onClear={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </div>
        </div>

        <div className="container search-results-container">
          {totalResults > 0 && (
            <div className="results-header">
              <h2>{totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}</h2>
              {hasActiveFilters && (
                <button className="btn-clear-filters" onClick={handleClearFilters}>
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Recherche en cours...</p>
            </div>
          ) : businesses.length === 0 && hasActiveFilters ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Aucun résultat trouvé</h3>
              <p>Essayez de modifier vos critères de recherche ou de supprimer certains filtres.</p>
              <button className="btn btn-primary" onClick={handleClearFilters}>
                Réinitialiser la recherche
              </button>
            </div>
          ) : businesses.length === 0 ? (
            <div className="welcome-state">
              <div className="welcome-icon">🏢</div>
              <h3>Commencez votre recherche</h3>
              <p>Utilisez la barre de recherche ci-dessus pour trouver des entreprises par nom, ville ou région.</p>
              <p>Vous pouvez également parcourir par catégorie ou affiner votre recherche avec les filtres.</p>
            </div>
          ) : (
            <div className="business-grid">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
