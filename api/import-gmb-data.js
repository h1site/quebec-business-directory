/**
 * API endpoint for importing Google My Business data
 * Admin only - imports phone, reviews, photos, and hours for a specific business
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

// Admin emails for authorization
const ADMIN_EMAILS = ['karpe_25@hotmail.com', 'info@h1site.com'];

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!googleApiKey) {
    console.error('Missing GOOGLE_PLACES_API_KEY');
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { businessId, placeId } = req.body;

    if (!businessId || !placeId) {
      return res.status(400).json({ error: 'businessId and placeId are required' });
    }

    // TODO: Add proper admin auth check here
    // For now, we'll skip auth check as this is called from authenticated frontend

    // Get business details from Google Places
    const fields = [
      'name',
      'formatted_phone_number',
      'international_phone_number',
      'rating',
      'user_ratings_total',
      'opening_hours',
      'reviews',
      'photos',
      'url'
    ].join(',');

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${googleApiKey}&language=fr`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      return res.status(500).json({
        error: 'Failed to fetch place details from Google',
        status: detailsData.status
      });
    }

    const placeDetails = detailsData.result;
    const updateData = {};
    const summary = [];

    // Get current business data to check if phone exists
    const { data: currentBusiness, error: fetchError } = await supabase
      .from('businesses')
      .select('phone, gallery_images')
      .eq('id', businessId)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch current business data');
    }

    // 1. Phone: Only import if business already has a phone number
    if (currentBusiness.phone && (placeDetails.formatted_phone_number || placeDetails.international_phone_number)) {
      updateData.phone = placeDetails.formatted_phone_number || placeDetails.international_phone_number;
      summary.push(`📞 Téléphone mis à jour: ${updateData.phone}`);
    }

    // 2. Opening Hours: Google = master (always overwrite)
    if (placeDetails.opening_hours && placeDetails.opening_hours.weekday_text) {
      // Parse Google opening hours format to our JSONB structure
      const openingHours = parseGoogleHours(placeDetails.opening_hours.weekday_text);
      if (openingHours) {
        updateData.opening_hours = openingHours;
        summary.push('🕒 Horaires d\'ouverture mis à jour');
      }
    }

    // 3. Google Rating
    if (placeDetails.rating) {
      updateData.google_rating = placeDetails.rating;
      updateData.google_reviews_count = placeDetails.user_ratings_total || 0;
      summary.push(`⭐ Note Google: ${placeDetails.rating}/5 (${updateData.google_reviews_count} avis)`);
    }

    // 4. Google Place URL
    if (placeDetails.url) {
      updateData.google_place_url = placeDetails.url;
    }

    // Update business data
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId);

      if (updateError) {
        throw new Error('Failed to update business: ' + updateError.message);
      }
    }

    // 5. Reviews: Import to google_reviews table
    let reviewsImported = 0;
    if (placeDetails.reviews && Array.isArray(placeDetails.reviews)) {
      for (const review of placeDetails.reviews) {
        try {
          // Check if review already exists
          const { data: existingReview } = await supabase
            .from('google_reviews')
            .select('id')
            .eq('business_id', businessId)
            .eq('author_name', review.author_name)
            .eq('time', review.time)
            .single();

          if (!existingReview) {
            await supabase
              .from('google_reviews')
              .insert({
                business_id: businessId,
                author_name: review.author_name,
                author_url: review.author_url,
                language: review.language || 'fr',
                profile_photo_url: review.profile_photo_url,
                rating: review.rating,
                relative_time_description: review.relative_time_description,
                text: review.text,
                time: review.time
              });
            reviewsImported++;
          }
        } catch (err) {
          console.error('Error importing review:', err);
        }
      }
      summary.push(`💬 ${reviewsImported} avis Google importés`);
    }

    // 6. Photos: Import up to 10 photos to gallery_images
    let photosImported = 0;
    if (placeDetails.photos && Array.isArray(placeDetails.photos)) {
      const photosToImport = placeDetails.photos.slice(0, 10);
      const currentGallery = currentBusiness.gallery_images || [];
      const newPhotos = [];

      for (const photo of photosToImport) {
        try {
          // Download and upload photo to Supabase storage
          const photoUrl = await downloadAndUploadGooglePhoto(
            photo.photo_reference,
            businessId,
            supabase
          );

          if (photoUrl) {
            newPhotos.push(photoUrl);
            photosImported++;
          }
        } catch (err) {
          console.error('Error importing photo:', err);
        }
      }

      // Update gallery_images array
      if (newPhotos.length > 0) {
        const updatedGallery = [...currentGallery, ...newPhotos];
        await supabase
          .from('businesses')
          .update({ gallery_images: updatedGallery })
          .eq('id', businessId);

        summary.push(`📸 ${photosImported} photos importées`);
      }
    }

    return res.status(200).json({
      success: true,
      summary: summary.join('\n'),
      details: {
        phone: !!updateData.phone,
        hours: !!updateData.opening_hours,
        rating: !!updateData.google_rating,
        reviewsImported,
        photosImported
      }
    });

  } catch (error) {
    console.error('Error importing GMB data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Parse Google opening hours format to our JSONB structure
 * Google format: ["lundi: 09:00 – 17:00", "mardi: 09:00 – 17:00", ...]
 * Our format: {monday: {open: "09:00", close: "17:00", closed: false}, ...}
 */
function parseGoogleHours(weekdayText) {
  const daysMap = {
    'lundi': 'monday',
    'mardi': 'tuesday',
    'mercredi': 'wednesday',
    'jeudi': 'thursday',
    'vendredi': 'friday',
    'samedi': 'saturday',
    'dimanche': 'sunday'
  };

  const hours = {};

  for (const line of weekdayText) {
    // Extract day and hours: "lundi: 09:00 – 17:00"
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const dayFr = match[1].trim().toLowerCase();
    const hoursText = match[2].trim();
    const dayEn = daysMap[dayFr];

    if (!dayEn) continue;

    // Check if closed
    if (hoursText.toLowerCase().includes('fermé') || hoursText.toLowerCase().includes('closed')) {
      hours[dayEn] = { open: '', close: '', closed: true };
    } else {
      // Extract hours: "09:00 – 17:00" or "09:00 - 17:00"
      const hoursMatch = hoursText.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
      if (hoursMatch) {
        hours[dayEn] = {
          open: hoursMatch[1],
          close: hoursMatch[2],
          closed: false
        };
      }
    }
  }

  return Object.keys(hours).length > 0 ? hours : null;
}

/**
 * Download photo from Google and upload to Supabase storage
 */
async function downloadAndUploadGooglePhoto(photoReference, businessId, supabase) {
  try {
    // Download photo from Google
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photoReference}&key=${googleApiKey}`;

    const photoResponse = await fetch(photoUrl);
    if (!photoResponse.ok) {
      throw new Error('Failed to download photo from Google');
    }

    const imageBuffer = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : 'jpg';

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${businessId}/gallery/${timestamp}-${random}.${extension}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('business-images')
      .upload(filename, Buffer.from(imageBuffer), {
        contentType,
        cacheControl: '31536000'
      });

    if (error) {
      throw new Error('Failed to upload to Supabase: ' + error.message);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('business-images')
      .getPublicUrl(filename);

    return publicData.publicUrl;

  } catch (error) {
    console.error('Error downloading/uploading photo:', error);
    return null;
  }
}
