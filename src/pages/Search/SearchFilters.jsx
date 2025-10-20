import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <div className="search-filters">
      {/* Region Filter */}
      <div className="filter-group">
        <label htmlFor="filter-region">{t('search.region')}</label>
        <select
          id="filter-region"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('search.allRegions')}</option>
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
          <label htmlFor="filter-mrc">{t('search.mrc')}</label>
          <select
            id="filter-mrc"
            value={selectedMRC}
            onChange={(e) => setSelectedMRC(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('search.allMRCs')}</option>
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
          <label htmlFor="filter-city">{t('search.city')}</label>
          <select
            id="filter-city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('search.allCities')}</option>
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
        <label htmlFor="filter-category">{t('search.category')}</label>
        <select
          id="filter-category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">{t('search.allCategories')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {currentLanguage === 'en' ? cat.label_en : cat.label_fr}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Filter - Only shows when category is selected */}
      {filteredSubCategories.length > 0 && (
        <div className="filter-group">
          <label htmlFor="filter-subcategory">{t('search.subCategory')}</label>
          <select
            id="filter-subcategory"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('search.allSubCategories')}</option>
            {filteredSubCategories.map((subCat) => (
              <option key={subCat.id} value={subCat.id}>
                {currentLanguage === 'en' ? subCat.label_en : subCat.label_fr}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
