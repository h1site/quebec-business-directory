const SearchFilters = ({
  selectedRegion,
  setSelectedRegion,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  regions,
  categories,
  filteredSubCategories,
  onClear,
  hasActiveFilters
}) => {
  return (
    <div className="search-filters">
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="filter-region">Région</label>
          <select
            id="filter-region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les régions</option>
            {regions.map((region) => (
              <option key={region.slug} value={region.slug}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-category">Catégorie</label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label_fr}
              </option>
            ))}
          </select>
        </div>

        {filteredSubCategories.length > 0 && (
          <div className="filter-group">
            <label htmlFor="filter-subcategory">Sous-catégorie</label>
            <select
              id="filter-subcategory"
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">Toutes les sous-catégories</option>
              {filteredSubCategories.map((subCat) => (
                <option key={subCat.id} value={subCat.id}>
                  {subCat.label_fr}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn-clear-all" onClick={onClear}>
          Effacer tous les filtres
        </button>
      )}
    </div>
  );
};

export default SearchFilters;
