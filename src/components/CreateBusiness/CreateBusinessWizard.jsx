import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import WizardProgressBar from './components/WizardProgressBar.jsx';
import WizardNavigation from './components/WizardNavigation.jsx';
import BusinessPreview from './components/BusinessPreview.jsx';

// Import wizard steps
import WizardStep1_Basic from './components/WizardStep1_Basic.jsx';
import WizardStep3_Media from './components/WizardStep3_Media.jsx';
import WizardStep4_Contact from './components/WizardStep4_Contact.jsx';
import WizardStep5_Address from './components/WizardStep5_Address.jsx';
import WizardStep6_Hours from './components/WizardStep6_Hours.jsx';
import WizardStep7_Category from './components/WizardStep7_Category.jsx';
import WizardStep8_Services from './components/WizardStep8_Services.jsx';
import WizardStep9_Summary from './components/WizardStep9_Summary.jsx';

import './CreateBusinessWizard.css';

const TOTAL_STEPS = 8;

const CreateBusinessWizard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState([1]); // Track visited steps for navigation
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic info
    name: '',
    description: '',

    // Step 2: Media
    logo: null,
    logo_preview: null,
    images: [],
    image_previews: [],

    // Step 3: Contact
    phone: '',
    email: '',
    website: '',

    // Step 4: Address
    address: '',
    city: '',
    province: 'QC',
    postal_code: '',
    show_address: true,

    // Step 5: Opening Hours (optional)
    opening_hours: null,

    // Step 6: Category
    main_category_id: null,
    main_category_slug: null,
    main_category_name: null,
    subcategory_id: null,
    subcategory_slug: null,
    subcategory_name: null,

    // Step 7: Services
    services: [],

    // Step 8: Summary
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
    if (!user) {
      alert('Vous devez être connecté pour créer une entreprise');
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtenir les coordonnées GPS automatiquement via Nominatim
      let latitude = null;
      let longitude = null;

      if (formData.address && formData.city) {
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.province}, Canada ${formData.postal_code || ''}`;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&` +
            `q=${encodeURIComponent(fullAddress)}&` +
            `countrycodes=ca&` +
            `limit=1`,
            {
              headers: {
                'User-Agent': 'QuebecBusinessDirectory/1.0'
              }
            }
          );

          const data = await response.json();

          if (data && data.length > 0) {
            latitude = parseFloat(data[0].lat);
            longitude = parseFloat(data[0].lon);
            console.log(`Coordonnées GPS trouvées: ${latitude}, ${longitude}`);
          }
        } catch (geocodeError) {
          console.error('Erreur de géocodage (non bloquant):', geocodeError);
          // Continue sans coordonnées GPS
        }
      }

      // Générer un slug basé uniquement sur le nom
      // L'URL complète sera: /entreprise/ville/categorie/nom
      const slugBase = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100);

      // Préparer les données pour l'insertion (seulement les champs qui existent dans la table)
      const businessData = {
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postal_code,
        show_address: formData.show_address,
        opening_hours: formData.opening_hours,
        latitude: latitude,
        longitude: longitude,
        slug: slugBase,
        data_source: 'user_created',
        owner_id: user.id,
        is_claimed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Submitting business:', businessData);

      // Insérer l'entreprise dans Supabase
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single();

      if (businessError) throw businessError;

      console.log('Business created:', business);

      // Récupérer le slug de la catégorie depuis la base de données
      let categorySlug = 'autre';

      console.log('💾 Wizard - Sauvegarde des catégories:', {
        businessId: business.id,
        main_category_id: formData.main_category_id,
        subcategory_id: formData.subcategory_id,
        formData: formData
      });

      if (formData.main_category_id) {
        const { data: categoryData } = await supabase
          .from('main_categories')
          .select('slug')
          .eq('id', formData.main_category_id)
          .single();

        if (categoryData && categoryData.slug) {
          categorySlug = categoryData.slug;
        }

        // Insérer les catégories dans la table de liaison business_categories
        // Note: business_categories stocke seulement sub_category_id (qui contient la référence à main_category)
        if (formData.subcategory_id) {
          const categoryLinks = [{
            business_id: business.id,
            sub_category_id: formData.subcategory_id,
            is_primary: true
          }];

          console.log('➡️ Insertion dans business_categories:', categoryLinks);

          const { data: insertedData, error: categoryError } = await supabase
            .from('business_categories')
            .insert(categoryLinks)
            .select();

          if (categoryError) {
            console.error('❌ Error linking categories:', categoryError);
            alert(`Erreur lors de la liaison des catégories: ${categoryError.message}`);
          } else {
            console.log('✅ Catégories insérées avec succès:', insertedData);
          }
        } else {
          console.warn('⚠️ Aucune sous-catégorie sélectionnée - pas d\'insertion dans business_categories');
        }
      } else {
        console.warn('⚠️ Aucune catégorie principale sélectionnée');
      }

      // Upload logo si présent
      if (formData.logo && business) {
        const logoFileName = `${business.id}/logo-${Date.now()}.${formData.logo.name.split('.').pop()}`;
        const { error: logoError } = await supabase.storage
          .from('business-images')
          .upload(logoFileName, formData.logo);

        if (logoError) {
          console.error('Error uploading logo:', logoError);
        } else {
          // Mettre à jour l'entreprise avec l'URL du logo
          const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(logoFileName);

          await supabase
            .from('businesses')
            .update({ logo_url: publicUrl })
            .eq('id', business.id);
        }
      }

      // Upload images si présentes
      if (formData.images && formData.images.length > 0 && business) {
        for (let i = 0; i < formData.images.length; i++) {
          const image = formData.images[i];
          const imageFileName = `${business.id}/image-${i}-${Date.now()}.${image.name.split('.').pop()}`;

          const { error: imageError } = await supabase.storage
            .from('business-images')
            .upload(imageFileName, image);

          if (imageError) {
            console.error(`Error uploading image ${i}:`, imageError);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('business-images')
              .getPublicUrl(imageFileName);

            // Ajouter l'URL dans le tableau images (JSON)
            const currentImages = business.images || [];
            currentImages.push(publicUrl);

            await supabase
              .from('businesses')
              .update({ images: currentImages })
              .eq('id', business.id);
          }
        }
      }

      // Construire l'URL de l'entreprise: /categorie/ville/nom (correspond aux routes existantes)
      const citySlug = formData.city
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const businessUrl = `/${categorySlug}/${citySlug}/${business.slug}`;

      alert('✅ Entreprise créée avec succès!');
      navigate(businessUrl);
    } catch (error) {
      console.error('Error submitting business:', error);
      alert(`Erreur lors de la création: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
        return <WizardStep3_Media {...stepProps} />;
      case 3:
        return <WizardStep4_Contact {...stepProps} />;
      case 4:
        return <WizardStep5_Address {...stepProps} />;
      case 5:
        return <WizardStep6_Hours {...stepProps} />;
      case 6:
        return <WizardStep7_Category {...stepProps} />;
      case 7:
        return <WizardStep8_Services {...stepProps} />;
      case 8:
        return <WizardStep9_Summary {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>{t('wizard.title')}</h1>
        <button className="wizard-close" onClick={() => navigate('/dashboard')}>
          ×
        </button>
      </div>

      <div className="wizard-content">
        {/* Left side: Form */}
        <div className="wizard-form">
          {renderStep()}

          <WizardNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            isValid={isCurrentStepValid}
            isSubmitting={isSubmitting}
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
