import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardNavigation.css';

const WizardNavigation = ({
  currentStep,
  totalSteps,
  isValid,
  isSubmitting,
  onPrevious,
  onNext,
  onSubmit
}) => {
  const { t } = useTranslation();
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="wizard-navigation">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
      >
        ← {t('wizard.back')}
      </button>

      {isLastStep ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? t('wizard.submitting') : t('wizard.submit')}
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNext}
          disabled={!isValid}
        >
          {t('wizard.continue')} →
        </button>
      )}
    </div>
  );
};

WizardNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  isValid: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default WizardNavigation;
