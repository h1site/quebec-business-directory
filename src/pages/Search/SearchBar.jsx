import CityAutocomplete from '../../components/CityAutocomplete.jsx';

const SearchBar = ({ query, setQuery, selectedCity, setSelectedCity, onSearch, loading }) => {
  return (
    <form onSubmit={onSearch} className="search-bar">
      <div className="search-inputs">
        <div className="search-input-group">
          <label htmlFor="search-query">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </label>
          <input
            id="search-query"
            type="text"
            placeholder="Nom d'entreprise, service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="search-input-group">
          <label htmlFor="search-city">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </label>
          <CityAutocomplete
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Ville"
            className="search-input"
          />
        </div>

        <button type="submit" className="search-submit" disabled={loading}>
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
