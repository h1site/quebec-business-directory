import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardProgressBar.css';

const WizardProgressBar = ({ currentStep, totalSteps, visitedSteps, onStepClick }) => {
  const { t } = useTranslation();

  const stepLabels = [
    t('wizard.stepLabels.basic'),
    t('wizard.stepLabels.details'),
    t('wizard.stepLabels.media'),
    t('wizard.stepLabels.contact'),
    t('wizard.stepLabels.address'),
    t('wizard.stepLabels.geolocation'),
    t('wizard.stepLabels.category'),
    t('wizard.stepLabels.services'),
    t('wizard.stepLabels.summary')
  ];
  return (
    <div className="wizard-progress-container">
      <div className="wizard-progress-bar">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const isVisited = visitedSteps.includes(stepNumber);
          const isClickable = isVisited;

          return (
            <div
              key={stepNumber}
              className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepClick(stepNumber)}
              title={stepLabels[index]}
            >
              <div className="progress-step-circle">
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M13.3333 4L6 11.3333L2.66666 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              {index < totalSteps - 1 && <div className="progress-step-line" />}
            </div>
          );
        })}
      </div>

      <div className="progress-info">
        <span className="progress-current-step">{stepLabels[currentStep - 1]}</span>
      </div>
    </div>
  );
};

WizardProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  visitedSteps: PropTypes.arrayOf(PropTypes.number).isRequired,
  onStepClick: PropTypes.func.isRequired
};

export default WizardProgressBar;
