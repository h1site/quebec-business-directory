import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep5_Address = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = t('wizard.step5.addressError');
    }

    if (!formData.city || formData.city.trim().length < 2) {
      newErrors.city = t('wizard.step5.cityError');
    }

    if (!formData.province) {
      newErrors.province = t('wizard.step5.provinceError');
    }

    if (!formData.postal_code) {
      newErrors.postal_code = t('wizard.step5.postalCodeError');
    } else {
      // Canadian postal code format: A1A 1A1
      const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      if (!postalRegex.test(formData.postal_code)) {
        newErrors.postal_code = t('wizard.step5.postalCodeErrorFormat');
      }
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.address, formData.city, formData.province, formData.postal_code, onValidationChange, t]);

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
        <h2>{t('wizard.step5.title')}</h2>
        <p className="step-description">
          {t('wizard.step5.description')}
        </p>
      </div>

      <div className="step-content">
        <div className="form-group">
          <label htmlFor="address" className="form-label required">
            {t('wizard.step5.addressLabel')}
          </label>
          <div className="autocomplete-wrapper">
            <input
              id="address"
              type="text"
              className={`form-input ${errors.address ? 'error' : ''}`}
              value={formData.address || ''}
              onChange={handleAddressChange}
              onPaste={handleAddressChange}
              placeholder={t('wizard.step5.addressPlaceholder')}
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
            {t('wizard.step5.addressHelp')}
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city" className="form-label required">
              {t('wizard.step5.cityLabel')}
            </label>
            <input
              id="city"
              type="text"
              className={`form-input ${errors.city ? 'error' : ''}`}
              value={formData.city || ''}
              onChange={handleCityChange}
              onPaste={handleCityChange}
              placeholder={t('wizard.step5.cityPlaceholder')}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="province" className="form-label required">
              {t('wizard.step5.provinceLabel')}
            </label>
            <select
              id="province"
              className={`form-select ${errors.province ? 'error' : ''}`}
              value={formData.province || 'QC'}
              onChange={handleProvinceChange}
            >
              <option value="QC">{t('wizard.step5.provinces.QC')}</option>
              <option value="ON">{t('wizard.step5.provinces.ON')}</option>
              <option value="BC">{t('wizard.step5.provinces.BC')}</option>
              <option value="AB">{t('wizard.step5.provinces.AB')}</option>
              <option value="MB">{t('wizard.step5.provinces.MB')}</option>
              <option value="SK">{t('wizard.step5.provinces.SK')}</option>
              <option value="NS">{t('wizard.step5.provinces.NS')}</option>
              <option value="NB">{t('wizard.step5.provinces.NB')}</option>
              <option value="PE">{t('wizard.step5.provinces.PE')}</option>
              <option value="NL">{t('wizard.step5.provinces.NL')}</option>
              <option value="YT">{t('wizard.step5.provinces.YT')}</option>
              <option value="NT">{t('wizard.step5.provinces.NT')}</option>
              <option value="NU">{t('wizard.step5.provinces.NU')}</option>
            </select>
            {errors.province && <span className="error-message">{errors.province}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="postal-code" className="form-label required">
            {t('wizard.step5.postalCodeLabel')}
          </label>
          <input
            id="postal-code"
            type="text"
            className={`form-input ${errors.postal_code ? 'error' : ''}`}
            value={formData.postal_code || ''}
            onChange={handlePostalCodeChange}
            onPaste={handlePostalCodeChange}
            placeholder={t('wizard.step5.postalCodePlaceholder')}
            maxLength={7}
          />
          {errors.postal_code && <span className="error-message">{errors.postal_code}</span>}
          <span className="help-text">
            {t('wizard.step5.postalCodeHelp')}
          </span>
        </div>

        {/* Toggle pour afficher/cacher l'adresse */}
        <div className="form-group" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9ff', borderRadius: '12px', border: '1px solid #e6e9f0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <input
              id="show_address"
              type="checkbox"
              checked={formData.show_address !== false}
              onChange={(e) => updateFormData({ show_address: e.target.checked })}
              style={{ marginTop: '0.25rem', width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <label htmlFor="show_address" style={{ fontWeight: 600, color: '#1e3a8a', cursor: 'pointer', display: 'block', marginBottom: '0.5rem' }}>
                {t('wizard.step5.showAddressLabel')}
              </label>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#4b5563', lineHeight: '1.6' }}>
                {t('wizard.step5.showAddressHelp')}
              </p>
              {formData.show_address === false && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#92400e' }}>
                    ⚠️ {t('wizard.step5.showAddressWarning')}
                  </span>
                </div>
              )}
            </div>
          </div>
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
