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

  // Track original category to detect changes for URL regeneration
  const [originalMainCategoryId, setOriginalMainCategoryId] = useState(null);

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

  // Form state - Correspond aux champs du wizard de création
  const [form, setForm] = useState({
    // Step 1: Basic Information
    name: '',
    slug: '',
    description: '',

    // Step 3: Contact Information
    phone: '',
    email: '',
    website: '',

    // Step 4: Address
    address: '',
    city: '',
    province: 'QC',
    postal_code: '',

    // Step 5: Categories
    main_category_id: '',
    sub_category_id: '',

    // Step 6: Services
    products_services: ''
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
          setStatus({ type: 'error', message: t('editBusiness.businessNotFound') });
          return;
        }

        // Check ownership
        if (business.owner_id !== user?.id) {
          setStatus({ type: 'error', message: t('editBusiness.unauthorizedEdit') });
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

        // Charger les catégories depuis la table de liaison business_categories
        // Note: business_categories stocke sub_category_id, on doit récupérer main_category_id depuis sub_categories
        const { data: businessCategories, error: catError } = await supabase
          .from('business_categories')
          .select(`
            sub_category_id,
            sub_categories (
              id,
              main_category_id
            )
          `)
          .eq('business_id', business.id)
          .eq('is_primary', true)
          .limit(1);

        console.log('📦 Chargement des catégories depuis business_categories:', {
          businessId: business.id,
          businessCategories,
          error: catError
        });

        let mainCategoryId = '';
        let subCategoryId = '';

        if (businessCategories && businessCategories.length > 0) {
          subCategoryId = businessCategories[0].sub_category_id || '';
          // Récupérer main_category_id depuis la relation
          if (businessCategories[0].sub_categories) {
            mainCategoryId = businessCategories[0].sub_categories.main_category_id || '';
          }

          console.log('✅ Catégories trouvées:', {
            mainCategoryId,
            subCategoryId
          });
        } else {
          console.warn('⚠️ Aucune catégorie trouvée pour cette entreprise');
        }

        // Populate form with existing data - seulement les champs du wizard
        const formValues = {
          name: business.name || '',
          slug: business.slug || '',
          description: business.description || '',
          phone: business.phone || '',
          email: business.email || '',
          website: business.website || '',
          address: business.address || '',
          city: business.city || '',
          province: business.province || 'QC',
          postal_code: business.postal_code || '',
          main_category_id: mainCategoryId,
          sub_category_id: subCategoryId,
          products_services: business.products_services || ''
        };

        console.log('📝 Remplissage du formulaire:', formValues);
        setForm(formValues);

        // Store original slug and mark as available
        setOriginalSlug(business.slug || '');
        setSlugAvailable(true);

        // Store original main category ID for URL regeneration detection
        setOriginalMainCategoryId(mainCategoryId);
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
  const filteredSubCategories = lookupData.subCategories.filter((sc) => {
    // Convertir les deux IDs en string pour la comparaison
    const scId = sc.main_category_id?.toString();
    const formId = form.main_category_id?.toString();
    return scId === formId;
  });

  // Debug logs
  console.log('🔍 EditBusiness - Filtering subcategories:', {
    mainCategoryId: form.main_category_id,
    totalSubCategories: lookupData.subCategories.length,
    filteredCount: filteredSubCategories.length,
    sample: lookupData.subCategories[0]
  });

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
            slug: form.slug,
            description: form.description
          };
          break;

        case 'contact':
          payload = {
            phone: form.phone,
            email: form.email,
            website: form.website || null,
            address: form.address,
            city: form.city,
            province: form.province || 'QC',
            postal_code: form.postal_code
          };
          break;

        case 'categories':
          // Les catégories sont gérées séparément via business_categories
          // On sauvegarde juste products_services ici
          payload = {
            products_services: form.products_services
          };

          // Mettre à jour la table de liaison business_categories
          // Note: business_categories stocke seulement sub_category_id
          if (businessId && form.sub_category_id) {
            // Supprimer les anciennes catégories
            await supabase
              .from('business_categories')
              .delete()
              .eq('business_id', businessId);

            // Insérer la nouvelle catégorie
            await supabase
              .from('business_categories')
              .insert({
                business_id: businessId,
                sub_category_id: form.sub_category_id,
                is_primary: true
              });

            // Détecter si la catégorie principale a changé pour régénérer l'URL
            const categoryChanged = form.main_category_id !== originalMainCategoryId;

            console.log('🔄 Vérification changement de catégorie:', {
              originalMainCategoryId,
              newMainCategoryId: form.main_category_id,
              categoryChanged
            });

            if (categoryChanged) {
              // Récupérer le slug de la nouvelle catégorie
              const selectedCategory = lookupData.mainCategories.find(
                cat => cat.id.toString() === form.main_category_id.toString()
              );

              if (selectedCategory) {
                console.log('🔄 Mise à jour du slug de catégorie:', {
                  oldSlug: business.main_category_slug,
                  newSlug: selectedCategory.slug
                });

                // Mettre à jour le main_category_slug dans la table businesses
                const { error: slugUpdateError } = await supabase
                  .from('businesses')
                  .update({
                    main_category_slug: selectedCategory.slug,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', businessId);

                if (slugUpdateError) {
                  console.error('❌ Erreur lors de la mise à jour du slug de catégorie:', slugUpdateError);
                } else {
                  console.log('✅ Slug de catégorie mis à jour avec succès');

                  // Mettre à jour l'état local pour le bouton "Voir la fiche"
                  setBusiness(prev => ({
                    ...prev,
                    main_category_slug: selectedCategory.slug
                  }));
                }
              }
            }
          }
          break;

        case 'services':
          payload = {
            products_services: form.products_services
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
        <div className="loading-spinner">{t('editBusiness.loading')}</div>
      </div>
    );
  }

  return (
    <div className="edit-business-page">
      <div className="container">
        <div className="page-header">
          <h1>{t('editBusiness.title')}</h1>
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
              {t('editBusiness.backToListing')}
            </button>
          </div>
        </div>

        {status.message && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="edit-business-container">
          {/* Tabs Navigation - Correspond au wizard de création */}
          <div className="tabs-navigation">
            <button
              className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              📋 {t('editBusiness.basicInfo')}
            </button>
            <button
              className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
              onClick={() => setActiveTab('images')}
            >
              📸 {t('editBusiness.logoPhotos')}
            </button>
            <button
              className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              📞 {t('editBusiness.contact')}
            </button>
            <button
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              🏷️ {t('editBusiness.categories')}
            </button>
            <button
              className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              ⚙️ Services
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="tab-panel">
                <h2>{t('editBusiness.basicInfo')}</h2>

                <div className="form-group">
                  <label htmlFor="name">
                    {t('editBusiness.businessName')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t('editBusiness.businessNamePlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="slug">
                    {t('editBusiness.slug')} <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder={t('editBusiness.slugPlaceholder')}
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
                      ✓ {t('editBusiness.slugAvailable')}
                    </small>
                  )}
                  <small className="field-hint">
                    {t('editBusiness.finalUrl')} /{form.slug || t('editBusiness.slugPlaceholder')}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    {t('editBusiness.description')} <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    placeholder={t('editBusiness.descriptionPlaceholder')}
                  />
                  <div className="char-count">{form.description.length} {t('editBusiness.characters')}</div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="business_size_id">{t('editBusiness.businessSize')}</label>
                    <select
                      id="business_size_id"
                      name="business_size_id"
                      value={form.business_size_id}
                      onChange={handleChange}
                    >
                      <option value="">{t('editBusiness.selectOption')}</option>
                      {lookupData.businessSizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {getLabel(size)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="established_year">{t('editBusiness.establishedYear')}</label>
                    <input
                      type="number"
                      id="established_year"
                      name="established_year"
                      value={form.established_year}
                      onChange={handleChange}
                      min="1800"
                      max={new Date().getFullYear()}
                      placeholder={t('editBusiness.yearPlaceholder')}
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
                    <span>{t('editBusiness.isFranchise')}</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('basic')}
                  disabled={submitting}
                >
                  {submitting ? t('editBusiness.saving') : t('editBusiness.saveBasicInfo')}
                </button>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="tab-panel">
                <h2>{t('editBusiness.contact')}</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">
                      {t('editBusiness.phone')} <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder={t('editBusiness.phonePlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      {t('editBusiness.email')} <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t('editBusiness.emailPlaceholder')}
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
                    <span>{t('editBusiness.showEmail')}</span>
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="website">{t('editBusiness.website')}</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder={t('editBusiness.websitePlaceholder')}
                  />
                </div>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#1e293b' }}>{t('editBusiness.socialNetworks')}</h3>

                <div className="form-group">
                  <label htmlFor="facebook_url">Facebook</label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={form.facebook_url}
                    onChange={handleChange}
                    placeholder={t('editBusiness.facebookPlaceholder')}
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
                    placeholder={t('editBusiness.instagramPlaceholder')}
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
                    placeholder={t('editBusiness.twitterPlaceholder')}
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
                    placeholder={t('editBusiness.linkedinPlaceholder')}
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
                    placeholder={t('editBusiness.threadsPlaceholder')}
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
                    placeholder={t('editBusiness.tiktokPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    {t('editBusiness.address')} <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder={t('editBusiness.addressPlaceholder')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address_line2">{t('editBusiness.addressLine2')}</label>
                  <input
                    type="text"
                    id="address_line2"
                    name="address_line2"
                    value={form.address_line2}
                    onChange={handleChange}
                    placeholder={t('editBusiness.addressLine2Placeholder')}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: '2' }}>
                    <label htmlFor="city">
                      {t('editBusiness.city')} <span className="required">*</span>
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
                      placeholder={t('editBusiness.cityPlaceholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="postal_code">
                      {t('editBusiness.postalCode')} <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      value={form.postal_code}
                      onChange={handleChange}
                      placeholder={t('editBusiness.postalCodePlaceholder')}
                    />
                  </div>
                </div>

                {form.region && (
                  <div className="form-group">
                    <label>{t('editBusiness.regionDetected')}</label>
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
                      {t('editBusiness.latitude')}
                    </label>
                    <input
                      type="text"
                      id="latitude"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder={t('editBusiness.latitudePlaceholder')}
                    />
                    <small className="help-text">
                      📍 {t('editBusiness.latitudeHelp')}
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="longitude">
                      {t('editBusiness.longitude')}
                    </label>
                    <input
                      type="text"
                      id="longitude"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder={t('editBusiness.longitudePlaceholder')}
                    />
                    <small className="help-text">
                      📍 {t('editBusiness.longitudeHelp')}
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
                  {submitting ? t('editBusiness.saving') : t('editBusiness.saveContact')}
                </button>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="tab-panel">
                <h2>{t('editBusiness.categories')}</h2>

                <div className="form-group">
                  <label htmlFor="main_category_id">
                    {t('editBusiness.mainCategory')} <span className="required">*</span>
                  </label>
                  <select
                    id="main_category_id"
                    name="main_category_id"
                    value={form.main_category_id || ''}
                    onChange={handleChange}
                  >
                    <option value="">{t('editBusiness.selectCategory')}</option>
                    {lookupData.mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {getLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                {form.main_category_id && filteredSubCategories.length > 0 && (
                  <div className="form-group">
                    <label htmlFor="sub_category_id">
                      {t('editBusiness.subCategory')}
                    </label>
                    <select
                      id="sub_category_id"
                      name="sub_category_id"
                      value={form.sub_category_id || ''}
                      onChange={handleChange}
                    >
                      <option value="">{t('editBusiness.noSubCategory')}</option>
                      {filteredSubCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {getLabel(sub)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('categories')}
                  disabled={submitting}
                >
                  {submitting ? t('editBusiness.saving') : t('editBusiness.saveCategories')}
                </button>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="tab-panel">
                <h2>{t('editBusiness.servicesOffered')}</h2>
                <p className="help-text">{t('editBusiness.servicesHelp')}</p>

                <div className="form-group">
                  <label htmlFor="products_services">{t('editBusiness.productsServices')}</label>
                  <textarea
                    id="products_services"
                    name="products_services"
                    value={form.products_services}
                    onChange={handleChange}
                    rows="5"
                    placeholder={t('editBusiness.productsServicesPlaceholder')}
                  />
                  <span className="help-text">{t('editBusiness.productsServicesHelp')}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('services')}
                  disabled={submitting}
                >
                  {submitting ? t('editBusiness.saving') : t('editBusiness.saveServices')}
                </button>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="tab-panel">
                <h2>{t('editBusiness.images')}</h2>

                <div className="form-group">
                  <label>{t('editBusiness.logoLabel')}</label>
                  <p className="field-hint">{t('editBusiness.logoHelp')}</p>
                  <ImageUploader
                    type="logo"
                    currentImage={currentLogoUrl}
                    onImageSelect={(file) => setLogoFile(file)}
                    multiple={false}
                  />
                </div>

                <div className="form-group">
                  <label>{t('editBusiness.galleryLabel')}</label>
                  <p className="field-hint">{t('editBusiness.galleryHelp')}</p>

                  {/* Display existing gallery images */}
                  {currentGalleryImages.length > 0 && (
                    <div className="existing-gallery" style={{ marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {t('editBusiness.currentImages')} ({currentGalleryImages.length})
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
                              title={t('editBusiness.deleteImage')}
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
                    {t('editBusiness.logoProgress')} {uploadProgress.logo}%
                  </div>
                )}

                {uploadProgress.gallery > 0 && uploadProgress.gallery < 100 && (
                  <div className="upload-progress">
                    {t('editBusiness.galleryProgress')} {uploadProgress.gallery}%
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => saveTab('images')}
                  disabled={submitting || (!logoFile && galleryFiles.length === 0)}
                >
                  {submitting ? t('editBusiness.uploading') : t('editBusiness.uploadImages')}
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
