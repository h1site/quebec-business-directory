import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardProgressBar from './components/WizardProgressBar.jsx';
import WizardNavigation from './components/WizardNavigation.jsx';
import BusinessPreview from './components/BusinessPreview.jsx';

// Import wizard steps
import WizardStep1_Basic from './components/WizardStep1_Basic.jsx';
import WizardStep2_Details from './components/WizardStep2_Details.jsx';
import WizardStep3_Media from './components/WizardStep3_Media.jsx';
import WizardStep4_Contact from './components/WizardStep4_Contact.jsx';
import WizardStep5_Address from './components/WizardStep5_Address.jsx';
import WizardStep6_Geolocation from './components/WizardStep6_Geolocation.jsx';
import WizardStep7_Category from './components/WizardStep7_Category.jsx';
import WizardStep8_Services from './components/WizardStep8_Services.jsx';
import WizardStep9_Summary from './components/WizardStep9_Summary.jsx';

import './CreateBusinessWizard.css';

const TOTAL_STEPS = 9;

const CreateBusinessWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState([1]); // Track visited steps for navigation
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);

  // Global form data state
  const [formData, setFormData] = useState({
    // Page 1: Basic info
    name: '',
    description: '',

    // Page 2: Details
    company_size: '',
    founded_year: new Date().getFullYear(),

    // Page 3: Media
    logo: null,
    logo_preview: null,
    images: [],
    image_previews: [],

    // Page 4: Contact
    phone: '',
    email: '',
    website: '',

    // Page 5: Address
    address: '',
    city: '',
    province: 'QC',
    postal_code: '',

    // Page 6: Geolocation
    latitude: null,
    longitude: null,

    // Page 7: Category
    main_category_id: null,
    main_category_slug: null,

    // Page 8: Services
    services: [],

    // Page 9: Summary
    terms_accepted: false
  });

  // Update form data
  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Navigate to specific step
  const goToStep = (step) => {
    if (step >= 1 && step <= TOTAL_STEPS && visitedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  // Go to next step
  const goToNext = () => {
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (!visitedSteps.includes(nextStep)) {
        setVisitedSteps(prev => [...prev, nextStep]);
      }
    }
  };

  // Go to previous step
  const goToPrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Callback for step validation
  const handleValidationChange = (isValid) => {
    setIsCurrentStepValid(isValid);
  };

  // Submit form
  const handleSubmit = async () => {
    try {
      console.log('Submitting business:', formData);
      // TODO: Implement actual submission logic
      alert('Entreprise soumise avec succès! En attente d\'approbation.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting business:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    }
  };

  // Render current step component
  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onValidationChange: handleValidationChange
    };

    switch (currentStep) {
      case 1:
        return <WizardStep1_Basic {...stepProps} />;
      case 2:
        return <WizardStep2_Details {...stepProps} />;
      case 3:
        return <WizardStep3_Media {...stepProps} />;
      case 4:
        return <WizardStep4_Contact {...stepProps} />;
      case 5:
        return <WizardStep5_Address {...stepProps} />;
      case 6:
        return <WizardStep6_Geolocation {...stepProps} />;
      case 7:
        return <WizardStep7_Category {...stepProps} />;
      case 8:
        return <WizardStep8_Services {...stepProps} />;
      case 9:
        return <WizardStep9_Summary {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>Créer une nouvelle entreprise</h1>
        <button className="wizard-close" onClick={() => navigate('/dashboard')}>
          ×
        </button>
      </div>

      <WizardProgressBar
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        visitedSteps={visitedSteps}
        onStepClick={goToStep}
      />

      <div className="wizard-content">
        {/* Left side: Form */}
        <div className="wizard-form">
          {renderStep()}

          <WizardNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            isValid={isCurrentStepValid}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Right side: Preview */}
        <div className="wizard-preview">
          <BusinessPreview formData={formData} />
        </div>
      </div>
    </div>
  );
};

export default CreateBusinessWizard;
