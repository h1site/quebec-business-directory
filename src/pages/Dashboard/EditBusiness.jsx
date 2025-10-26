import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { updateBusiness, getBusinessBySlug, checkSlugAvailability } from '../../services/businessService.js';
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
import CityAutocompleteQuebec from '../../components/CityAutocompleteQuebec.jsx';
import ImageUploader from '../../components/ImageUploader.jsx';
import BusinessHoursEditor from '../../components/BusinessHoursEditor.jsx';
import AnimatedCheckbox from '../../components/AnimatedCheckbox.jsx';
import { uploadLogo, uploadMultipleGalleryImages } from '../../services/imageService.js';
import { getBusinessUrl } from '../../utils/urlHelpers.js';
import { getCityInfo } from '../../data/quebecMunicipalities.js';
import './EditBusiness.css';

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

const EditBusiness = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [status, setStatus] = useState({ type: null, message: null });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState(null);
  const [business, setBusiness] = useState(null);

  // Slug validation state
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [slugError, setSlugError] = useState(null);
  const [originalSlug, setOriginalSlug] = useState('');

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
    // Basic Information
    name: '',
    slug: '',
    description: '',
    established_year: '',
    business_size_id: '',
    is_franchise: false,

    // Contact Information
    phone: '',
    email: '',
    show_email: true,
    website: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
    threads_url: '',
    tiktok_url: '',
    address: '',
    address_line2: '',
    city: '',
    region: '',
    postal_code: '',
    latitude: '',
    longitude: '',

    // Categories & Services
    main_category_id: '',
    sub_category_ids: [],
    products_services: '',

    // Service Details
    language_ids: [],
    service_mode_ids: [],
    certification_ids: [],
    service_area: '',
    service_radius_km: '',

    // Accessibility & Payment
    accessibility_feature_ids: [],
    payment_method_ids: []
  });

  // Image upload state
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(null);
  const [currentGalleryImages, setCurrentGalleryImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ logo: 0, gallery: 0 });

  const [errors, setErrors] = useState({});

  // Load business data and lookup data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load lookup data
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

        // Load business data
        const { data: business, error: businessError } = await getBusinessBySlug(slug);

        if (businessError || !business) {
          setStatus({ type: 'error', message: 'Entreprise introuvable' });
          return;
        }

        // Check ownership
        if (business.owner_id !== user?.id) {
          setStatus({ type: 'error', message: 'Vous n\'êtes pas autorisé à modifier cette entreprise' });
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        setBusinessId(business.id);
        setBusiness(business);

        // Store current logo URL if exists
        if (business.logo_url) {
          setCurrentLogoUrl(business.logo_url);
        }

        // Store current gallery images if exist
        if (business.gallery_images && Array.isArray(business.gallery_images)) {
          setCurrentGalleryImages(business.gallery_images);
        }

        // Charger les catégories depuis la table de liaison businesses_categories
        const { data: businessCategories } = await supabase
          .from('businesses_categories')
          .select('main_category_id, sub_category_id')
          .eq('business_id', business.id);

        let mainCategoryId = '';
        let subCategoryIds = [];

        if (businessCategories && businessCategories.length > 0) {
          // Prendre la première catégorie comme principale
          mainCategoryId = businessCategories[0].main_category_id || '';
          // Collecter toutes les sous-catégories
          subCategoryIds = businessCategories
            .map(bc => bc.sub_category_id)
            .filter(id => id !== null && id !== undefined);
        }

        // Populate form with existing data
        setForm({
          name: business.name || '',
          slug: business.slug || '',
          description: business.description || '',
          established_year: business.established_year || '',
          business_size_id: business.business_size_id || '',
          is_franchise: business.is_franchise || false,
          phone: business.phone || '',
          email: business.email || '',
          show_email: business.show_email !== false,
          website: business.website || '',
          facebook_url: business.facebook_url || '',
          instagram_url: business.instagram_url || '',
          twitter_url: business.twitter_url || '',
          linkedin_url: business.linkedin_url || '',
          threads_url: business.threads_url || '',
          tiktok_url: business.tiktok_url || '',
          address: business.address || '',
          address_line2: business.address_line2 || '',
          city: business.city || '',
          region: business.region || '',
          postal_code: business.postal_code || '',
          latitude: business.latitude || '',
          longitude: business.longitude || '',
          main_category_id: mainCategoryId,
          sub_category_ids: subCategoryIds,
          products_services: business.products_services || '',
          language_ids: business.language_ids || [],
          service_mode_ids: business.service_mode_ids || [],
          certification_ids: business.certification_ids || [],
          service_area: business.service_area || '',
          service_radius_km: business.service_radius_km || '',
          accessibility_feature_ids: business.accessibility_feature_ids || [],
          payment_method_ids: business.payment_method_ids || []
        });

        // Store original slug and mark as available
        setOriginalSlug(business.slug || '');
        setSlugAvailable(true);
      } catch (error) {
        console.error('Error loading data:', error);
        setStatus({ type: 'error', message: 'Erreur lors du chargement des données.' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [slug, user, navigate]);

  // Filter sub-categories based on selected main category
  const filteredSubCategories = lookupData.subCategories.filter(
    (sc) => sc.main_category_id === form.main_category_id
  );

  // Validate slug availability with debounce
  const validateSlug = useCallback(async (newSlug) => {
    if (!newSlug || newSlug.length < 3) {
      setSlugError('Le slug doit contenir au moins 3 caractères');
      setSlugAvailable(false);
      return;
    }

    // Check if slug format is valid
    if (!/^[a-z0-9-]+$/.test(newSlug)) {
      setSlugError('Le slug ne peut contenir que des lettres minuscules, chiffres et tirets');
      setSlugAvailable(false);
      return;
    }

    setSlugChecking(true);
    setSlugError(null);

    try {
      const { available, error } = await checkSlugAvailability(newSlug, businessId);

      if (error) {
        setSlugError('Erreur lors de la vérification');
        setSlugAvailable(false);
      } else {
        setSlugAvailable(available);
        if (!available) {
          setSlugError('Ce slug est déjà utilisé par une autre entreprise');
        }
      }
    } catch (err) {
      setSlugError('Erreur lors de la vérification');
      setSlugAvailable(false);
    } finally {
      setSlugChecking(false);
    }
  }, [businessId]);

  // Debounce slug validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.slug) {
        // If slug hasn't changed from original, keep it as available
        if (form.slug === originalSlug) {
          setSlugAvailable(true);
          setSlugError(null);
        } else {
          validateSlug(form.slug);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.slug, validateSlug, originalSlug]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Special handling for slug field
    if (name === 'slug') {
      const formattedSlug = generateSlug(value);
      setForm((prev) => ({
        ...prev,
        slug: formattedSlug
      }));
      setErrors((prev) => ({ ...prev, slug: null }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  const getLabel = (item) => {
    return i18n.language === 'en' ? item.label_en : item.label_fr;
  };

  // Save specific tab data
  const saveTab = async (tabName) => {
    try {
      setSubmitting(true);
      setStatus({ type: null, message: null });

      let payload = {};

      switch (tabName) {
        case 'basic':
          // Validate slug before saving
          if (!slugAvailable) {
            setStatus({ type: 'error', message: 'Le slug n\'est pas valide ou est déjà utilisé' });
            setSubmitting(false);
            return;
          }

          payload = {
            name: form.name,
            slug: form.slug, // Use the validated slug from form
            description: form.description,
            mission_statement: form.mission_statement || null,
            core_values: form.core_values || null,
            established_year: form.established_year ? parseInt(form.established_year) : null,
            business_size_id: form.business_size_id || null,
            is_franchise: form.is_franchise
          };
          break;

        case 'contact':
          payload = {
            phone: form.phone,
            email: form.email,
            show_email: form.show_email,
            website: form.website || null,
            facebook_url: form.facebook_url || null,
            instagram_url: form.instagram_url || null,
            twitter_url: form.twitter_url || null,
            linkedin_url: form.linkedin_url || null,
            threads_url: form.threads_url || null,
            tiktok_url: form.tiktok_url || null,
            address: form.address,
            address_line2: form.address_line2 || null,
            city: form.city,
            region: form.region || null,
            province: 'QC',
            postal_code: form.postal_code,
            latitude: form.latitude ? parseFloat(form.latitude) : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null
          };
          break;

        case 'categories':
          payload = {
            main_category_id: form.main_category_id || null,
            sub_category_ids: form.sub_category_ids,
            products_services: form.products_services
          };
          break;

        case 'services':
          payload = {
            language_ids: form.language_ids,
            service_mode_ids: form.service_mode_ids,
            certification_ids: form.certification_ids,
            service_area: form.service_area || null,
            service_radius_km: form.service_radius_km ? parseFloat(form.service_radius_km) : null
          };
          break;

        case 'accessibility':
          payload = {
            accessibility_feature_ids: form.accessibility_feature_ids,
            payment_method_ids: form.payment_method_ids
          };
          break;

        case 'images':
          // Upload logo if provided
          let logoUrl = null;
          if (logoFile) {
            setUploadProgress({ ...uploadProgress, logo: 50 });
            const logoResult = await uploadLogo(logoFile, businessId);
            logoUrl = logoResult.url;
            setUploadProgress({ ...uploadProgress, logo: 100 });
          }

          // Upload gallery images if provided
          let newGalleryUrls = [];
          if (galleryFiles.length > 0) {
            const galleryResults = await uploadMultipleGalleryImages(
              galleryFiles,
              businessId,
              (current, total) => {
                setUploadProgress({ ...uploadProgress, gallery: Math.round((current / total) * 100) });
              }
            );
            newGalleryUrls = galleryResults.map(r => r.url);
          }

          // Handle logo and gallery updates
          if (logoUrl) {
            payload.logo_url = logoUrl;
          }

          // Always update gallery if there are changes (new images or deletions)
          if (newGalleryUrls.length > 0 || currentGalleryImages.length > 0) {
            // Merge existing images with new ones
            payload.gallery_images = [...currentGalleryImages, ...newGalleryUrls];
          }
          break;

        default:
          break;
      }

      await updateBusiness(businessId, payload);

      setStatus({
        type: 'success',
        message: 'Modifications enregistrées avec succès!'
      });

      // Clear image files after successful upload
      if (tabName === 'images') {
        setLogoFile(null);
        setGalleryFiles([]);
      }

      setTimeout(() => setStatus({ type: null, message: null }), 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setStatus({ type: 'error', message: error.message || 'Une erreur est survenue.' });
    } finally {
      setSubmitting(false);
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
    <div className="edit-business-page">
      <div className="container">
        <div className="page-header">
          <h1>Modifier l'entreprise</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                const updatedBusiness = {
                  ...business,
                  slug: form.slug,
                  main_category_slug: lookupData.mainCategories.find(c => c.id === form.main_category_id)?.slug || business.main_category_slug,
                  city: form.city
                };
                navigate(getBusinessUrl(updatedBusiness));
              }}
            >
              Retour à la fiche
            </button>
          </div>
        </div>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="edit-business-container">
          {/* Tabs Navigation */}
          <div className="tabs-navigation">
            <button
              className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Informations de base
            </button>
            <button
              className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              Coordonnées
            </button>
            <button
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              Catégories
            </button>
            <button
              className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              Services
            </button>
            <button
              className={`tab-button ${activeTab === 'accessibility' ? 'active' : ''}`}
              onClick={() => setActiveTab('accessibility')}
            >
              Accessibilité
            </button>
            <button
              className={`tab-button ${activeTab === 'hours' ? 'active' : ''}`}
              onClick={() => setActiveTab('hours')}
            >
              Heures d'ouverture
            </button>
            <button
              className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              Images
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <h2>Informations de base</h2>

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
                    placeholder="Ex: Restaurant Le Gourmet"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">
                    URL personnalisée (slug) <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="mon-entreprise"
                      style={{
                        paddingRight: '40px',
                        borderColor: slugError ? '#ef4444' : (slugAvailable ? '#22c55e' : '#d1d5db')
                      }}
                    />
                    {slugChecking && (
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af'
                      }}>
                        ⟳
                      </span>
                    )}
                    {!slugChecking && slugAvailable === true && (
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#22c55e',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        ✓
                      </span>
                    )}
                    {!slugChecking && slugAvailable === false && (
                      <span style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#ef4444',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        ✗
                      </span>
                    )}
                  </div>
                  {slugError && <span className="error-message">{slugError}</span>}
                  {slugAvailable && !slugError && (
                    <small className="field-hint" style={{ color: '#22c55e' }}>
                      ✓ Ce slug est disponible
                    </small>
                  )}
                  <small className="field-hint">
                    URL finale: /{form.slug || 'votre-slug'}
                  </small>
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
                    placeholder="Décrivez votre entreprise..."
                  />
                  <div className="char-count">{form.description.length} caractères</div>
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

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('basic')}
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer les informations de base'}
                </button>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="tab-panel">
                <h2>Coordonnées</h2>

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
                      placeholder="Ex: (514) 555-1234"
                    />
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
                      placeholder="contact@entreprise.com"
                    />
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
                    placeholder="https://www.entreprise.com"
                  />
                </div>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>Réseaux sociaux</h3>

                <div className="form-group">
                  <label htmlFor="facebook_url">Facebook</label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={form.facebook_url}
                    onChange={handleChange}
                    placeholder="https://www.facebook.com/votreentreprise"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="instagram_url">Instagram</label>
                  <input
                    type="url"
                    id="instagram_url"
                    name="instagram_url"
                    value={form.instagram_url}
                    onChange={handleChange}
                    placeholder="https://www.instagram.com/votreentreprise"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="twitter_url">X (Twitter)</label>
                  <input
                    type="url"
                    id="twitter_url"
                    name="twitter_url"
                    value={form.twitter_url}
                    onChange={handleChange}
                    placeholder="https://x.com/votreentreprise"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="linkedin_url">LinkedIn</label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={form.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://www.linkedin.com/company/votreentreprise"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="threads_url">Threads</label>
                  <input
                    type="url"
                    id="threads_url"
                    name="threads_url"
                    value={form.threads_url}
                    onChange={handleChange}
                    placeholder="https://www.threads.net/@votreentreprise"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tiktok_url">TikTok</label>
                  <input
                    type="url"
                    id="tiktok_url"
                    name="tiktok_url"
                    value={form.tiktok_url}
                    onChange={handleChange}
                    placeholder="https://www.tiktok.com/@votreentreprise"
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
                    placeholder="123 Rue Principale"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address_line2">Adresse (ligne 2)</label>
                  <input
                    type="text"
                    id="address_line2"
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                    placeholder="Bureau 200"
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
                      }}
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
                      placeholder="H1A 1A1"
                    />
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
                      <strong>Méthode: Google Maps</strong>
                      <ol style={{ marginTop: '0.5rem', marginBottom: '0', paddingLeft: '1.5rem' }}>
                        <li>Allez sur <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>Google Maps</a></li>
                        <li>Tapez votre adresse dans la barre de recherche</li>
                        <li><strong>Clic droit</strong> sur le marqueur rouge (ou sur l'emplacement exact)</li>
                        <li>Cliquez sur les coordonnées qui apparaissent en premier dans le menu</li>
                        <li>Les coordonnées sont copiées! Collez-les ici (format: 45.5017, -73.5673)</li>
                      </ol>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px' }}>
                      <strong>⚠️ Important:</strong> Sans coordonnées GPS, la carte Google Maps ne s'affichera pas sur la page de votre entreprise.
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('contact')}
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer les coordonnées'}
                </button>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="tab-panel">
                <h2>Catégories et services</h2>

                <div className="form-group">
                  <label htmlFor="main_category_id">
                    Catégorie principale <span className="required">*</span>
                  </label>
                  <select
                    id="main_category_id"
                    name="main_category_id"
                    value={form.main_category_id}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionnez une catégorie...</option>
                    {lookupData.mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                {form.main_category_id && (
                  <div className="form-group">
                    <label>
                      Sous-catégories <span className="required">*</span>
                    </label>
                    <div className="checkbox-grid">
                      {filteredSubCategories.map((sub) => (
                        <AnimatedCheckbox
                          key={sub.id}
                          id={`sub-cat-${sub.id}`}
                          checked={form.sub_category_ids.includes(sub.id)}
                          onChange={() => handleMultiSelect('sub_category_ids', sub.id)}
                          label={getLabel(sub)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="products_services">
                    Produits et services <span className="required">*</span>
                  </label>
                  <p className="field-hint">Entrez un produit ou service par ligne. Chaque ligne apparaîtra comme un point dans la liste.</p>
                  <textarea
                    id="products_services"
                    name="products_services"
                    value={form.products_services}
                    onChange={handleChange}
                    rows="8"
                    placeholder="Exemple:&#10;Installation de chauffage&#10;Réparation de climatisation&#10;Entretien de thermopompes&#10;Service d'urgence 24/7"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('categories')}
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer les catégories'}
                </button>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="tab-panel">
                <h2>Services offerts</h2>
                <p className="help-text">Listez les services que vous offrez (maximum 20)</p>

                <div className="form-group">
                  <label htmlFor="products_services">Services et produits</label>
                  <textarea
                    id="products_services"
                    name="products_services"
                    value={form.products_services}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Ex: Consultation gratuite, Livraison à domicile, Service 24/7..."
                  />
                  <span className="help-text">Séparez les services par des virgules ou des retours à la ligne</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('services')}
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer les services'}
                </button>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="tab-panel">
                <h2>Accessibilité et paiement</h2>

                <div className="form-group">
                  <label>Caractéristiques d'accessibilité</label>
                  <div className="checkbox-grid">
                    {lookupData.accessibilityFeatures.map((feature) => (
                      <AnimatedCheckbox
                        key={feature.id}
                        id={`access-${feature.id}`}
                        checked={form.accessibility_feature_ids.includes(feature.id)}
                        onChange={() => handleMultiSelect('accessibility_feature_ids', feature.id)}
                        label={getLabel(feature)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Méthodes de paiement</label>
                  <div className="checkbox-grid">
                    {lookupData.paymentMethods.map((method) => (
                      <AnimatedCheckbox
                        key={method.id}
                        id={`payment-${method.id}`}
                        checked={form.payment_method_ids.includes(method.id)}
                        onChange={() => handleMultiSelect('payment_method_ids', method.id)}
                        label={getLabel(method)}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('accessibility')}
                  disabled={submitting}
                >
                  {submitting ? 'Enregistrement...' : 'Enregistrer l\'accessibilité'}
                </button>
              </div>
            )}

            {/* Hours Tab */}
            {activeTab === 'hours' && (
              <div className="tab-panel">
                <h2>Heures d'ouverture</h2>
                <BusinessHoursEditor businessId={businessId} />
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="tab-panel">
                <h2>Images</h2>

                <div className="form-group">
                  <label>Logo de l'entreprise (format carré 1:1 recommandé)</label>
                  <p className="field-hint">Le logo sera automatiquement compressé en format WebP</p>
                  <ImageUploader
                    type="logo"
                    currentImage={currentLogoUrl}
                    onImageSelect={(file) => setLogoFile(file)}
                    multiple={false}
                  />
                </div>

                <div className="form-group">
                  <label>Galerie photos (jusqu'à 10 images)</label>
                  <p className="field-hint">Les images seront automatiquement compressées en format WebP</p>

                  {/* Display existing gallery images */}
                  {currentGalleryImages.length > 0 && (
                    <div className="existing-gallery" style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        Images actuelles ({currentGalleryImages.length})
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                        {currentGalleryImages.map((imageUrl, index) => (
                          <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                            <img
                              src={imageUrl}
                              alt={`Gallery ${index + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentGalleryImages(prev => prev.filter((_, i) => i !== index));
                              }}
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                lineHeight: '1'
                              }}
                              title="Supprimer cette image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <ImageUploader
                    type="gallery"
                    onImageSelect={(files) => setGalleryFiles(files)}
                    multiple={true}
                    maxFiles={10}
                  />
                </div>

                {uploadProgress.logo > 0 && uploadProgress.logo < 100 && (
                  <div className="upload-progress">
                    Logo: {uploadProgress.logo}%
                  </div>
                )}

                {uploadProgress.gallery > 0 && uploadProgress.gallery < 100 && (
                  <div className="upload-progress">
                    Galerie: {uploadProgress.gallery}%
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('images')}
                  disabled={submitting || (!logoFile && galleryFiles.length === 0)}
                >
                  {submitting ? 'Téléversement...' : 'Téléverser les images'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default EditBusiness;
