import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchBusinesses } from '../../services/businessService.js';
import { getMainCategories, getSubCategories } from '../../services/lookupService.js';
import { getAllRegions, getMRCsByRegion, getCitiesByMRC } from '../../data/quebecMunicipalities.js';
import BusinessCard from '../../components/BusinessCard.jsx';
import SearchBar from './SearchBar.jsx';
import SearchFilters from './SearchFilters.jsx';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedMRC, setSelectedMRC] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [regions] = useState(getAllRegions());
  const [mrcs, setMrcs] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

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

  // Update MRCs when region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionMRCs = getMRCsByRegion(selectedRegion);
      setMrcs(regionMRCs);
    } else {
      setMrcs([]);
      setSelectedMRC('');
      setCities([]);
    }
  }, [selectedRegion]);

  // Update cities when MRC changes
  useEffect(() => {
    if (selectedMRC && selectedRegion) {
      const mrcCities = getCitiesByMRC(selectedRegion, selectedMRC);
      setCities(mrcCities);
    } else if (!selectedMRC) {
      setCities([]);
    }
  }, [selectedMRC, selectedRegion]);

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
    if (categories.length === 0 || subCategories.length === 0) return;

    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const region = searchParams.get('region') || '';
    const mrc = searchParams.get('mrc') || '';
    const categorySlug = searchParams.get('category') || '';
    const subcategorySlug = searchParams.get('subcategory') || '';

    setQuery(q);
    setSelectedCity(city);
    setSelectedRegion(region);
    setSelectedMRC(mrc);

    // Convert slugs to IDs for state management
    if (categorySlug) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) setSelectedCategory(cat.id);
    }

    if (subcategorySlug) {
      const subCat = subCategories.find(s => s.slug === subcategorySlug);
      if (subCat) {
        setSelectedCategory(subCat.main_category_id);
        setSelectedSubCategory(subCat.id);
      }
    }

    // Auto-search if params present
    if (q || city || region || mrc || categorySlug || subcategorySlug) {
      performSearch({ q, city, region, mrc, categorySlug, subcategorySlug });
    }

    isInitialMount.current = false;
  }, [categories, subCategories]);

  // INSTANT SEARCH: Trigger search whenever filters change
  useEffect(() => {
    // Skip if still loading initial data or on first mount
    if (categories.length === 0 || subCategories.length === 0 || isInitialMount.current) return;

    // Update URL and trigger search
    updateURLAndSearch();
  }, [selectedRegion, selectedMRC, selectedCity, selectedCategory, selectedSubCategory]);

  const updateURLAndSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedMRC) params.set('mrc', selectedMRC);
    if (selectedRegion) params.set('region', selectedRegion);

    // Convert IDs to slugs for URL
    if (selectedSubCategory) {
      const subCat = subCategories.find(s => s.id === selectedSubCategory);
      if (subCat?.slug) {
        const mainCat = categories.find(c => c.id === subCat.main_category_id);
        if (mainCat?.slug) {
          params.set('category', mainCat.slug);
          params.set('subcategory', subCat.slug);
        }
      }
    } else if (selectedCategory) {
      const mainCat = categories.find(c => c.id === selectedCategory);
      if (mainCat?.slug) {
        params.set('category', mainCat.slug);
      }
    }

    const newURL = params.toString() ? `/recherche?${params.toString()}` : '/recherche';
    navigate(newURL, { replace: true });
    performSearch();
  };

  const performSearch = async (params = {}) => {
    setLoading(true);
    try {
      const searchParams = {
        query: params.q || query,
        city: params.city || selectedCity,
        region: params.region || selectedRegion,
        mrc: params.mrc || selectedMRC,
        limit: 100
      };

      // Add category filter - handle both slugs (from URL) and IDs (from state)
      if (params.subcategorySlug) {
        searchParams.subCategorySlug = params.subcategorySlug;
      } else if (selectedSubCategory) {
        const subCat = subCategories.find(s => s.id === selectedSubCategory);
        if (subCat?.slug) {
          searchParams.subCategorySlug = subCat.slug;
        }
      } else if (params.categorySlug) {
        searchParams.mainCategorySlug = params.categorySlug;
      } else if (selectedCategory) {
        const mainCat = categories.find(c => c.id === selectedCategory);
        if (mainCat?.slug) {
          searchParams.mainCategorySlug = mainCat.slug;
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
    updateURLAndSearch();
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedCity('');
    setSelectedRegion('');
    setSelectedMRC('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setBusinesses([]);
    setTotalResults(0);
    navigate('/recherche');
  };

  const hasActiveFilters = query || selectedCity || selectedRegion || selectedMRC || selectedCategory || selectedSubCategory;

  return (
    <>
      <Helmet>
        <title>Recherche d'entreprises au Québec | Registre du Québec</title>
        <meta name="description" content="Recherchez parmi des milliers d'entreprises québécoises par nom, ville, région ou catégorie" />
      </Helmet>

      <div className="search-page">
        {/* Top Search Bar */}
        <div className="search-header">
          <div className="search-header-content">
            <SearchBar
              query={query}
              setQuery={setQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onSearch={handleSearch}
              loading={loading}
            />
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="search-layout">
          {/* Left: Filters */}
          <aside className="search-filters-sidebar">
            <div className="filters-header">
              <h3>Filtres</h3>
              {hasActiveFilters && (
                <button className="btn-clear-all-filters" onClick={handleClearFilters}>
                  Effacer tout
                </button>
              )}
            </div>

            <SearchFilters
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedMRC={selectedMRC}
              setSelectedMRC={setSelectedMRC}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedSubCategory={selectedSubCategory}
              setSelectedSubCategory={setSelectedSubCategory}
              regions={regions}
              mrcs={mrcs}
              cities={cities}
              categories={categories}
              filteredSubCategories={filteredSubCategories}
              onClear={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>

          {/* Center: Results */}
          <main className="search-results-main">
            {totalResults > 0 && (
              <div className="results-count">
                <strong>{totalResults}</strong> résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
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
                <p>Essayez de modifier vos critères de recherche.</p>
                <button className="btn btn-primary" onClick={handleClearFilters}>
                  Effacer les filtres
                </button>
              </div>
            ) : businesses.length === 0 ? (
              <div className="welcome-state">
                <div className="welcome-icon">🏢</div>
                <h3>Commencez votre recherche</h3>
                <p>Utilisez les filtres pour trouver des entreprises.</p>
              </div>
            ) : (
              <div className="results-list">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </>
  );
};

export default Search;
