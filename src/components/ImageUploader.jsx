import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ImageUploader.css';

// Fonction pour convertir une image en WebP
const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp'
              });
              resolve({ file: webpFile, preview: canvas.toDataURL('image/webp', quality) });
            } else {
              reject(new Error('Conversion WebP failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
};

const ImageUploader = ({
  type = 'gallery',
  currentImage = null,
  onImageSelect,
  multiple = false,
  maxFiles = 10,
  initialFiles = null
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef(null);

  // Handle initial files from Google import
  useEffect(() => {
    if (initialFiles) {
      const processInitialFiles = async () => {
        setConverting(true);
        try {
          if (multiple && Array.isArray(initialFiles)) {
            // Multiple files (gallery)
            const convertedResults = await Promise.all(
              initialFiles.map(file => convertToWebP(file, 0.85))
            );
            setPreviews(convertedResults);
          } else if (!multiple && initialFiles) {
            // Single file (logo)
            const file = Array.isArray(initialFiles) ? initialFiles[0] : initialFiles;
            const result = await convertToWebP(file, 0.8);
            setPreview(result.preview);
          }
        } catch (error) {
          console.error('Error processing initial files:', error);
        }
        setConverting(false);
      };
      processInitialFiles();
    }
  }, [initialFiles, multiple]);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    setConverting(true);
    const fileArray = Array.from(files);

    try {
      if (multiple) {
        // Multiple files for gallery - convert all to WebP
        const validFiles = fileArray.slice(0, maxFiles);
        const convertedResults = await Promise.all(
          validFiles.map(file => convertToWebP(file, 0.85))
        );

        setPreviews(convertedResults);
        onImageSelect(convertedResults.map(r => r.file));
      } else {
        // Single file for logo - convert to WebP
        const file = fileArray[0];
        const result = await convertToWebP(file, 0.9);
        setPreview(result.preview);
        onImageSelect(result.file);
      }
    } catch (error) {
      console.error('Error converting images:', error);
      alert('Erreur lors de la conversion des images. Veuillez réessayer.');
    } finally {
      setConverting(false);
    }
  };

  const handleChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removePreview = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImageSelect(newPreviews.map(p => p.file));
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="image-uploader-input"
      />

      {type === 'logo' && !preview && (
        <div
          className={`upload-area logo-upload ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p><strong>Logo 1:1</strong></p>
            <p>Cliquez ou glissez une image</p>
            <p className="upload-hint">Format carré recommandé (400x400px)</p>
          </div>
        </div>
      )}

      {type === 'logo' && preview && (
        <div className="logo-preview-container">
          <img src={preview} alt="Logo preview" className="logo-preview" />
          <button
            type="button"
            className="change-logo-btn"
            onClick={handleClick}
          >
            Changer le logo
          </button>
        </div>
      )}

      {type === 'gallery' && (
        <>
          <div
            className={`upload-area gallery-upload ${dragActive ? 'drag-active' : ''} ${converting ? 'converting' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!converting ? handleClick : undefined}
          >
            <div className="upload-placeholder">
              {converting ? (
                <>
                  <div className="spinner"></div>
                  <p><strong>Conversion en cours...</strong></p>
                  <p className="upload-hint">Optimisation des images en WebP</p>
                </>
              ) : (
                <>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <p><strong>Galerie photos</strong></p>
                  <p>Cliquez ou glissez jusqu'à {maxFiles} images</p>
                  <p className="upload-hint">Sélection multiple activée - Les images seront converties en WebP</p>
                </>
              )}
            </div>
          </div>

          {previews.length > 0 && (
            <div className="gallery-previews">
              {previews.map((item, index) => (
                <div key={index} className="gallery-preview-item">
                  <img src={item.preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-preview-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(index);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

ImageUploader.propTypes = {
  type: PropTypes.oneOf(['logo', 'gallery']),
  currentImage: PropTypes.string,
  onImageSelect: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  initialFiles: PropTypes.oneOfType([
    PropTypes.object, // Single File object
    PropTypes.arrayOf(PropTypes.object) // Array of File objects
  ])
};

export default ImageUploader;
