import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './WizardStep.css';

const WizardStep3_Media = ({ formData, updateFormData, onValidationChange }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Validate on mount and when data changes
  useEffect(() => {
    const newErrors = {};

    // Logo is now required
    if (!formData.logo && !formData.logo_preview) {
      newErrors.logo = t('wizard.step3.logoError');
    }

    setErrors(newErrors);
    onValidationChange(Object.keys(newErrors).length === 0);
  }, [formData.logo, formData.logo_preview, formData.images, onValidationChange, t]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(t('wizard.step3.fileTooLarge'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert(t('wizard.step3.invalidImage'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateFormData({
        logo: file,
        logo_preview: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = formData.images?.length || 0;

    if (currentImageCount + files.length > MAX_IMAGES) {
      alert(t('wizard.step3.tooManyFiles', { remaining: MAX_IMAGES - currentImageCount }));
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(t('wizard.step3.fileNameTooLarge', { name: file.name }));
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(t('wizard.step3.fileNotImage', { name: file.name }));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newImages = [...(formData.images || [])];
    const newPreviews = [...(formData.image_previews || [])];

    let loaded = 0;
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(file);
        newPreviews.push(reader.result);
        loaded++;

        if (loaded === validFiles.length) {
          updateFormData({
            images: newImages,
            image_previews: newPreviews
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeLogo = () => {
    updateFormData({
      logo: null,
      logo_preview: null
    });
  };

  const removeImage = (index) => {
    const newImages = [...(formData.images || [])];
    const newPreviews = [...(formData.image_previews || [])];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    updateFormData({
      images: newImages,
      image_previews: newPreviews
    });
  };

  const imageCount = formData.images?.length || 0;
  const canAddMore = imageCount < MAX_IMAGES;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h2>{t('wizard.step3.title')}</h2>
        <p className="step-description">
          {t('wizard.step3.description')}
        </p>
      </div>

      <div className="step-content">
        {/* Logo Upload */}
        <div className="form-group">
          <label className="form-label required">{t('wizard.step3.logoLabel')}</label>

          {formData.logo_preview ? (
            <div className="media-preview-container">
              <div className="logo-preview">
                <img src={formData.logo_preview} alt="Logo" />
                <button
                  type="button"
                  className="remove-media-btn"
                  onClick={removeLogo}
                  title="Supprimer le logo"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-area">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file-input"
              />
              <label htmlFor="logo-upload" className="upload-label">
                <div className="upload-icon">📷</div>
                <div className="upload-text">
                  <strong>{t('wizard.step3.logoUploadText')}</strong>
                  <span>{t('wizard.step3.logoUploadHint')}</span>
                </div>
              </label>
            </div>
          )}
          {errors.logo && <span className="error-message">{errors.logo}</span>}
          <span className="help-text">
            {t('wizard.step3.logoHelp')}
          </span>
        </div>

        {/* Gallery Upload */}
        <div className="form-group">
          <label className="form-label">
            {t('wizard.step3.photosLabel', { count: imageCount, max: MAX_IMAGES })}
          </label>

          {formData.image_previews && formData.image_previews.length > 0 && (
            <div className="gallery-preview">
              {formData.image_previews.map((preview, index) => (
                <div key={index} className="gallery-preview-item">
                  <img src={preview} alt={`Photo ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-media-btn"
                    onClick={() => removeImage(index)}
                    title="Supprimer cette photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {canAddMore && (
            <div className="upload-area">
              <input
                type="file"
                id="images-upload"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                className="file-input"
              />
              <label htmlFor="images-upload" className="upload-label">
                <div className="upload-icon">🖼️</div>
                <div className="upload-text">
                  <strong>{t('wizard.step3.photosUploadText')}</strong>
                  <span>{t('wizard.step3.photosUploadHint', { remaining: MAX_IMAGES - imageCount })}</span>
                </div>
              </label>
            </div>
          )}

          <span className="help-text">
            {t('wizard.step3.photosHelp')}
          </span>
        </div>
      </div>
    </div>
  );
};

WizardStep3_Media.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onValidationChange: PropTypes.func.isRequired
};

export default WizardStep3_Media;
