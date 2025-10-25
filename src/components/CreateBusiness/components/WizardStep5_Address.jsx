import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './WizardStep.css';

const WizardStep5_Address = ({ formData, updateFormData, onValidationChange }) => {
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = 'L\'adresse doit contenir au moins 5 caractères';
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = 'La ville est requise';
    }

    if (!formData.province) {
      newErrors.province = 'La province est requise';
    }

    if (!formData.postal_code) {
      newErrors.postal_code = 'Le code postal est requis';
    } else {
      // Canadian postal code format: A1A 1A1
      const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      if (!postalRegex.test(formData.postal_code)) {
        newErrors.postal_code = 'Code postal invalide (format: A1A 1A1)';
      }
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.address, formData.city, formData.province, formData.postal_code, onValidationChange]);

  const handleAddressChange = (e) => {
    const value = e.target.value;
    updateFormData({ address: value });

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Search with debounce (wait 500ms after user stops typing)
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchAddress(value);
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const searchAddress = async (query) => {
    setIsSearching(true);
    try {
      // Nominatim API (OpenStreetMap) - 100% gratuit
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=ca&` +
        `addressdetails=1&` +
        `limit=5`,
        {
          headers: {
            'User-Agent': 'QuebecBusinessDirectory/1.0'
          }
        }
      );

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error('Error searching address:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectAddress = (suggestion) => {
    const addr = suggestion.address || {};

    // Extract components
    const houseNumber = addr.house_number || '';
    const road = addr.road || '';
    const street = `${houseNumber} ${road}`.trim();
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const province = addr.state || '';
    const postalCode = addr.postcode || '';

    // Map province names to abbreviations
    const provinceMap = {
      'Quebec': 'QC',
      'Québec': 'QC',
      'Ontario': 'ON',
      'British Columbia': 'BC',
      'Alberta': 'AB',
      'Manitoba': 'MB',
      'Saskatchewan': 'SK',
      'Nova Scotia': 'NS',
      'New Brunswick': 'NB',
      'Prince Edward Island': 'PE',
      'Newfoundland and Labrador': 'NL',
      'Yukon': 'YT',
      'Northwest Territories': 'NT',
      'Nunavut': 'NU'
    };

    const provinceAbbr = provinceMap[province] || province;

    // Format postal code (add space if missing)
    let formattedPostal = postalCode.toUpperCase().replace(/\s/g, '');
    if (formattedPostal.length === 6) {
      formattedPostal = formattedPostal.slice(0, 3) + ' ' + formattedPostal.slice(3);
    }

    updateFormData({
      address: street,
      city: city,
      province: provinceAbbr,
      postal_code: formattedPostal
    });

    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCityChange = (e) => {
    updateFormData({ city: e.target.value });
  };

  const handleProvinceChange = (e) => {
    updateFormData({ province: e.target.value });
  };

  const handlePostalCodeChange = (e) => {
    let value = e.target.value.toUpperCase();
    // Auto-format postal code with space
    if (value.length === 3 && !value.includes(' ')) {
      value = value + ' ';
    }
    updateFormData({ postal_code: value });
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>Adresse</h2>
        <p className="step-description">
          Où se trouve votre entreprise ? Utilisez l'auto-complétion gratuite pour remplir rapidement.
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="address" className="form-label required">
            Adresse civique <span className="badge-autocomplete">✨ Auto-complétion gratuite</span>
          </label>
          <div className="autocomplete-wrapper">
            <input
              id="address"
              type="text"
              className={`form-input ${errors.address ? 'error' : ''}`}
              value={formData.address || ''}
              onChange={handleAddressChange}
              placeholder="Commencez à taper votre adresse..."
              autoComplete="off"
            />
            {isSearching && (
              <div className="autocomplete-loading">
                <div className="spinner-small"></div>
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="autocomplete-suggestions">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => selectAddress(suggestion)}
                  >
                    <div className="suggestion-icon">📍</div>
                    <div className="suggestion-text">
                      <div className="suggestion-main">{suggestion.display_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.address && <span className="error-message">{errors.address}</span>}
          <span className="help-text">
            💡 Tapez votre adresse et sélectionnez-la dans la liste pour remplir automatiquement tous les champs
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city" className="form-label required">
              Ville
            </label>
            <input
              id="city"
              type="text"
              className={`form-input ${errors.city ? 'error' : ''}`}
              value={formData.city || ''}
              onChange={handleCityChange}
              placeholder="Montréal"
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="province" className="form-label required">
              Province
            </label>
            <select
              id="province"
              className={`form-select ${errors.province ? 'error' : ''}`}
              value={formData.province || 'QC'}
              onChange={handleProvinceChange}
            >
              <option value="QC">Québec</option>
              <option value="ON">Ontario</option>
              <option value="BC">Colombie-Britannique</option>
              <option value="AB">Alberta</option>
              <option value="MB">Manitoba</option>
              <option value="SK">Saskatchewan</option>
              <option value="NS">Nouvelle-Écosse</option>
              <option value="NB">Nouveau-Brunswick</option>
              <option value="PE">Île-du-Prince-Édouard</option>
              <option value="NL">Terre-Neuve-et-Labrador</option>
              <option value="YT">Yukon</option>
              <option value="NT">Territoires du Nord-Ouest</option>
              <option value="NU">Nunavut</option>
            </select>
            {errors.province && <span className="error-message">{errors.province}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="postal-code" className="form-label required">
            Code postal
          </label>
          <input
            id="postal-code"
            type="text"
            className={`form-input ${errors.postal_code ? 'error' : ''}`}
            value={formData.postal_code || ''}
            onChange={handlePostalCodeChange}
            placeholder="H1A 1A1"
            maxLength={7}
          />
          {errors.postal_code && <span className="error-message">{errors.postal_code}</span>}
          <span className="help-text">
            Format canadien: A1A 1A1
          </span>
        </div>
      </div>
    </div>
  );
};

WizardStep5_Address.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep5_Address;
