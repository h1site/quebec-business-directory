import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './WriteReviewModal.css';

const WriteReviewModal = ({ business, isOpen, onClose, onReviewSubmitted }) => {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkUser();
      checkExistingReview();
    }
  }, [isOpen]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const checkExistingReview = async () => {
    if (!business?.id) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('business_reviews')
      .select('*')
      .eq('business_id', business.id)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setExistingReview(data);
      setRating(data.rating);
      setComment(data.comment);
      setPhotos(data.photos || []);
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);

    // Limiter à 5 photos
    if (photos.length + files.length > 5) {
      setError('Vous pouvez ajouter un maximum de 5 photos');
      return;
    }

    // Valider chaque fichier
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Seules les images sont acceptées');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Les images doivent faire moins de 5MB');
        return;
      }
    }

    setPhotoFiles([...photoFiles, ...files]);

    // Créer des previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (photoFiles.length === 0) return [];

    const uploadedUrls = [];

    for (const file of photoFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${business.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erreur upload photo:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('review-photos')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!user) {
      setError('Vous devez être connecté pour écrire une critique');
      return;
    }

    if (rating === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    if (comment.length < 50) {
      setError('Votre critique doit contenir au moins 50 caractères');
      return;
    }

    setSubmitting(true);

    try {
      // Upload des photos
      const photoUrls = await uploadPhotos();

      const reviewData = {
        business_id: business.id,
        user_id: user.id,
        rating,
        comment,
        photos: photoUrls.length > 0 ? photoUrls : null
      };

      let result;
      if (existingReview) {
        // Mise à jour
        result = await supabase
          .from('business_reviews')
          .update(reviewData)
          .eq('id', existingReview.id);
      } else {
        // Création
        result = await supabase
          .from('business_reviews')
          .insert([reviewData]);
      }

      if (result.error) throw result.error;

      // Notifier le parent et fermer
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      resetForm();
      onClose();

    } catch (error) {
      console.error('Erreur soumission:', error);
      if (error.code === '23505') {
        setError('Vous avez déjà écrit une critique pour cette entreprise');
      } else {
        setError('Erreur lors de la soumission de votre critique');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setPhotos([]);
    setPhotoFiles([]);
    setError('');
    setExistingReview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {existingReview ? 'Modifier votre critique' : 'Écrire une critique'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="business-info">
            <h3>{business?.name}</h3>
            <p>{business?.city}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Sélection de la note */}
            <div className="form-section">
              <label>Note</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${star <= (hoverRating || rating) ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                ))}
                {rating > 0 && (
                  <span className="rating-label">
                    {rating === 1 && 'Décevant'}
                    {rating === 2 && 'Passable'}
                    {rating === 3 && 'Correct'}
                    {rating === 4 && 'Très bien'}
                    {rating === 5 && 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Commentaire */}
            <div className="form-section">
              <label htmlFor="comment">
                Votre expérience (minimum 50 caractères)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez votre expérience avec cette entreprise..."
                rows="6"
                maxLength="2000"
              />
              <div className="character-count">
                {comment.length} / 2000 caractères
                {comment.length < 50 && ` (minimum 50)`}
              </div>
            </div>

            {/* Photos */}
            <div className="form-section">
              <label>Photos (optionnel, max 5)</label>

              {photos.length > 0 && (
                <div className="photo-previews">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="photo-preview">
                      <img src={photo} alt={`Preview ${idx + 1}`} />
                      <button
                        type="button"
                        className="remove-photo"
                        onClick={() => removePhoto(idx)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < 5 && (
                <label className="photo-upload-btn">
                  Ajouter des photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting || rating === 0 || comment.length < 50}
              >
                {submitting ? 'Envoi...' : existingReview ? 'Mettre à jour' : 'Publier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;
