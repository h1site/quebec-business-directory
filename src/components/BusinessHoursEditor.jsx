import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getBusinessHours, saveBusinessHours } from '../services/businessHoursService.js';
import './BusinessHoursEditor.css';

const BusinessHoursEditor = ({ businessId, onSave }) => {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Initialize empty hours for all days
  const initializeEmptyHours = () => {
    return Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      is_closed: false,
      is_24h: false,
      opens_at: '09:00:00',
      closes_at: '17:00:00'
    }));
  };

  useEffect(() => {
    const loadHours = async () => {
      if (!businessId) {
        setHours(initializeEmptyHours());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await getBusinessHours(businessId);

        if (error) {
          console.error('Error loading hours:', error);
          setHours(initializeEmptyHours());
        } else if (data && data.length > 0) {
          // Ensure all 7 days are present
          const completeHours = Array.from({ length: 7 }, (_, i) => {
            const existing = data.find(h => h.day_of_week === i);
            return existing || {
              day_of_week: i,
              is_closed: false,
              is_24h: false,
              opens_at: '09:00:00',
              closes_at: '17:00:00'
            };
          });
          setHours(completeHours);
        } else {
          setHours(initializeEmptyHours());
        }
      } catch (error) {
        console.error('Error loading hours:', error);
        setHours(initializeEmptyHours());
      } finally {
        setLoading(false);
      }
    };

    loadHours();
  }, [businessId]);

  const handleDayChange = (dayOfWeek, field, value) => {
    setHours(prev => prev.map(hour => {
      if (hour.day_of_week === dayOfWeek) {
        const updated = { ...hour, [field]: value };

        // If setting is_closed to true, clear times
        if (field === 'is_closed' && value === true) {
          updated.is_24h = false;
          updated.opens_at = null;
          updated.closes_at = null;
        }

        // If setting is_24h to true, clear times
        if (field === 'is_24h' && value === true) {
          updated.is_closed = false;
          updated.opens_at = null;
          updated.closes_at = null;
        }

        // If unchecking closed or 24h, set default times
        if ((field === 'is_closed' || field === 'is_24h') && value === false) {
          if (!updated.opens_at) updated.opens_at = '09:00:00';
          if (!updated.closes_at) updated.closes_at = '17:00:00';
        }

        return updated;
      }
      return hour;
    }));
  };

  const handleSave = async () => {
    if (!businessId) {
      setMessage({ type: 'error', text: 'ID d\'entreprise manquant' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const { error } = await saveBusinessHours(businessId, hours);

      if (error) {
        setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      } else {
        setMessage({ type: 'success', text: 'Heures sauvegardées avec succès!' });
        if (onSave) onSave();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error saving hours:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const copyToAllDays = (sourceDay) => {
    const sourceHour = hours.find(h => h.day_of_week === sourceDay);
    if (!sourceHour) return;

    setHours(prev => prev.map(hour => ({
      ...hour,
      is_closed: sourceHour.is_closed,
      is_24h: sourceHour.is_24h,
      opens_at: sourceHour.opens_at,
      closes_at: sourceHour.closes_at
    })));
  };

  if (loading) {
    return <div className="hours-editor-loading">Chargement...</div>;
  }

  return (
    <div className="business-hours-editor">
      <h3>Heures d'ouverture</h3>
      <p className="hours-editor-hint">
        Définissez vos heures d'ouverture pour chaque jour de la semaine.
        Vous pouvez également importer les heures depuis Google Business Profile.
      </p>

      {message && (
        <div className={`hours-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="hours-editor-table">
        {hours.map((hour) => (
          <div key={hour.day_of_week} className="hours-editor-row">
            <div className="day-name-cell">
              <strong>{dayNames[hour.day_of_week]}</strong>
            </div>

            <div className="hours-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hour.is_closed}
                  onChange={(e) => handleDayChange(hour.day_of_week, 'is_closed', e.target.checked)}
                />
                <span>Fermé</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hour.is_24h}
                  onChange={(e) => handleDayChange(hour.day_of_week, 'is_24h', e.target.checked)}
                  disabled={hour.is_closed}
                />
                <span>24h</span>
              </label>

              {!hour.is_closed && !hour.is_24h && (
                <>
                  <div className="time-input-group">
                    <label>Ouverture</label>
                    <input
                      type="time"
                      value={hour.opens_at ? hour.opens_at.substring(0, 5) : ''}
                      onChange={(e) => handleDayChange(hour.day_of_week, 'opens_at', e.target.value + ':00')}
                    />
                  </div>

                  <div className="time-input-group">
                    <label>Fermeture</label>
                    <input
                      type="time"
                      value={hour.closes_at ? hour.closes_at.substring(0, 5) : ''}
                      onChange={(e) => handleDayChange(hour.day_of_week, 'closes_at', e.target.value + ':00')}
                    />
                  </div>
                </>
              )}

              <button
                type="button"
                className="copy-button"
                onClick={() => copyToAllDays(hour.day_of_week)}
                title="Copier à tous les jours"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder les heures'}
      </button>
    </div>
  );
};

BusinessHoursEditor.propTypes = {
  businessId: PropTypes.string,
  onSave: PropTypes.func
};

export default BusinessHoursEditor;
