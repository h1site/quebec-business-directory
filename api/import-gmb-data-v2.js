/**
 * API endpoint for importing Google My Business data (Simplified version)
 * Admin only - imports phone, reviews, photos, and hours for a specific business
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

  // Check required environment variables
  if (!supabaseUrl) {
    console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL');
    return res.status(500).json({ error: 'Supabase URL not configured', details: 'SUPABASE_URL' });
  }

  if (!supabaseKey) {
    console.error('Missing SUPABASE_SERVICE_KEY or VITE_SUPABASE_ANON_KEY');
    return res.status(500).json({ error: 'Supabase key not configured', details: 'SUPABASE_KEY' });
  }

  if (!googleApiKey) {
    console.error('Missing GOOGLE_PLACES_API_KEY');
    return res.status(500).json({ error: 'Google API key not configured', details: 'GOOGLE_API_KEY' });
  }

  try {
    const { businessId, placeId } = req.body;

    if (!businessId || !placeId) {
      return res.status(400).json({ error: 'businessId and placeId are required' });
    }

    // Get business details from Google Places
    const fields = [
      'name',
      'formatted_phone_number',
      'international_phone_number',
      'rating',
      'user_ratings_total',
      'opening_hours',
      'url',
      'reviews'
    ].join(',');

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${googleApiKey}&language=fr`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      return res.status(500).json({
        error: 'Failed to fetch place details from Google',
        status: detailsData.status,
        message: detailsData.error_message || 'Unknown error from Google Places API'
      });
    }

    const placeDetails = detailsData.result;
    const updateData = {};
    const summary = [];

    // Get current business data using fetch
    const businessResponse = await fetch(
      `${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}&select=phone,gallery_images`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const businesses = await businessResponse.json();
    const currentBusiness = businesses[0];

    if (!currentBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // 1. Phone: Only import if business already has a phone number
    if (currentBusiness.phone && (placeDetails.formatted_phone_number || placeDetails.international_phone_number)) {
      updateData.phone = placeDetails.formatted_phone_number || placeDetails.international_phone_number;
      summary.push(`📞 Téléphone mis à jour: ${updateData.phone}`);
    }

    // 2. Google Rating
    if (placeDetails.rating) {
      updateData.google_rating = placeDetails.rating;
      updateData.google_reviews_count = placeDetails.user_ratings_total || 0;
      summary.push(`⭐ Note Google: ${placeDetails.rating}/5 (${updateData.google_reviews_count} avis)`);
    }

    // 3. Google Place URL
    if (placeDetails.url) {
      updateData.google_place_url = placeDetails.url;
      summary.push(`🔗 URL Google ajoutée`);
    }

    // 4. Google Reviews (up to 5)
    if (placeDetails.reviews && Array.isArray(placeDetails.reviews)) {
      // Google Places API returns max 5 reviews
      updateData.google_reviews = placeDetails.reviews.slice(0, 5);
      summary.push(`📝 ${updateData.google_reviews.length} avis Google importés`);
    }

    // 5. Opening Hours
    if (placeDetails.opening_hours && placeDetails.opening_hours.weekday_text) {
      const openingHours = parseGoogleHours(placeDetails.opening_hours.weekday_text);
      if (openingHours) {
        updateData.opening_hours = openingHours;
        summary.push('🕒 Horaires d\'ouverture mis à jour');
      }
    }

    // Update business data using Supabase REST API
    if (Object.keys(updateData).length > 0) {
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/businesses?id=eq.${businessId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        throw new Error('Failed to update business: ' + error);
      }
    }

    return res.status(200).json({
      success: true,
      summary: summary.length > 0 ? summary.join('\n') : 'Aucune donnée à importer',
      details: {
        phone: !!updateData.phone,
        hours: !!updateData.opening_hours,
        rating: !!updateData.google_rating
      }
    });

  } catch (error) {
    console.error('Error importing GMB data:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Parse Google opening hours format to our JSONB structure
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
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (!match) continue;

    const dayFr = match[1].trim().toLowerCase();
    const hoursText = match[2].trim();
    const dayEn = daysMap[dayFr];

    if (!dayEn) continue;

    if (hoursText.toLowerCase().includes('fermé') || hoursText.toLowerCase().includes('closed')) {
      hours[dayEn] = { open: '', close: '', closed: true };
    } else {
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
