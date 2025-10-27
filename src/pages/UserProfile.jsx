import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import WriteReviewModal from '../components/WriteReviewModal';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    avatar_url: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/connexion');
        return;
      }

      setUser(user);

      // Vérifier si l'utilisateur est admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(!!adminData);

      // Récupérer le profil existant
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile);
        setPreviewUrl(existingProfile.avatar_url || '/default-avatar.svg');
      } else {
        setPreviewUrl('/default-avatar.svg');
      }

      // Récupérer les critiques de l'utilisateur
      await loadUserReviews(user.id);

      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const loadUserReviews = async (userId) => {
    const { data, error } = await supabase
      .from('business_reviews')
      .select(`
        *,
        businesses:business_id (
          id,
          name,
          slug,
          city
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUserReviews(data);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image doit faire moins de 2MB');
        return;
      }

      setAvatarFile(file);

      // Créer une preview locale
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return profile.avatar_url;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        upsert: true
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      throw uploadError;
    }

    // Obtenir l'URL publique
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload de l'avatar si nécessaire
      let avatarUrl = profile.avatar_url;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const profileData = {
        user_id: user.id,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: avatarUrl
      };

      // Upsert (insert or update)
      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      alert('Profil mis à jour avec succès!');
      setProfile({ ...profile, avatar_url: avatarUrl });
      setAvatarFile(null);

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette critique?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('business_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      // Recharger les critiques
      await loadUserReviews(user.id);
      alert('Critique supprimée avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la critique');
    }
  };

  const handleReviewUpdated = async () => {
    setShowEditModal(false);
    setEditingReview(null);
    await loadUserReviews(user.id);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="user-profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            {isAdmin && (
              <Link to="/admin/moderation" className="btn-admin-link">
                🔍 Modération
              </Link>
            )}
            <button onClick={handleLogout} className="btn-logout">
              Déconnexion
            </button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-preview">
                <img src={previewUrl} alt="Avatar" />
              </div>
              <label className="btn-upload-avatar">
                Changer la photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="avatar-info">
                JPG, PNG ou GIF. Max 2MB.
              </p>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <div className="stat-value">{userReviews.length}</div>
                <div className="stat-label">Critiques</div>
              </div>
              <div className="stat">
                <div className="stat-value">
                  {user?.created_at ? formatDate(user.created_at) : '-'}
                </div>
                <div className="stat-label">Membre depuis</div>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <form onSubmit={handleSubmit} className="profile-form">
              <h2>Informations personnelles</h2>

              <div className="form-group">
                <label htmlFor="email">Courriel</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="input-disabled"
                />
                <small>Votre courriel ne peut pas être modifié</small>
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Nom complet</label>
                <input
                  type="text"
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Jean Tremblay"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Biographie</label>
                <textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Parlez-nous un peu de vous..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </form>

            <div className="user-reviews-section">
              <h2>Mes critiques ({userReviews.length})</h2>

              {userReviews.length === 0 ? (
                <p className="no-reviews">Vous n'avez pas encore écrit de critique.</p>
              ) : (
                <div className="reviews-list">
                  {userReviews.map((review) => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <h3>
                          <a href={`/entreprise/${review.businesses.slug}`}>
                            {review.businesses.name}
                          </a>
                        </h3>
                        <div className="review-rating">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      {review.photos && review.photos.length > 0 && (
                        <div className="review-photos">
                          {review.photos.map((photo, idx) => (
                            <img key={idx} src={photo} alt={`Photo ${idx + 1}`} />
                          ))}
                        </div>
                      )}
                      <div className="review-meta">
                        {review.businesses.city} • {formatDate(review.created_at)}
                      </div>
                      <div className="review-actions">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="btn-edit-review"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="btn-delete-review"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && editingReview && (
        <WriteReviewModal
          business={editingReview.businesses}
          existingReview={editingReview}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingReview(null);
          }}
          onReviewSubmitted={handleReviewUpdated}
        />
      )}
    </div>
  );
};

export default UserProfile;
