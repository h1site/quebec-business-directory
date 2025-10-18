import { useState, useEffect } from 'react';
import { getBusinessHours, formatHoursForDisplay, getCurrentStatus } from '../services/businessHoursService.js';
import './BusinessHours.css';

const BusinessHours = ({ businessId, language = 'fr' }) => {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadHours = async () => {
      if (!businessId) return;

      try {
        setLoading(true);
        const { data, error } = await getBusinessHours(businessId);

        if (error) {
          console.error('Error loading business hours:', error);
          return;
        }

        if (data && data.length > 0) {
          setHours(data);

          // Get current status
          const currentStatus = getCurrentStatus(data);
          setStatus(currentStatus);
        }
      } catch (error) {
        console.error('Error loading business hours:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHours();
  }, [businessId]);

  if (loading) {
    return <div className="business-hours-loading">Chargement...</div>;
  }

  if (!hours || hours.length === 0) {
    return null; // Don't show anything if no hours are available
  }

  const formattedHours = formatHoursForDisplay(hours, language);

  // Find current day
  const currentDayOfWeek = new Date().getDay();

  return (
    <div className="business-hours-container">
      <h3 className="sidebar-title">Heures d'ouverture</h3>
      {status && (
        <div className={`hours-status ${status.isOpen ? 'open' : 'closed'}`}>
          {status.isOpen !== null && (
            <span className="status-indicator">●</span>
          )}
          <span className="status-text">{status.status}</span>
        </div>
      )}

      <div className="hours-toggle" onClick={() => setIsExpanded(!isExpanded)}>
        <span>{isExpanded ? 'Masquer' : 'Voir tous les horaires'}</span>
        <svg
          className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isExpanded && (
        <div className="hours-list">
          {formattedHours.map((day) => (
            <div
              key={day.day_of_week}
              className={`hours-row ${day.day_of_week === currentDayOfWeek ? 'current-day' : ''}`}
            >
              <span className="day-name">{day.day_name}</span>
              <span className={`hours-text ${day.is_closed ? 'closed' : ''} ${day.is_24h ? 'open-24h' : ''}`}>
                {day.hours_text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessHours;
