import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import './SponsorLogoUpload.css';

/**
 * Composant d'upload de logo pour les commanditaires
 * Permet de télécharger une image dans Supabase Storage
 */
export default function SponsorLogoUpload({ sponsorId, currentLogoUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogoUrl);
  const [error, setError] = useState(null);

  /**
   * Gestion du changement de fichier
   */
  async function handleFileChange(e) {
    try {
      setError(null);

      const file = e.target.files?.[0];
      if (!file) return;

      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format non supporté. Utilisez JPG, PNG, SVG ou WebP');
        return;
      }

      // Validation de la taille (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Fichier trop volumineux. Maximum 5MB');
        return;
      }

      // Prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload
      await uploadFile(file);
    } catch (err) {
      console.error('Erreur handleFileChange:', err);
      setError(err.message);
    }
  }

  /**
   * Upload du fichier vers Supabase Storage
   */
  async function uploadFile(file) {
    setUploading(true);
    setError(null);

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${sponsorId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload vers Storage
      const { error: uploadError } = await supabase.storage
        .from('sponsor-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Mettre à jour la table sponsors
      const { error: updateError } = await supabase
        .from('sponsors')
        .update({
          logo_storage_path: filePath,
          use_storage_logo: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', sponsorId);

      if (updateError) throw updateError;

      // Callback de succès
      if (onUploadSuccess) {
        const { data: publicUrl } = supabase.storage
          .from('sponsor-logos')
          .getPublicUrl(filePath);

        onUploadSuccess(publicUrl.publicUrl);
      }

      // Message de succès
      setError(null);
    } catch (err) {
      console.error('Erreur upload:', err);
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  /**
   * Supprimer le logo uploadé et revenir au logo par défaut
   */
  async function handleRemoveLogo() {
    if (!confirm('Voulez-vous supprimer votre logo personnalisé et revenir au logo par défaut?')) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Récupérer le chemin actuel
      const { data: sponsor } = await supabase
        .from('sponsors')
        .select('logo_storage_path')
        .eq('id', sponsorId)
        .single();

      // Supprimer du Storage
      if (sponsor?.logo_storage_path) {
        await supabase.storage
          .from('sponsor-logos')
          .remove([sponsor.logo_storage_path]);
      }

      // Mettre à jour la table sponsors
      const { error: updateError } = await supabase
        .from('sponsors')
        .update({
          logo_storage_path: null,
          use_storage_logo: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', sponsorId);

      if (updateError) throw updateError;

      // Réinitialiser la prévisualisation
      setPreview(null);

      if (onUploadSuccess) {
        onUploadSuccess(null);
      }
    } catch (err) {
      console.error('Erreur suppression logo:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="sponsor-logo-upload">
      <div className="upload-section">
        <label htmlFor="logo-upload" className="upload-label">
          Logo de votre publicité
        </label>

        {preview && (
          <div className="logo-preview">
            <img src={preview} alt="Aperçu du logo" />
          </div>
        )}

        <div className="upload-actions">
          <label htmlFor="logo-upload" className="upload-button">
            {uploading ? 'Téléchargement...' : 'Choisir un fichier'}
            <input
              id="logo-upload"
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>

          {preview && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="remove-button"
            >
              Supprimer
            </button>
          )}
        </div>

        <p className="upload-hint">
          Formats acceptés: JPG, PNG, SVG, WebP (max 5MB)
        </p>

        {error && (
          <div className="upload-error">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
