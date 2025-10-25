import PropTypes from 'prop-types';
import './WizardNavigation.css';

const WizardNavigation = ({
  currentStep,
  totalSteps,
  isValid,
  onPrevious,
  onNext,
  onSubmit
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="wizard-navigation">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onPrevious}
        disabled={isFirstStep}
      >
        ← Précédent
      </button>

      {isLastStep ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!isValid}
        >
          Soumettre pour approbation
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!isValid}
        >
          Continuer →
        </button>
      )}
    </div>
  );
};

WizardNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  isValid: PropTypes.bool.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default WizardNavigation;
