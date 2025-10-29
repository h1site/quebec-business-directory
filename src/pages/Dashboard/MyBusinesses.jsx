import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocalizedLink from '../../components/LocalizedLink.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getBusinessesByOwner, deleteBusiness } from '../../services/businessService.js';
import { getBusinessUrl, getBusinessEditUrl } from '../../utils/urlHelpers.js';
import DeleteConfirmModal from '../../components/DeleteConfirmModal.jsx';
import './MyBusinesses.css';

const MyBusinesses = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, business: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const loadMyBusinesses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await getBusinessesByOwner(user.id);

        if (fetchError) {
          setError(t('myBusinesses.loading'));
          console.error(fetchError);
          return;
        }

        setBusinesses(data || []);
      } catch (err) {
        setError(t('myBusinesses.loading'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMyBusinesses();
  }, [user]);

  const handleDeleteClick = (business) => {
    setDeleteModal({ isOpen: true, business });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, business: null });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.business) return;

    try {
      setIsDeleting(true);
      setError(null);

      await deleteBusiness(deleteModal.business.id);

      // Remove from local state
      setBusinesses(businesses.filter(b => b.id !== deleteModal.business.id));

      // Show success message
      setSuccessMessage(`"${deleteModal.business.name}" a été supprimé avec succès.`);

      // Close modal
      setDeleteModal({ isOpen: false, business: null });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting business:', err);
      setError(t('myBusinesses.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2>{t('myBusinesses.accessDenied')}</h2>
        <p>{t('myBusinesses.mustBeLoggedIn')}</p>
        <LocalizedLink to="/connexion" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          {t('myBusinesses.signIn')}
        </LocalizedLink>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="loading-spinner">{t('myBusinesses.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="alert alert-error">{error}</div>
        <LocalizedLink to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          {t('myBusinesses.backHome')}
        </LocalizedLink>
      </div>
    );
  }

  return (
    <div className="my-businesses-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>{t('myBusinesses.title')}</h1>
            <p className="subtitle">
              {t('myBusinesses.manage')} {businesses.length} {businesses.length !== 1 ? t('myBusinesses.businesses') : t('myBusinesses.business')}
            </p>
          </div>
          <LocalizedLink to="/entreprise/nouvelle" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {t('myBusinesses.addBusiness')}
          </LocalizedLink>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {businesses.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <h2>{t('myBusinesses.noBusiness')}</h2>
            <p>{t('myBusinesses.noBusinessDescription')}</p>
            <LocalizedLink to="/entreprise/nouvelle" className="btn btn-primary">
              {t('myBusinesses.addFirst')}
            </LocalizedLink>
          </div>
        ) : (
          <div className="businesses-grid">
            {businesses.map((business) => (
              <div key={business.id} className="business-item">
                <div className="business-item-header">
                  <h3>{business.name}</h3>
                  {business.is_franchise && (
                    <span className="franchise-badge">{t('myBusinesses.franchise')}</span>
                  )}
                </div>

                <div className="business-item-body">
                  <p className="business-description">
                    {business.description?.substring(0, 120)}
                    {business.description?.length > 120 ? '...' : ''}
                  </p>

                  <div className="business-meta">
                    <div className="meta-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{business.city}</span>
                    </div>
                    {business.phone && (
                      <div className="meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>{business.phone}</span>
                      </div>
                    )}
                  </div>

                  {business.established_year && (
                    <p className="established-year">{t('myBusinesses.foundedIn')} {business.established_year}</p>
                  )}
                </div>

                <div className="business-item-footer">
                  {business.slug ? (
                    <>
                      <Link
                        to={getBusinessUrl(business)}
                        className="btn btn-secondary"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        {t('myBusinesses.viewListing')}
                      </Link>
                      <Link
                        to={getBusinessEditUrl(business)}
                        className="btn btn-primary"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        {t('myBusinesses.edit')}
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(business)}
                        className="btn btn-danger"
                        title={t('myBusinesses.deleteTitle')}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        {t('myBusinesses.delete')}
                      </button>
                    </>
                  ) : (
                    <div className="no-slug-warning">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span>Slug manquant - Visitez <LocalizedLink to="/admin/migration">la page de migration</LocalizedLink></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        businessName={deleteModal.business?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MyBusinesses;
