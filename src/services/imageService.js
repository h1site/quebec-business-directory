import { supabase, isSupabaseConfigured } from './supabaseClient.js';

/**
 * Compress an image file to WebP format
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default 1200 for gallery, 400 for logo)
 * @param {number} quality - Quality from 0 to 1 (default 0.8)
 * @returns {Promise<Blob>} - The compressed WebP blob
 */
export const compressImageToWebP = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Upload an image to Supabase Storage
 * @param {Blob} blob - The image blob to upload
 * @param {string} businessId - The business ID
 * @param {string} type - 'logo' or 'gallery'
 * @param {string} fileName - Optional custom file name
 * @returns {Promise<{url: string, path: string}>} - The public URL and storage path
 */
export const uploadImageToSupabase = async (blob, businessId, type = 'gallery', fileName = null) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase n\'est pas configuré');
  }

  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const name = fileName || `${type}_${timestamp}_${randomStr}.webp`;
  const filePath = `businesses/${businessId}/${type}/${name}`;

  const { data, error } = await supabase.storage
    .from('business-images')
    .upload(filePath, blob, {
      contentType: 'image/webp',
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('business-images')
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath
  };
};

/**
 * Delete an image from Supabase Storage
 * @param {string} filePath - The storage path of the image
 * @returns {Promise<void>}
 */
export const deleteImageFromSupabase = async (filePath) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase n\'est pas configuré');
  }

  const { error } = await supabase.storage
    .from('business-images')
    .remove([filePath]);

  if (error) {
    throw error;
  }
};

/**
 * Process and upload logo (1:1 ratio, 400x400 max)
 * @param {File} file - The logo file
 * @param {string} businessId - The business ID
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadLogo = async (file, businessId) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('L\'image ne doit pas dépasser 5MB');
  }

  // Compress to 400x400 for logo (1:1 ratio)
  const compressedBlob = await compressImageToWebP(file, 400, 0.9);

  // Upload to Supabase
  return await uploadImageToSupabase(compressedBlob, businessId, 'logo');
};

/**
 * Process and upload gallery image
 * @param {File} file - The gallery image file
 * @param {string} businessId - The business ID
 * @returns {Promise<{url: string, path: string}>}
 */
export const uploadGalleryImage = async (file, businessId) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('L\'image ne doit pas dépasser 10MB');
  }

  // Compress to 1200px max width
  const compressedBlob = await compressImageToWebP(file, 1200, 0.85);

  // Upload to Supabase
  return await uploadImageToSupabase(compressedBlob, businessId, 'gallery');
};

/**
 * Upload multiple gallery images
 * @param {FileList|File[]} files - The gallery image files
 * @param {string} businessId - The business ID
 * @param {Function} onProgress - Optional progress callback (current, total)
 * @returns {Promise<Array<{url: string, path: string}>>}
 */
export const uploadMultipleGalleryImages = async (files, businessId, onProgress = null) => {
  const results = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    try {
      const result = await uploadGalleryImage(files[i], businessId);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`Error uploading image ${i + 1}:`, error);
      // Continue with other images even if one fails
    }
  }

  return results;
};
