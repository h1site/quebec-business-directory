import { useTranslation } from 'react-i18next';
import './DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, onClaim, businessName, isDeleting, showClaimButton = true }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={isDeleting}>×</button>

        <div className="delete-modal-header">
          <h2 className="delete-modal-title">{t('deleteModal.title')}</h2>
          <p className="delete-modal-subtitle">{t('deleteModal.subtitle')}</p>
        </div>

        <div className="delete-modal-benefits">
          <div className="benefit-item">
            <h3 className="benefit-title">{t('deleteModal.benefit1Title')}</h3>
            <p className="benefit-text">{t('deleteModal.benefit1Text')}</p>
          </div>

          <div className="benefit-item">
            <h3 className="benefit-title">{t('deleteModal.benefit2Title')}</h3>
            <p className="benefit-text">{t('deleteModal.benefit2Text')}</p>
          </div>

          <div className="benefit-item">
            <h3 className="benefit-title">{t('deleteModal.benefit3Title')}</h3>
            <p className="benefit-text">{t('deleteModal.benefit3Text')}</p>
          </div>

          <div className="benefit-item">
            <h3 className="benefit-title">{t('deleteModal.benefit4Title')}</h3>
            <p className="benefit-text">{t('deleteModal.benefit4Text')}</p>
          </div>
        </div>

        <div className="delete-modal-actions">
          {showClaimButton && (
            <button
              className="btn btn-primary btn-claim-instead"
              onClick={onClaim}
              disabled={isDeleting}
            >
              {t('deleteModal.claimButton')}
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('deleteModal.cancel')}
          </button>

          <button
            className="btn btn-delete-confirm"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Suppression...' : t('deleteModal.stillDelete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
