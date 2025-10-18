import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { quebecCities, searchCities } from '../data/quebecCities.js';
import './CityAutocomplete.css';

const CityAutocomplete = ({ value, onChange, placeholder, className }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.trim().length > 0) {
      const results = searchCities(newValue);
      setSuggestions(results.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Call parent onChange
    onChange(newValue);
  };

  const handleSuggestionClick = (city) => {
    setInputValue(city);
    setShowSuggestions(false);
    onChange(city);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleFocus = () => {
    if (inputValue.trim().length > 0) {
      const results = searchCities(inputValue);
      setSuggestions(results.slice(0, 10));
      setShowSuggestions(true);
    }
  };

  return (
    <div className="city-autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="search"
        className={className}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="city-autocomplete-suggestions">
          {suggestions.map((city, index) => (
            <li
              key={city}
              className={`city-autocomplete-item ${
                index === highlightedIndex ? 'highlighted' : ''
              }`}
              onClick={() => handleSuggestionClick(city)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

CityAutocomplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

CityAutocomplete.defaultProps = {
  value: '',
  placeholder: 'Entrez une ville',
  className: ''
};

export default CityAutocomplete;
