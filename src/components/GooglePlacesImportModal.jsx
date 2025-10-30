import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './GooglePlacesImportModal.css';

const GooglePlacesImportModal = ({ isOpen, onClose, onImport, businessName, businessAddress, businessCity }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(`${businessName}, ${businessAddress}, ${businessCity}, Québec`);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    setSearchResults([]);
    setSelectedPlace(null);

    try {
      const response = await fetch('/api/google-places-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text) {
        throw new Error('API endpoint non disponible. Assurez-vous que le serveur API est déployé.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        throw new Error('Réponse invalide du serveur. Le endpoint API n\'est peut-être pas déployé sur Vercel.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche');
      }

      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
      } else {
        setError('Aucun résultat trouvé. Essayez de modifier votre recherche.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
  };

  const handleConfirmImport = async () => {
    if (!selectedPlace) return;

    setImporting(true);
    setError(null);

    try {
      await onImport(selectedPlace.place_id);
      onClose();
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (!importing) {
      setSearchQuery(`${businessName}, ${businessAddress}, ${businessCity}, Québec`);
      setSearchResults([]);
      setSelectedPlace(null);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content gmb-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🌐 Importer depuis Google My Business</h2>
          <button className="modal-close" onClick={handleClose} disabled={importing}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="gmb-import-info">
            <p><strong>📋 Données qui seront importées:</strong></p>
            <ul>
              <li>📞 <strong>Téléphone</strong> (seulement si déjà présent sur la fiche)</li>
              <li>⭐ <strong>Avis Google</strong> (tous les avis disponibles)</li>
              <li>📸 <strong>Photos</strong> (maximum 10 images)</li>
              <li>🕒 <strong>Heures d'ouverture</strong> (Google = master, écrase les horaires existants)</li>
            </ul>
          </div>

          <div className="gmb-search-section">
            <label htmlFor="gmb-search">
              <strong>🔍 Rechercher l'entreprise sur Google Places</strong>
            </label>
            <p className="field-hint">
              Modifiez la recherche si nécessaire pour trouver la bonne fiche Google.
            </p>
            <div className="gmb-search-input-group">
              <input
                type="text"
                id="gmb-search"
                className="gmb-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nom de l'entreprise, adresse, ville..."
                disabled={searching || importing}
              />
              <button
                className="btn btn-primary gmb-search-btn"
                onClick={handleSearch}
                disabled={searching || importing || !searchQuery.trim()}
              >
                {searching ? '🔄 Recherche...' : '🔍 Rechercher'}
              </button>
            </div>
          </div>

          {error && (
            <div className="gmb-error-message">
              ⚠️ {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="gmb-results-section">
              <h3>📍 Résultats de recherche ({searchResults.length})</h3>
              <p className="field-hint">Sélectionnez la fiche correspondant à votre entreprise:</p>
              <div className="gmb-results-list">
                {searchResults.map((result) => (
                  <div
                    key={result.place_id}
                    className={`gmb-result-item ${selectedPlace?.place_id === result.place_id ? 'selected' : ''}`}
                    onClick={() => handleSelectPlace(result)}
                  >
                    <div className="gmb-result-header">
                      <input
                        type="radio"
                        name="selected-place"
                        checked={selectedPlace?.place_id === result.place_id}
                        onChange={() => handleSelectPlace(result)}
                        disabled={importing}
                      />
                      <strong>{result.name}</strong>
                    </div>
                    <p className="gmb-result-address">{result.formatted_address}</p>
                    {result.rating && (
                      <p className="gmb-result-rating">
                        ⭐ {result.rating}/5 ({result.user_ratings_total || 0} avis)
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={importing}
          >
            Annuler
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirmImport}
            disabled={!selectedPlace || importing}
          >
            {importing ? '⏳ Importation en cours...' : '✅ Importer les données'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GooglePlacesImportModal;
