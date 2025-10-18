import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { quebecCities, searchCities } from '../data/quebecCities.js';
import './CitySelect.css';

const CitySelect = ({ value, onChange, error, required = false, placeholder = 'Sélectionnez une ville' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState(quebecCities);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    const results = searchCities(searchTerm);
    setFilteredCities(results);
    setHighlightedIndex(-1);
  }, [searchTerm]);

  const handleInputClick = () => {
    setIsOpen(true);
    setSearchTerm('');
    setFilteredCities(quebecCities);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleCitySelect = (city) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredCities[highlightedIndex]) {
          handleCitySelect(filteredCities[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
      default:
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const displayValue = isOpen ? searchTerm : value || '';

  return (
    <div className={`city-select ${error ? 'has-error' : ''}`} ref={dropdownRef}>
      <div className="city-select-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={value || placeholder}
          className={`city-select-input ${error ? 'error' : ''}`}
          autoComplete="off"
        />
        <svg
          className={`city-select-arrow ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          onClick={handleInputClick}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="city-select-dropdown">
          {filteredCities.length > 0 ? (
            <ul className="city-select-list">
              {filteredCities.map((city, index) => (
                <li
                  key={city}
                  data-index={index}
                  className={`city-select-item ${
                    index === highlightedIndex ? 'highlighted' : ''
                  } ${city === value ? 'selected' : ''}`}
                  onClick={() => handleCitySelect(city)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {city}
                </li>
              ))}
            </ul>
          ) : (
            <div className="city-select-no-results">
              Aucune ville trouvée pour "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {error && <span className="city-select-error">{error}</span>}
    </div>
  );
};

CitySelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string
};

export default CitySelect;
