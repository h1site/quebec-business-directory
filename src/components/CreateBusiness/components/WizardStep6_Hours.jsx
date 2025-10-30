import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const WizardStep6_Hours = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [skipHours, setSkipHours] = useState(!formData.opening_hours);

  // Initialize default hours structure if not exists
  useEffect(() => {
    if (!formData.opening_hours) {
      const defaultHours = {};
      DAYS_OF_WEEK.forEach(day => {
        defaultHours[day] = {
          open: '09:00',
          close: '17:00',
          closed: day === 'sunday'
        };
      });
      updateFormData({ opening_hours: defaultHours });
    }
  }, []);

  // This step is always valid (optional field)
  useEffect(() => {
    onValidationChange(true);
  }, [onValidationChange]);

  const handleDayChange = (day, field, value) => {
    const updatedHours = {
      ...formData.opening_hours,
      [day]: {
        ...formData.opening_hours[day],
        [field]: value
      }
    };
    updateFormData({ opening_hours: updatedHours });
  };

  const handleToggleClosed = (day) => {
    const currentDay = formData.opening_hours[day];
    handleDayChange(day, 'closed', !currentDay.closed);
  };

  const handleCopyToAll = (day) => {
    const sourceDay = formData.opening_hours[day];
    const updatedHours = {};
    DAYS_OF_WEEK.forEach(d => {
      updatedHours[d] = {
        open: sourceDay.open,
        close: sourceDay.close,
        closed: sourceDay.closed
      };
    });
    updateFormData({ opening_hours: updatedHours });
  };

  const handleSkipHours = (skip) => {
    setSkipHours(skip);
    if (skip) {
      updateFormData({ opening_hours: null });
    } else {
      // Reinitialize with default hours
      const defaultHours = {};
      DAYS_OF_WEEK.forEach(day => {
        defaultHours[day] = {
          open: '09:00',
          close: '17:00',
          closed: day === 'sunday'
        };
      });
      updateFormData({ opening_hours: defaultHours });
    }
  };

  if (!formData.opening_hours) {
    return (
      <div className="wizard-step">
        <div className="step-header">
          <h2>{t('wizard.step6_hours.title')}</h2>
          <p className="step-description">
            {t('wizard.step6_hours.description')}
          </p>
        </div>

        <div className="step-content">
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#64748b' }}>
              {t('wizard.step6_hours.optionalMessage')}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSkipHours(false)}
            >
              {t('wizard.step6_hours.addHours')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step6_hours.title')}</h2>
        <p className="step-description">
          {t('wizard.step6_hours.description')}
        </p>
      </div>

      <div className="step-content">
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={skipHours}
              onChange={(e) => handleSkipHours(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.95rem', color: '#0c4a6e' }}>
              {t('wizard.step6_hours.skipHours')}
            </span>
          </label>
        </div>

        <div className="hours-grid">
          {DAYS_OF_WEEK.map((day) => {
            const dayData = formData.opening_hours[day];
            return (
              <div key={day} className="hours-row">
                <div className="hours-day">
                  <label style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {t(`wizard.step6_hours.days.${day}`)}
                  </label>
                </div>

                <div className="hours-controls">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={dayData.closed}
                      onChange={() => handleToggleClosed(day)}
                    />
                    <span>{t('wizard.step6_hours.closed')}</span>
                  </label>

                  {!dayData.closed && (
                    <>
                      <div className="time-inputs">
                        <input
                          type="time"
                          value={dayData.open}
                          onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                          className="form-input"
                          style={{ width: '120px' }}
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={dayData.close}
                          onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                          className="form-input"
                          style={{ width: '120px' }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyToAll(day)}
                        className="btn-copy-hours"
                        title={t('wizard.step6_hours.copyToAll')}
                      >
                        📋
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <style>{`
          .hours-grid {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1.5rem;
          }

          .hours-row {
            display: grid;
            grid-template-columns: 150px 1fr;
            gap: 1.5rem;
            align-items: center;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }

          .hours-day label {
            color: #1e293b;
            font-size: 1rem;
          }

          .hours-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .time-inputs {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn-copy-hours {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: background 0.2s;
          }

          .btn-copy-hours:hover {
            background: #2563eb;
          }

          @media (max-width: 768px) {
            .hours-row {
              grid-template-columns: 1fr;
              gap: 0.75rem;
            }

            .hours-controls {
              flex-direction: column;
              align-items: flex-start;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

WizardStep6_Hours.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep6_Hours;
