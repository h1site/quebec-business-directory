import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createBusiness, updateBusiness } from '../../services/businessService.js';
import { supabase } from '../../services/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getMainCategories,
  getSubCategories,
  getBusinessSizes,
  getServiceLanguages,
  getServiceModes,
  getCertifications,
  getAccessibilityFeatures,
  getPaymentMethods
} from '../../services/lookupService.js';
import { importFromGoogle, downloadGooglePhoto } from '../../services/googleBusinessService.js';
import { parseGoogleHours, saveBusinessHours } from '../../services/businessHoursService.js';
import GoogleImportModal from '../../components/GoogleImportModal.jsx';
import DuplicateBusinessModal from '../../components/DuplicateBusinessModal.jsx';
import CityAutocompleteQuebec from '../../components/CityAutocompleteQuebec.jsx';
import ImageUploader from '../../components/ImageUploader.jsx';
import { uploadLogo, uploadMultipleGalleryImages } from '../../services/imageService.js';
import { getCityInfo } from '../../data/quebecMunicipalities.js';
import { findDuplicateBusinesses } from '../../services/businessService.js';
import './CreateBusiness.css';

// Helper function to generate a slug from a string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
};

const CreateBusiness = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState({ type: null, message: null });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGoogleImportModal, setShowGoogleImportModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  // Image upload state
  const [logoFile, setLogoFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ logo: 0, gallery: 0 });

  // Business hours state (from Google import)
  const [importedHours, setImportedHours] = useState(null);

  // Google reviews state (from Google import)
  const [importedReviews, setImportedReviews] = useState({
    google_rating: null,
    google_reviews_count: 0,
    google_reviews: []
  });

  // Lookup data
  const [lookupData, setLookupData] = useState({
    mainCategories: [],
    subCategories: [],
    businessSizes: [],
    serviceLanguages: [],
    serviceModes: [],
    certifications: [],
    accessibilityFeatures: [],
    paymentMethods: []
  });

  // Form state
  const [form, setForm] = useState({
    // Step 1: Basic Information
    name: '',
    description: '',
    mission_statement: '',
    core_values: '',
    established_year: '',
    business_size_id: '',
    is_franchise: false,

    // Step 2: Contact Information
    phone: '',
    email: '',
    show_email: true,
    website: '',
    address: '',
    address_line2: '',
    city: '',
    region: '',
    postal_code: '',
    latitude: '',
    longitude: '',

    // Step 3: Categories & Services
    main_category_id: '',
    sub_category_ids: [],
    products_services: '',

    // Step 4: Service Details
    language_ids: [],
    service_mode_ids: [],
    certification_ids: [],
    service_area: '',
    service_radius_km: '',

    // Step 5: Accessibility & Payment
    accessibility_feature_ids: [],
    payment_method_ids: []
  });

  const [errors, setErrors] = useState({});

  // Load lookup data
  useEffect(() => {
    const loadLookupData = async () => {
      try {
        setLoading(true);
        const [
          mainCategoriesRes,
          subCategoriesRes,
          businessSizesRes,
          serviceLanguagesRes,
          serviceModesRes,
          certificationsRes,
          accessibilityFeaturesRes,
          paymentMethodsRes
        ] = await Promise.all([
          getMainCategories(),
          getSubCategories(),
          getBusinessSizes(),
          getServiceLanguages(),
          getServiceModes(),
          getCertifications(),
          getAccessibilityFeatures(),
          getPaymentMethods()
        ]);

        setLookupData({
          mainCategories: mainCategoriesRes.data || [],
          subCategories: subCategoriesRes.data || [],
          businessSizes: businessSizesRes.data || [],
          serviceLanguages: serviceLanguagesRes.data || [],
          serviceModes: serviceModesRes.data || [],
          certifications: certificationsRes.data || [],
          accessibilityFeatures: accessibilityFeaturesRes.data || [],
          paymentMethods: paymentMethodsRes.data || []
        });
      } catch (error) {
        console.error('Error loading lookup data:', error);
        setStatus({ type: 'error', message: 'Erreur lors du chargement des données.' });
      } finally {
        setLoading(false);
      }
    };

    loadLookupData();
  }, []);

  // Filter sub-categories based on selected main category
  const filteredSubCategories = lookupData.subCategories.filter(
    (sc) => sc.main_category_id === form.main_category_id
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleMultiSelect = (name, value) => {
    setForm((prev) => {
      const currentValues = prev[name] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!form.name.trim()) newErrors.name = 'Le nom est requis';
        if (!form.description.trim()) newErrors.description = 'La description est requise';
        if (form.description.length < 50) {
          newErrors.description = 'La description doit contenir au moins 50 caractères';
        }
        break;

      case 2:
        if (!form.email.trim()) newErrors.email = "L'email est requis";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          newErrors.email = 'Email invalide';
        }
        if (!form.phone.trim()) newErrors.phone = 'Le téléphone est requis';
        if (!form.address.trim()) newErrors.address = "L'adresse est requise";
        if (!form.city.trim()) newErrors.city = 'La ville est requise';
        if (!form.postal_code.trim()) newErrors.postal_code = 'Le code postal est requis';
        break;

      case 3:
        if (!form.main_category_id) newErrors.main_category_id = 'La catégorie principale est requise';
        if (form.sub_category_ids.length === 0) {
          newErrors.sub_category_ids = 'Au moins une sous-catégorie est requise';
        }
        if (!form.products_services.trim()) {
          newErrors.products_services = 'Les produits/services sont requis';
        }
        break;

      case 4:
        if (form.language_ids.length === 0) {
          newErrors.language_ids = 'Au moins une langue de service est requise';
        }
        if (form.service_mode_ids.length === 0) {
          newErrors.service_mode_ids = 'Au moins un mode de service est requis';
        }
        break;

      case 5:
        // Optional fields, no validation required
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: null, message: null });

    if (!user) {
      setStatus({ type: 'error', message: 'Vous devez être connecté pour créer une fiche.' });
      return;
    }

    // Validate all steps
    let allValid = true;
    for (let step = 1; step <= 5; step++) {
      if (!validateStep(step)) {
        allValid = false;
        setCurrentStep(step);
        break;
      }
    }

    if (!allValid) {
      setStatus({ type: 'error', message: 'Veuillez corriger les erreurs dans le formulaire.' });
      return;
    }

    // Check for duplicates before creating
    await checkForDuplicates();
  };

  const checkForDuplicates = async () => {
    try {
      setCheckingDuplicates(true);
      setStatus({ type: 'info', message: 'Vérification des doublons...' });

      const { matches, error } = await findDuplicateBusinesses({
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        google_place_id: form.google_place_id // Will be set if imported from Google
      });

      if (error) {
        console.error('Error checking duplicates:', error);
        // Continue with creation even if duplicate check fails
        await proceedWithCreation();
        return;
      }

      // Filter out matches with confidence < 60% (too low to be meaningful)
      const significantMatches = matches.filter(m => m.confidence >= 60);

      if (significantMatches.length > 0) {
        // Show duplicate modal
        setDuplicateMatches(significantMatches);
        setShowDuplicateModal(true);
        setStatus({ type: null, message: null });
      } else {
        // No duplicates found, proceed with creation
        await proceedWithCreation();
      }
    } catch (error) {
      console.error('Error in duplicate check:', error);
      // Continue with creation if duplicate check fails
      await proceedWithCreation();
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const proceedWithCreation = async () => {
    try {
      setSubmitting(true);

      // Prepare payload
      const payload = {
        owner_id: user.id,
        name: form.name,
        slug: generateSlug(form.name),
        description: form.description,
        mission_statement: form.mission_statement || null,
        core_values: form.core_values || null,
        established_year: form.established_year ? parseInt(form.established_year) : null,
        business_size_id: form.business_size_id || null,
        is_franchise: form.is_franchise,
        phone: form.phone,
        email: form.email,
        show_email: form.show_email,
        website: form.website || null,
        address: form.address,
        address_line2: form.address_line2 || null,
        city: form.city,
        region: form.region || null,
        province: 'QC',
        postal_code: form.postal_code,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        products_services: form.products_services,
        service_area: form.service_area || null,
        service_radius_km: form.service_radius_km ? parseFloat(form.service_radius_km) : null
      };

      const business = await createBusiness(payload);

      // Upload images if business was created successfully
      if (business && business.id) {
        let logoUrl = null;
        let galleryUrls = [];

        // Upload logo
        if (logoFile) {
          try {
            setStatus({ type: 'info', message: 'Upload du logo en cours...' });
            const logoResult = await uploadLogo(logoFile, business.id);
            logoUrl = logoResult.url;
          } catch (error) {
            console.error('Error uploading logo:', error);
            setStatus({ type: 'error', message: `Erreur lors de l'upload du logo: ${error.message}` });
          }
        }

        // Upload gallery images
        if (galleryFiles.length > 0) {
          try {
            setStatus({ type: 'info', message: `Upload de ${galleryFiles.length} image(s) en cours...` });
            const galleryResults = await uploadMultipleGalleryImages(
              galleryFiles,
              business.id,
              (current, total) => {
                setUploadProgress({ ...uploadProgress, gallery: Math.round((current / total) * 100) });
              }
            );
            galleryUrls = galleryResults.map(r => r.url);
          } catch (error) {
            console.error('Error uploading gallery:', error);
            setStatus({ type: 'error', message: `Erreur lors de l'upload de la galerie: ${error.message}` });
          }
        }

        // Update business with image URLs and reviews if any were uploaded/imported
        if (logoUrl || galleryUrls.length > 0 || importedReviews.google_reviews.length > 0) {
          try {
            const updatePayload = {};
            if (logoUrl) updatePayload.logo_url = logoUrl;
            if (galleryUrls.length > 0) updatePayload.gallery_images = galleryUrls;

            // Add Google reviews data if imported
            if (importedReviews.google_reviews.length > 0) {
              updatePayload.google_rating = importedReviews.google_rating;
              updatePayload.google_reviews_count = importedReviews.google_reviews_count;
              updatePayload.google_reviews = importedReviews.google_reviews;
            }

            await updateBusiness(business.id, updatePayload);
          } catch (error) {
            console.error('Error updating business with images:', error);
          }
        }

        // Save business hours if imported from Google
        if (importedHours && importedHours.length > 0) {
          try {
            setStatus({ type: 'info', message: 'Sauvegarde des heures d\'ouverture...' });
            await saveBusinessHours(business.id, importedHours);
          } catch (error) {
            console.error('Error saving business hours:', error);
            // Don't fail the whole process if hours fail to save
          }
        }

        // TODO: Create business_categories, business_languages, etc. relationships
        // This would require additional service methods to insert into junction tables
      }

      setStatus({
        type: 'success',
        message: 'Votre entreprise a été créée avec succès! Redirection en cours...'
      });

      // Reset form
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Une erreur est survenue.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getLabel = (item) => {
    return i18n.language === 'en' ? item.label_en : item.label_fr;
  };

  // Handler for when user chooses to claim an existing business from duplicate modal
  const handleClaimExisting = async (match) => {
    try {
      setShowDuplicateModal(false);

      // Navigate to the business claim page or auto-claim
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        navigate('/login');
        return;
      }

      // Check if email domain matches business website for auto-approval
      const userEmail = session.session.user.email;
      const emailDomain = userEmail.split('@')[1]?.toLowerCase();

      let websiteDomain = null;
      if (match.website) {
        websiteDomain = match.website.toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/.*$/, '');
      }

      const canAutoApprove = emailDomain && websiteDomain && emailDomain === websiteDomain;

      // Create claim
      const { data: claim, error: claimError } = await supabase
        .from('business_claims')
        .insert({
          business_id: match.id,
          user_id: userId,
          user_email: userEmail,
          user_name: user.user_metadata?.full_name || null,
          verification_method: 'email_domain',
          status: canAutoApprove ? 'approved' : 'pending'
        })
        .select()
        .single();

      if (claimError) {
        if (claimError.code === '23505') { // Unique constraint violation
          alert('Vous avez déjà réclamé cette entreprise.');
          navigate(`/entreprise/${match.slug}`);
          return;
        }
        throw claimError;
      }

      // If auto-approved, update business immediately
      if (canAutoApprove) {
        await supabase
          .from('businesses')
          .update({
            claimed_by: userId,
            claimed_at: new Date().toISOString(),
            is_claimed: true
          })
          .eq('id', match.id);

        alert(`✅ Entreprise réclamée automatiquement! Redirection vers votre fiche...`);
        navigate(`/entreprise/${match.slug}`);
      } else {
        alert(`⏳ Demande de réclamation envoyée. Un administrateur va la réviser sous peu.`);
        navigate('/');
      }
    } catch (error) {
      console.error('Error claiming business:', error);
      alert('Erreur lors de la réclamation: ' + error.message);
    }
  };

  // Handler for when user chooses to create new business anyway
  const handleCreateNew = () => {
    setShowDuplicateModal(false);
    proceedWithCreation();
  };

  const handleGoogleImport = async (importedData) => {
    try {
      // importedData is now the selected business object from confirmation screen

      // Update form with imported data including social media URLs
      setForm((prev) => ({
        ...prev,
        name: importedData.name || prev.name,
        description: importedData.description || prev.description,
        phone: importedData.phone || prev.phone,
        website: importedData.website || prev.website,
        address: importedData.address || prev.address,
        city: importedData.city || prev.city,
        postal_code: importedData.postal_code || prev.postal_code,
        latitude: importedData.latitude || prev.latitude,
        longitude: importedData.longitude || prev.longitude,
        facebook_url: importedData.facebook_url || prev.facebook_url,
        instagram_url: importedData.instagram_url || prev.instagram_url,
        twitter_url: importedData.twitter_url || prev.twitter_url,
        linkedin_url: importedData.linkedin_url || prev.linkedin_url,
        threads_url: importedData.threads_url || prev.threads_url,
        tiktok_url: importedData.tiktok_url || prev.tiktok_url
      }));

      // Find matching main category if available
      if (importedData.suggested_category_slug) {
        const matchingCategory = lookupData.mainCategories.find(
          (cat) => cat.slug === importedData.suggested_category_slug
        );
        if (matchingCategory) {
          setForm((prev) => ({ ...prev, main_category_id: matchingCategory.id }));
        }
      }

      // Download logo from Google Business if available
      if (importedData.photos && importedData.photos.length > 0) {
        const logoPhoto = importedData.photos[0]; // Use first photo as logo
        const logoFile = await downloadGooglePhoto(logoPhoto.reference, 400, 'google-logo.jpg');
        if (logoFile) {
          setLogoFile(logoFile);
        }

        // Download additional photos for gallery (up to 9 more)
        if (importedData.photos.length > 1) {
          const galleryPhotos = importedData.photos.slice(1, 10);
          const galleryPromises = galleryPhotos.map((photo, index) =>
            downloadGooglePhoto(photo.reference, 1200, `google-gallery-${index}.jpg`)
          );
          const galleryResults = await Promise.all(galleryPromises);
          const validGalleryFiles = galleryResults.filter(file => file !== null);
          if (validGalleryFiles.length > 0) {
            setGalleryFiles(validGalleryFiles);
          }
        }
      }

      // Parse and store business hours from Google
      if (importedData.opening_hours && importedData.opening_hours.length > 0) {
        const parsedHours = parseGoogleHours(importedData.opening_hours);
        if (parsedHours.length > 0) {
          setImportedHours(parsedHours);
        }
      }

      // Store Google reviews data
      if (importedData.google_reviews && importedData.google_reviews.length > 0) {
        setImportedReviews({
          google_rating: importedData.google_rating,
          google_reviews_count: importedData.google_reviews_count,
          google_reviews: importedData.google_reviews
        });
      }

      setStatus({
        type: 'success',
        message: 'Données importées avec succès depuis Google (incluant heures d\'ouverture et avis)! Veuillez vérifier et compléter les informations.'
      });

      // Clear success message after a few seconds
      setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 5000);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="create-business-page">
      <div className="container">
        <div className="create-business-header">
          <div className="header-logo">
            <img src="/images/logos/logo.webp" alt="Logo" className="logo-image" />
          </div>
          <h1>{t('dashboard.createTitle') || 'Ajouter votre entreprise'}</h1>
          <p className="subtitle">
            Complétez les informations suivantes pour ajouter votre entreprise à l'annuaire
          </p>
          <button
            type="button"
            className="btn-google-import"
            onClick={() => setShowGoogleImportModal(true)}
          >
            <img src="/images/logos/google.svg" alt="Google" width="20" height="20" />
            Importer depuis Google Business
          </button>
        </div>

        <GoogleImportModal
          isOpen={showGoogleImportModal}
          onClose={() => setShowGoogleImportModal(false)}
          onImport={handleGoogleImport}
        />

        {showDuplicateModal && (
          <DuplicateBusinessModal
            matches={duplicateMatches}
            onClose={() => setShowDuplicateModal(false)}
            onClaimExisting={handleClaimExisting}
            onCreateNew={handleCreateNew}
            businessData={{
              name: form.name,
              address: form.address,
              city: form.city,
              phone: form.phone
            }}
          />
        )}

        {/* Progress Indicator */}
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Informations de base</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Coordonnées</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Catégories</div>
          </div>
          <div className={`step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Services</div>
          </div>
          <div className={`step ${currentStep >= 5 ? 'active' : ''} ${currentStep > 5 ? 'completed' : ''}`}>
            <div className="step-number">5</div>
            <div className="step-label">Finalisation</div>
          </div>
        </div>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <form className="business-form" onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <h2 className="step-title">Informations de base</h2>

              <div className="form-group">
                <label htmlFor="name">
                  Nom de l'entreprise <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Ex: Restaurant Le Gourmet"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  className={errors.description ? 'error' : ''}
                  placeholder="Décrivez votre entreprise, vos services, ce qui vous distingue... (minimum 50 caractères)"
                />
                <div className="char-count">
                  {form.description.length} caractères
                  {form.description.length < 50 && ` (minimum 50)`}
                </div>
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="business_size_id">Taille de l'entreprise</label>
                  <select
                    id="business_size_id"
                    name="business_size_id"
                    value={form.business_size_id}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez...</option>
                    {lookupData.businessSizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {getLabel(size)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="established_year">Année de fondation</label>
                  <input
                    type="number"
                    id="established_year"
                    name="established_year"
                    value={form.established_year}
                    onChange={handleChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder="Ex: 2015"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="mission_statement">Énoncé de mission</label>
                <textarea
                  id="mission_statement"
                  name="mission_statement"
                  value={form.mission_statement}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Quelle est la mission de votre entreprise?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="core_values">Valeurs fondamentales</label>
                <textarea
                  id="core_values"
                  name="core_values"
                  value={form.core_values}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Quelles sont vos valeurs d'entreprise?"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_franchise"
                    checked={form.is_franchise}
                    onChange={handleChange}
                  />
                  <span>Cette entreprise est une franchise</span>
                </label>
              </div>

              {/* Logo Upload */}
              <div className="form-group">
                <label>Logo de l'entreprise (format carré 1:1 recommandé)</label>
                <p className="field-hint">Le logo sera automatiquement compressé en format WebP</p>
                <ImageUploader
                  type="logo"
                  onImageSelect={(file) => setLogoFile(file)}
                  multiple={false}
                  initialFiles={logoFile}
                />
              </div>

              {/* Gallery Upload */}
              <div className="form-group">
                <label>Galerie photos (jusqu'à 10 images)</label>
                <p className="field-hint">Les images seront automatiquement compressées en format WebP</p>
                <ImageUploader
                  type="gallery"
                  onImageSelect={(files) => setGalleryFiles(files)}
                  multiple={true}
                  maxFiles={10}
                  initialFiles={galleryFiles}
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="form-step">
              <h2 className="step-title">Coordonnées</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Téléphone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="(514) 555-1234"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="contact@entreprise.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="show_email"
                    checked={form.show_email}
                    onChange={handleChange}
                  />
                  <span>Afficher le courriel publiquement sur la fiche d'entreprise</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="website">Site web</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://www.votresite.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  Adresse <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="123 Rue Principale"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address_line2">Complément d'adresse</label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={form.address_line2}
                  onChange={handleChange}
                  placeholder="Bureau 200, App. 5, etc."
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: '2' }}>
                  <label htmlFor="city">
                    Ville <span className="required">*</span>
                  </label>
                  <CityAutocompleteQuebec
                    value={form.city}
                    onChange={(city) => {
                      setForm((prev) => {
                        // Auto-fill region based on city
                        const cityInfo = getCityInfo(city);
                        return {
                          ...prev,
                          city,
                          region: cityInfo ? `${cityInfo.mrc}, ${cityInfo.region}` : prev.region
                        };
                      });
                      setErrors((prev) => ({ ...prev, city: null }));
                    }}
                    error={errors.city}
                    required
                    placeholder="Ex: Vaudreuil-Dorion, Montréal, Québec..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="postal_code">
                    Code postal <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    className={errors.postal_code ? 'error' : ''}
                    placeholder="H2X 1Y7"
                  />
                  {errors.postal_code && <span className="error-message">{errors.postal_code}</span>}
                </div>
              </div>

              {form.region && (
                <div className="form-group">
                  <label>Région détectée</label>
                  <input
                    type="text"
                    value={form.region}
                    disabled
                    style={{ backgroundColor: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="latitude"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    placeholder="45.5017"
                  />
                  <small className="help-text">
                    📍 Coordonnée GPS Nord-Sud (ex: 45.5017)
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="longitude"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="-73.5673"
                  />
                  <small className="help-text">
                    📍 Coordonnée GPS Est-Ouest (ex: -73.5673)
                  </small>
                </div>
              </div>

              {(!form.latitude || !form.longitude) && (
                <div className="alert alert-info" style={{ marginTop: '1rem', padding: '1.25rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', lineHeight: '1.6' }}>
                  <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '1.05rem' }}>🗺️ Comment obtenir les coordonnées GPS?</strong>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Méthode 1: Google Maps (recommandée)</strong>
                    <ol style={{ marginTop: '0.5rem', marginBottom: '0', paddingLeft: '1.5rem' }}>
                      <li>Allez sur <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Google Maps</a></li>
                      <li>Tapez votre adresse dans la barre de recherche</li>
                      <li><strong>Clic droit</strong> sur le marqueur rouge (ou sur l'emplacement exact)</li>
                      <li>Cliquez sur les coordonnées qui apparaissent en premier dans le menu</li>
                      <li>Les coordonnées sont copiées! Collez-les ici (format: 45.5017, -73.5673)</li>
                    </ol>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Méthode 2: Import automatique</strong>
                    <p style={{ marginTop: '0.5rem', marginBottom: '0' }}>
                      Utilisez le bouton <strong>"Importer depuis Google My Business"</strong> en haut pour remplir automatiquement tous les champs, incluant les coordonnées GPS!
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px' }}>
                    <strong>⚠️ Important:</strong> Sans coordonnées GPS, la carte Google Maps ne s'affichera pas sur la page de votre entreprise.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Categories & Services */}
          {currentStep === 3 && (
            <div className="form-step">
              <h2 className="step-title">Catégories et services</h2>

              <div className="form-group">
                <label htmlFor="main_category_id">
                  Catégorie principale <span className="required">*</span>
                </label>
                <select
                  id="main_category_id"
                  name="main_category_id"
                  value={form.main_category_id}
                  onChange={handleChange}
                  className={errors.main_category_id ? 'error' : ''}
                >
                  <option value="">Sélectionnez une catégorie...</option>
                  {lookupData.mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getLabel(cat)}
                    </option>
                  ))}
                </select>
                {errors.main_category_id && <span className="error-message">{errors.main_category_id}</span>}
              </div>

              {form.main_category_id && (
                <div className="form-group">
                  <label>
                    Sous-catégories <span className="required">*</span>
                  </label>
                  <div className="checkbox-grid">
                    {filteredSubCategories.map((subCat) => (
                      <label key={subCat.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={form.sub_category_ids.includes(subCat.id)}
                          onChange={() => handleMultiSelect('sub_category_ids', subCat.id)}
                        />
                        <span>{getLabel(subCat)}</span>
                      </label>
                    ))}
                  </div>
                  {errors.sub_category_ids && <span className="error-message">{errors.sub_category_ids}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="products_services">
                  Produits et services offerts <span className="required">*</span>
                </label>
                <textarea
                  id="products_services"
                  name="products_services"
                  value={form.products_services}
                  onChange={handleChange}
                  rows="5"
                  className={errors.products_services ? 'error' : ''}
                  placeholder="Décrivez en détail les produits et services que vous offrez..."
                />
                {errors.products_services && <span className="error-message">{errors.products_services}</span>}
              </div>
            </div>
          )}

          {/* Step 4: Service Details */}
          {currentStep === 4 && (
            <div className="form-step">
              <h2 className="step-title">Détails du service</h2>

              <div className="form-group">
                <label>
                  Langues de service <span className="required">*</span>
                </label>
                <div className="checkbox-grid">
                  {lookupData.serviceLanguages.map((lang) => (
                    <label key={lang.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.language_ids.includes(lang.id)}
                        onChange={() => handleMultiSelect('language_ids', lang.id)}
                      />
                      <span>{getLabel(lang)}</span>
                    </label>
                  ))}
                </div>
                {errors.language_ids && <span className="error-message">{errors.language_ids}</span>}
              </div>

              <div className="form-group">
                <label>
                  Modes de service <span className="required">*</span>
                </label>
                <div className="checkbox-grid">
                  {lookupData.serviceModes.map((mode) => (
                    <label key={mode.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.service_mode_ids.includes(mode.id)}
                        onChange={() => handleMultiSelect('service_mode_ids', mode.id)}
                      />
                      <span>{getLabel(mode)}</span>
                    </label>
                  ))}
                </div>
                {errors.service_mode_ids && <span className="error-message">{errors.service_mode_ids}</span>}
              </div>

              <div className="form-group">
                <label>Certifications</label>
                <div className="checkbox-grid">
                  {lookupData.certifications.map((cert) => (
                    <label key={cert.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.certification_ids.includes(cert.id)}
                        onChange={() => handleMultiSelect('certification_ids', cert.id)}
                      />
                      <span>{getLabel(cert)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="service_area">Zone de service</label>
                  <input
                    type="text"
                    id="service_area"
                    name="service_area"
                    value={form.service_area}
                    onChange={handleChange}
                    placeholder="Ex: Grand Montréal, Québec, Toute la province"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="service_radius_km">Rayon de service (km)</label>
                  <input
                    type="number"
                    id="service_radius_km"
                    name="service_radius_km"
                    value={form.service_radius_km}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    placeholder="Ex: 50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Accessibility & Payment */}
          {currentStep === 5 && (
            <div className="form-step">
              <h2 className="step-title">Accessibilité et paiement</h2>

              <div className="form-group">
                <label>Caractéristiques d'accessibilité</label>
                <div className="checkbox-grid">
                  {lookupData.accessibilityFeatures.map((feature) => (
                    <label key={feature.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.accessibility_feature_ids.includes(feature.id)}
                        onChange={() => handleMultiSelect('accessibility_feature_ids', feature.id)}
                      />
                      <span>{getLabel(feature)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Méthodes de paiement acceptées</label>
                <div className="checkbox-grid">
                  {lookupData.paymentMethods.map((method) => (
                    <label key={method.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={form.payment_method_ids.includes(method.id)}
                        onChange={() => handleMultiSelect('payment_method_ids', method.id)}
                      />
                      <span>{getLabel(method)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-summary">
                <h3>Résumé</h3>
                <p>
                  Veuillez vérifier que toutes les informations sont correctes avant de soumettre.
                  Votre entreprise sera ajoutée à l'annuaire une fois les informations validées.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {currentStep > 1 && (
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                Précédent
              </button>
            )}

            {currentStep < 5 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Suivant
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={submitting || checkingDuplicates}>
                {checkingDuplicates ? 'Vérification des doublons...' : submitting ? 'Envoi en cours...' : 'Soumettre'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBusiness;
