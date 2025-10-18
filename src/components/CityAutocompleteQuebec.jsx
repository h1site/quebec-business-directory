import { useState, useEffect, useRef } from 'react';
import { searchCities, getCityInfo } from '../data/quebecMunicipalities.js';
import './CityAutocompleteQuebec.css';

const CityAutocompleteQuebec = ({
  value = '',
  onChange,
  placeholder = 'Rechercher une ville...',
  error = null,
  required = false,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.length >= 1) {
      const results = searchCities(newValue, 15);
      setSuggestions(results);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    // If input is empty, clear the selection
    if (newValue === '') {
      onChange('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.city);
    onChange(suggestion.city);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    // Validate city on blur
    if (inputValue && inputValue.length >= 1) {
      const cityInfo = getCityInfo(inputValue);
      if (!cityInfo) {
        // City not found, try to find closest match
        const results = searchCities(inputValue, 1);
        if (results.length > 0 && results[0].score > 50) {
          // Auto-correct to closest match if score is high enough
          setInputValue(results[0].city);
          onChange(results[0].city);
        }
      }
    }
  };

  // Get city context information (MRC and Region)
  const getCityContext = () => {
    if (!inputValue) return null;
    const info = getCityInfo(inputValue);
    if (info) {
      return (
        <div className="city-context">
          <span className="context-mrc">{info.mrc}</span>
          <span className="context-separator">•</span>
          <span className="context-region">{info.region}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`city-autocomplete-wrapper ${className}`} ref={wrapperRef}>
      <div className="city-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`city-input ${error ? 'error' : ''}`}
          required={required}
          autoComplete="off"
        />
        {getCityContext()}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="city-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.regionSlug}-${suggestion.mrcSlug}-${suggestion.city}`}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur
                handleSuggestionClick(suggestion);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-city">{suggestion.city}</div>
              <div className="suggestion-details">
                <span className="suggestion-mrc">{suggestion.mrc}</span>
                <span className="suggestion-separator">•</span>
                <span className="suggestion-region">{suggestion.region}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <div className="city-error">{error}</div>}
    </div>
  );
};

export default CityAutocompleteQuebec;
