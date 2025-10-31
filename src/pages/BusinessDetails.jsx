import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocalizedLink from '../components/LocalizedLink.jsx';
import { Helmet } from 'react-helmet-async';
import { getBusinessBySlug } from '../services/businessService.js';
import { getBusinessHours } from '../services/businessHoursService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../services/supabaseClient.js';
import OpenStreetMap from '../components/OpenStreetMap.jsx';
import BusinessHours from '../components/BusinessHours.jsx';
import GoogleReviews from '../components/GoogleReviews.jsx';
import ClaimBusinessModal from '../components/ClaimBusinessModal.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import GooglePlacesImportModal from '../components/GooglePlacesImportModal.jsx';
import BusinessReviews from '../components/BusinessReviews.jsx';
import WriteReviewModal from '../components/WriteReviewModal.jsx';
import AmazonProducts from '../components/AmazonProducts.jsx';
import SponsorBox from '../components/SponsorBox.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import { getBusinessUrl, isLegacyUrl } from '../utils/urlHelpers.js';
import { generateBusinessSchema, generateBreadcrumbSchema } from '../utils/schemaMarkup.js';
import { localizedLink } from '../utils/languageRouting.js';
import './BusinessDetails.css';

const BusinessDetails = () => {
  const params = useParams();
  const location = useLocation();
  // Support both URL formats:
  // New: /:categorySlug/:citySlug/:slug
  // Legacy: /entreprise/:slug
  const slug = params.slug;
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [businessHours, setBusinessHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGMBImportModal, setShowGMBImportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  // Detect current language from URL
  const isEnglish = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const currentLang = isEnglish ? 'en' : 'fr';

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoading(true);

        // CRITICAL FIX: Check if SSR provided initial data for THIS specific business
        if (window.__INITIAL_BUSINESS_DATA__ && window.__INITIAL_BUSINESS_DATA__.slug === slug) {
          const data = window.__INITIAL_BUSINESS_DATA__;
          delete window.__INITIAL_BUSINESS_DATA__; // Use it only once to prevent stale data

          console.log('✅ Using SSR data for:', data.name);
          setBusiness(data);

          // Load business hours for schema markup
          if (data && data.id) {
            try {
              const { data: hours } = await getBusinessHours(data.id);
              setBusinessHours(hours);
            } catch (hoursError) {
              console.error('Error loading business hours:', hoursError);
            }
          }

          // Redirect legacy URLs to new SEO format
          if (data && isLegacyUrl(location.pathname)) {
            const newUrl = getBusinessUrl(data);
            navigate(newUrl, { replace: true });
          }

          setLoading(false);
          return; // Skip the Supabase fetch
        }

        // Fallback: Fetch from Supabase (for client-side navigation)
        console.log('🔄 Fetching from Supabase for:', slug);
        const { data, error: fetchError } = await getBusinessBySlug(slug);

        if (fetchError) {
          setError('Entreprise introuvable');
          return;
        }

        setBusiness(data);

        // Debug: Log business data to check categories
        console.log('🔍 Business data loaded:', {
          primary_main_category_fr: data.primary_main_category_fr,
          primary_main_category_slug: data.primary_main_category_slug,
          primary_sub_category_fr: data.primary_sub_category_fr,
          primary_sub_category_slug: data.primary_sub_category_slug,
          region: data.region,
          city: data.city
        });

        // Load business hours for schema markup
        if (data && data.id) {
          try {
            const { data: hours } = await getBusinessHours(data.id);
            setBusinessHours(hours);
          } catch (hoursError) {
            console.error('Error loading business hours:', hoursError);
            // Don't fail the whole page if hours fail to load
          }
        }

        // Redirect legacy URLs to new SEO format
        if (data && isLegacyUrl(location.pathname)) {
          const newUrl = getBusinessUrl(data);
          navigate(newUrl, { replace: true });
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'entreprise');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [slug, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="business-details-page">
        <div className="container business-main-container">
          {/* Skeleton loader to reserve space and prevent CLS */}
          <div className="business-skeleton">
            <div className="skeleton-breadcrumb" style={{
              height: '20px',
              width: '300px',
              backgroundColor: '#e2e8f0',
              borderRadius: '4px',
              marginBottom: '2rem'
            }}></div>
            <div className="business-header-hero">
              <div className="skeleton-logo" style={{
                width: '150px',
                height: '150px',
                backgroundColor: '#e2e8f0',
                borderRadius: '16px'
              }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton-title" style={{
                  height: '40px',
                  width: '60%',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}></div>
                <div className="skeleton-meta" style={{
                  height: '20px',
                  width: '40%',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}></div>
                <div className="skeleton-meta" style={{
                  height: '20px',
                  width: '50%',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
            <div style={{
              height: '200px',
              backgroundColor: '#e2e8f0',
              borderRadius: '12px',
              marginTop: '2rem'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>{error || 'Entreprise introuvable'}</h2>
        <LocalizedLink to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Retour à l'accueil
        </LocalizedLink>
      </div>
    );
  }

  const isOwner = user && user.id === business.owner_id;

  // A business is considered claimed if EITHER is_claimed is true OR it has an owner_id
  // This prevents display bugs if is_claimed flag is out of sync with owner_id
  const isClaimed = business.is_claimed || !!business.owner_id;

  // Check if user is admin (based on email domain or specific admin emails)
  const isAdmin = user && (
    user.email === 'info@h1site.com' ||
    user.email === 'admin@registreduquebec.com' ||
    user.email?.endsWith('@h1site.com')
  );

  // Generate canonical URL
  const canonicalUrl = `${window.location.origin}${getBusinessUrl(business)}`;

  // Handler to open delete confirmation modal
  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  // Handler to confirm deletion (sends email)
  const handleConfirmDelete = () => {
    // Send email to request deletion
    window.location.href = `mailto:info@h1site.com?subject=${encodeURIComponent('Demande de suppression - ' + window.location.href)}`;
    setShowDeleteModal(false);
  };

  // Handler to claim business from delete modal
  const handleClaimFromDeleteModal = () => {
    setShowDeleteModal(false);
    setShowClaimModal(true);
  };

  // Handler to permanently delete business from database (Admin only)
  const handleDeleteFromDB = async () => {
    if (!isAdmin) {
      alert('Accès non autorisé');
      return;
    }

    const confirmDelete = window.confirm(
      `⚠️ ATTENTION: Voulez-vous vraiment SUPPRIMER DÉFINITIVEMENT cette entreprise de la base de données?\n\n` +
      `Entreprise: ${business.name}\n` +
      `ID: ${business.id}\n\n` +
      `Cette action est IRRÉVERSIBLE et supprimera toutes les données associées.`
    );

    if (!confirmDelete) return;

    const doubleConfirm = window.prompt(
      `Pour confirmer la suppression, tapez le nom exact de l'entreprise:\n"${business.name}"`
    );

    if (doubleConfirm !== business.name) {
      alert('Nom incorrect. Suppression annulée.');
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', business.id);

      if (error) throw error;

      alert('✅ Entreprise supprimée de la base de données.');
      navigate('/');
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('❌ Erreur lors de la suppression: ' + error.message);
    }
  };

  // Handler to import Google My Business data (Admin only)
  const handleImportGMB = async (placeId) => {
    if (!isAdmin) {
      alert('Accès non autorisé');
      return;
    }

    try {
      const response = await fetch('/api/import-gmb-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          placeId: placeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'importation');
      }

      alert(`✅ Import réussi!\n\n${data.summary}`);

      // Reload business data to show updated info
      window.location.reload();
    } catch (error) {
      console.error('Error importing GMB data:', error);
      throw error;
    }
  };

  // Generate description for meta tags
  const cityName = business.city || 'Québec';
  const metaDescription = business.description
    ? business.description.substring(0, 160)
    : `${business.name} - ${cityName}, QC`;

  return (
    <>
      {/* IMPORTANT: React Helmet disabled for business pages - SSR handles all meta tags
          The server-side rendering (api/seo.js) already injects correct meta tags in HTML
          React Helmet would override them with wrong data causing canonical/description issues
          SEO bots read the initial HTML, not React-modified DOM */}

      <div className="business-details-page">
        <div className="container business-main-container">
          {/* Actions buttons - Top right (Owner/Admin only) */}
          <div className="business-actions-top">
            {isOwner && (
              <Link
                to={getBusinessUrl(business) + '/modifier'}
                className="btn btn-edit"
              >
                {t('business.editListing')}
              </Link>
            )}
            {isAdmin && (
              <>
                <button
                  className="btn btn-import-gmb"
                  onClick={() => setShowGMBImportModal(true)}
                  title="Importer les données depuis Google My Business (Admin seulement)"
                >
                  🌐 Importer GMB
                </button>
                <button
                  className="btn btn-delete-db"
                  onClick={handleDeleteFromDB}
                  title="Supprimer définitivement de la base de données (Admin seulement)"
                >
                  🗑️ Supprimer DB
                </button>
              </>
            )}
          </div>

          {/* Breadcrumb Navigation */}
          <Breadcrumb
            items={[
              { name: i18n.language === 'en' ? 'Home' : 'Accueil', url: '/' },
              ...(business.main_category ? [{
                name: i18n.language === 'en' ? business.main_category.label_en : business.main_category.label_fr,
                url: `/categorie/${business.main_category.slug}`
              }] : []),
              ...(business.city ? [{
                name: business.city,
                url: `/recherche?city=${encodeURIComponent(business.city)}`
              }] : []),
              { name: business.name }
            ]}
          />

          {/* Header: 2 columns - Logo left, Title right */}
          <div className="business-header-hero">
            {business.logo_url && (
              <div className="business-logo-large">
                <img
                  src={business.logo_url}
                  alt={`Logo ${business.name}`}
                  loading="lazy"
                  decoding="async"
                  width="150"
                  height="150"
                />
              </div>
            )}
            <div className="business-title-full">
              <h1 className="business-name-large">{business.name}</h1>
              <div className="business-meta-row">
                {business.is_franchise && (
                  <span className="franchise-badge">Franchise</span>
                )}
                {business.established_year && (
                  <span className="established-year-inline">{t('business.establishedIn')} {business.established_year}</span>
                )}
              </div>
              {/* Unclaimed business notice - only show for REQ imports */}
              {!isClaimed && business.data_source === 'req' && (
                <div className="unclaimed-notice">
                  ℹ️ {t('business.unclaimedNotice')}
                </div>
              )}
              {/* Claim/Delete buttons - Below warning */}
              {!isClaimed && (
                <div className="business-actions-below-warning">
                  {user && !isOwner && (
                    <button
                      className="btn btn-claim"
                      onClick={() => setShowClaimModal(true)}
                    >
                      {t('business.claimListing')}
                    </button>
                  )}
                  {!user && (
                    <button
                      className="btn btn-claim"
                      onClick={() => navigate(localizedLink('/connexion', currentLang), { state: { from: location.pathname } })}
                    >
                      {t('business.claimListing')}
                    </button>
                  )}
                  <button
                    onClick={handleDeleteRequest}
                    className="btn btn-delete"
                  >
                    {t('business.deleteListing')}
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Main Content */}
        <div className="business-content">
          {/* Left Column */}
          <div className="business-main">
            {/* Beta Notice */}
            <section className="business-section business-beta-section">
              <div className="beta-content">
                <span className="beta-badge">BÊTA</span>
                <p>{t('hero.betaNotice')}</p>
              </div>
            </section>

            {/* About & Products/Services Combined */}
            <section className="business-section">
              <h2 className="section-title">{t('business.about')}</h2>
              <p className="business-description">{business.description}</p>

              {/* Unclaimed Business Notice - Only show if business is not claimed (no owner_id and is_claimed = false) */}
              {!business.owner_id && !business.is_claimed && (
                <div className="unclaimed-owner-notice">
                  <p className="unclaimed-info-source">{t('business.unclaimedInfoSource')}</p>
                  <h3 className="unclaimed-owner-title">{t('business.unclaimedOwnerTitle')}</h3>
                  <p className="unclaimed-owner-cta">{t('business.unclaimedOwnerCTA')}</p>
                  <p className="unclaimed-owner-benefits">{t('business.unclaimedOwnerBenefits')}</p>
                  <p className="unclaimed-owner-manage">{t('business.unclaimedOwnerManage')}</p>
                </div>
              )}

              {business.products_services && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 className="section-subtitle">{t('business.productsServices')}</h3>
                  <ul className="services-list">
                    {business.products_services.split('\n').filter(line => line.trim()).map((service, index) => (
                      <li key={index}>{service.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Gallery */}
            {business.gallery_images && business.gallery_images.length > 0 && (
              <section className="business-section">
                <h2 className="section-title">{t('business.photoGallery')}</h2>
                <div className="business-gallery">
                  {business.gallery_images.map((imageUrl, index) => (
                    <div key={index} className="gallery-item">
                      <img
                        src={imageUrl}
                        alt={`${business.name} - Photo ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {business.mission_statement && (
              <section className="business-section">
                <h2 className="section-title">{t('business.mission')}</h2>
                <p>{business.mission_statement}</p>
              </section>
            )}

            {business.core_values && (
              <section className="business-section">
                <h2 className="section-title">{t('business.values')}</h2>
                <p>{business.core_values}</p>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="business-sidebar">
            {/* Combined Contact Card */}
            <div className="sidebar-card">
              {/* Address Section - Afficher seulement si show_address est TRUE */}
              {business.show_address !== false && (
                <div className="contact-section">
                  <h3 className="sidebar-title">{t('business.address')}</h3>
                  <div className="address-info">
                    <p>{business.address}</p>
                    {business.address_line2 && <p>{business.address_line2}</p>}
                    <p>
                      {business.city}, {business.province || 'QC'} {business.postal_code}
                    </p>
                    {business.region && <p className="region">{business.region}</p>}
                    {business.neq && (
                      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                        <strong>NEQ:</strong> {business.neq}
                      </p>
                    )}
                  </div>
                  {(business.latitude && business.longitude) || business.address ? (
                    <a
                      href={
                        business.latitude && business.longitude
                          ? `https://waze.com/ul?ll=${business.latitude},${business.longitude}&navigate=yes&utm_source=registreduquebec`
                          : `https://waze.com/ul?q=${encodeURIComponent(`${business.address}, ${business.city}, ${business.province || 'QC'}`)}&navigate=yes&utm_source=registreduquebec`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-waze waze-address-button"
                    >
                      <img src="/images/logos/waze.svg" alt="Waze" className="waze-icon" />
                      {t('business.openInWaze')}
                    </a>
                  ) : null}
                </div>
              )}

              {/* Contact Information Section - Only show if at least one contact method exists */}
              {(business.phone || (business.email && business.show_email !== false) || business.website) && (
                <div className="contact-section">
                  <h3 className="sidebar-title">{t('business.contact')}</h3>
                  <div className="contact-info">
                    {business.phone && (
                      <div className="contact-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <a href={`tel:${business.phone}`}>{business.phone}</a>
                      </div>
                    )}
                    {business.email && business.show_email !== false && (
                      <div className="contact-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        <a href={`mailto:${business.email}`}>{business.email}</a>
                      </div>
                    )}
                    {business.website && (
                      <div className="contact-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <a href={business.website} target="_blank" rel={`noopener noreferrer${(business.data_source === 'req' && !isClaimed) ? ' nofollow' : ''}`}>
                          {t('business.website')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Hours Section */}
              <div className="contact-section">
                <BusinessHours businessId={business.id} language={i18n.language} />
              </div>

              {/* Opening Hours Section */}
              {business.opening_hours && (
                <div className="contact-section">
                  <h3 className="sidebar-title">{t('business.openingHours')}</h3>
                  <div className="hours-list">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                      const hours = business.opening_hours[day];
                      if (!hours) return null;

                      return (
                        <div key={day} className="hours-item">
                          <span className="hours-day">{t(`business.days.${day}`)}</span>
                          <span className="hours-time">
                            {hours.closed
                              ? t('business.closed')
                              : `${hours.open} - ${hours.close}`
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Social Media Section */}
              {(business.facebook_url || business.instagram_url || business.twitter_url || business.linkedin_url || business.threads_url || business.tiktok_url) && (
                <div className="contact-section">
                  <h3 className="sidebar-title">{t('business.socialMedia')}</h3>
                  <div className="social-media-links">
                    {business.facebook_url && (
                      <a href={business.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link facebook" title="Facebook">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {business.instagram_url && (
                      <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    )}
                    {business.twitter_url && (
                      <a href={business.twitter_url} target="_blank" rel="noopener noreferrer" className="social-link twitter" title="X (Twitter)">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                    )}
                    {business.linkedin_url && (
                      <a href={business.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                    {business.threads_url && (
                      <a href={business.threads_url} target="_blank" rel="noopener noreferrer" className="social-link threads" title="Threads">
                        <img src="/images/socialnetwork/threads.svg" alt="Threads" width="24" height="24" />
                      </a>
                    )}
                    {business.tiktok_url && (
                      <a href={business.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-link tiktok" title="TikTok">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Google Reviews */}
            {(business.google_rating || (business.google_reviews && business.google_reviews.length > 0)) && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Avis Google</h3>
                <GoogleReviews
                  rating={business.google_rating}
                  reviewsCount={business.google_reviews_count}
                  reviews={business.google_reviews || []}
                />
              </div>
            )}

            {/* Sponsor Box */}
            <SponsorBox />

            {/* Service Area */}
            {business.service_area && (
              <div className="sidebar-card">
                <h3 className="sidebar-title">Zone de service</h3>
                <p>{business.service_area}</p>
                {business.service_radius_km && (
                  <p className="service-radius">Rayon: {business.service_radius_km} km</p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Amazon Products Section */}
      <div className="container">
        <AmazonProducts categorySlug={business.primary_sub_category_slug || business.primary_main_category_slug} />
      </div>

      {/* Reviews Section - Full Width */}
      <div className="container business-reviews-section">
        <BusinessReviews
          key={reviewsKey}
          businessId={business.id}
          onWriteReviewClick={() => {
            if (!user) {
              navigate(localizedLink('/connexion', currentLang), { state: { from: location.pathname } });
            } else {
              setShowReviewModal(true);
            }
          }}
        />
      </div>

      {/* Full Width Map Section - Afficher seulement si show_address est TRUE */}
      {business.show_address !== false && (
        <div className="full-width-map-section">
          <div className="map-container">
            <h2 className="map-title">Localisation</h2>
            <OpenStreetMap
              address={business.address}
              city={business.city}
              businessName={business.name}
              latitude={business.latitude}
              longitude={business.longitude}
            />
          </div>
        </div>
      )}
    </div>

    {/* Claim Business Modal */}
    {showClaimModal && user && (
      <ClaimBusinessModal
        business={business}
        user={user}
        onClose={() => setShowClaimModal(false)}
        onSuccess={() => {
          // Reload page to update claimed status
          window.location.reload();
        }}
      />
    )}

    {/* Delete Confirmation Modal */}
    <DeleteConfirmModal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      onConfirm={handleConfirmDelete}
      onClaim={handleClaimFromDeleteModal}
      businessName={business?.name}
      isDeleting={false}
    />

    {/* Google My Business Import Modal (Admin only) */}
    <GooglePlacesImportModal
      isOpen={showGMBImportModal}
      onClose={() => setShowGMBImportModal(false)}
      onImport={handleImportGMB}
      businessName={business?.name || ''}
      businessAddress={business?.address || ''}
      businessCity={business?.city || ''}
    />

    {/* Write Review Modal */}
    {showReviewModal && (
      <WriteReviewModal
        business={business}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onReviewSubmitted={() => {
          setReviewsKey(prev => prev + 1); // Force refresh reviews
          setShowReviewModal(false);
        }}
      />
    )}
    </>
  );
};

export default BusinessDetails;
