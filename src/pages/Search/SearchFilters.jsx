const SearchFilters = ({
  selectedRegion,
  setSelectedRegion,
  selectedMRC,
  setSelectedMRC,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  regions,
  mrcs,
  cities,
  categories,
  filteredSubCategories
}) => {
  return (
    <div className="search-filters">
      {/* Region Filter */}
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

      {/* MRC Filter - Only shows when region is selected */}
      {selectedRegion && mrcs.length > 0 && (
        <div className="filter-group">
          <label htmlFor="filter-mrc">MRC</label>
          <select
            id="filter-mrc"
            value={selectedMRC}
            onChange={(e) => setSelectedMRC(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les MRC</option>
            {mrcs.map((mrc) => (
              <option key={mrc.slug} value={mrc.slug}>
                {mrc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* City Filter - Only shows when MRC is selected */}
      {selectedMRC && cities.length > 0 && (
        <div className="filter-group">
          <label htmlFor="filter-city">Ville</label>
          <select
            id="filter-city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les villes</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Filter */}
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

      {/* Subcategory Filter - Only shows when category is selected */}
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
  );
};

export default SearchFilters;
