/**
 * Google Business Profile Import Service
 *
 * This service provides functionality to import business data from Google Business Profile
 * using either the Place ID or Business URL.
 *
 * Note: Calls are proxied through the backend to avoid CORS issues
 * API Documentation: https://developers.google.com/my-business/content/overview
 */

// Use backend proxy endpoint instead of direct API calls
// In production (Vercel), use /api. In development, use VITE_API_URL if defined (e.g., http://localhost:3001/api)
// IMPORTANT: Always use relative paths or HTTPS in production to avoid Mixed Content errors
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set and not localhost, ensure it uses HTTPS in production
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    // In production, force HTTPS if the URL contains http://
    if (import.meta.env.MODE === 'production' && apiUrl.startsWith('http://')) {
      return apiUrl.replace('http://', 'https://');
    }
    return apiUrl;
  }
  // Default: use relative path in production, localhost in development
  return import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
const PROXY_ENDPOINT = `${API_BASE_URL}/google-places`;

/**
 * Extract Place ID from various Google Business/Maps URL formats
 * Supports formats:
 * - https://www.google.com/maps/place/...
 * - https://goo.gl/maps/...
 * - https://maps.app.goo.gl/...
 * - Direct Place ID
 */
export const extractPlaceIdFromUrl = (url) => {
  if (!url) return null;

  // Direct Place ID (alphanumeric string)
  if (/^[A-Za-z0-9_-]{20,}$/.test(url)) {
    return url;
  }

  try {
    const urlObj = new URL(url);

    // Extract from query parameter
    const cidParam = urlObj.searchParams.get('cid');
    if (cidParam) {
      return cidParam;
    }

    // Extract from path for google.com/maps/place
    const placeMatch = urlObj.pathname.match(/\/place\/[^/]+\/data=.*!1s([A-Za-z0-9_-]+)/);
    if (placeMatch) {
      return placeMatch[1];
    }

    // Extract from ftid parameter
    const ftidParam = urlObj.searchParams.get('ftid');
    if (ftidParam) {
      return ftidParam;
    }

    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

/**
 * Search for a place by name and address (via backend proxy)
 */
export const searchPlace = async (businessName, address) => {
  const response = await fetch(`${PROXY_ENDPOINT}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ businessName, address })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Business not found on Google Maps');
  }

  const data = await response.json();
  return data.placeId;
};

/**
 * Get detailed business information from Google Places API (via backend proxy)
 */
export const getPlaceDetails = async (placeId) => {
  const response = await fetch(`${PROXY_ENDPOINT}/details/${placeId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch place details');
  }

  return await response.json();
};

/**
 * Map Google Places category to our main category
 */
const mapGoogleTypeToCategory = (types) => {
  const typeMapping = {
    restaurant: 'restauration-et-alimentation',
    food: 'restauration-et-alimentation',
    cafe: 'restauration-et-alimentation',
    bar: 'restauration-et-alimentation',
    bakery: 'restauration-et-alimentation',

    store: 'commerce-de-detail',
    shopping_mall: 'commerce-de-detail',
    clothing_store: 'commerce-de-detail',
    jewelry_store: 'commerce-de-detail',
    book_store: 'commerce-de-detail',
    electronics_store: 'commerce-de-detail',
    pet_store: 'commerce-de-detail',

    doctor: 'sante-et-bien-etre',
    dentist: 'sante-et-bien-etre',
    hospital: 'sante-et-bien-etre',
    pharmacy: 'sante-et-bien-etre',
    physiotherapist: 'sante-et-bien-etre',
    gym: 'sante-et-bien-etre',
    spa: 'sante-et-bien-etre',

    lawyer: 'services-professionnels',
    accounting: 'services-professionnels',
    real_estate_agency: 'immobilier',
    insurance_agency: 'finance-assurance-et-juridique',

    lodging: 'tourisme-et-hebergement',
    hotel: 'tourisme-et-hebergement',
    travel_agency: 'tourisme-et-hebergement',
    tourist_attraction: 'tourisme-et-hebergement',

    car_dealer: 'automobile-et-transport',
    car_repair: 'automobile-et-transport',
    car_rental: 'automobile-et-transport',
    gas_station: 'automobile-et-transport',

    plumber: 'construction-et-renovation',
    electrician: 'construction-et-renovation',
    painter: 'construction-et-renovation',
    roofing_contractor: 'construction-et-renovation',
    general_contractor: 'construction-et-renovation'
  };

  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }

  return null;
};

/**
 * Parse address components from Google Places
 */
const parseAddressComponents = (addressComponents) => {
  const result = {
    street_number: '',
    route: '',
    city: '',
    province: '',
    postal_code: '',
    country: ''
  };

  if (!addressComponents) return result;

  addressComponents.forEach((component) => {
    const types = component.types;

    if (types.includes('street_number')) {
      result.street_number = component.long_name;
    } else if (types.includes('route')) {
      result.route = component.long_name;
    } else if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.province = component.short_name;
    } else if (types.includes('postal_code')) {
      result.postal_code = component.long_name;
    } else if (types.includes('country')) {
      result.country = component.short_name;
    }
  });

  return result;
};

/**
 * Extract social media URLs from Google Business Profile website and description
 */
const extractSocialMediaUrls = (placeData) => {
  const socialUrls = {
    facebook_url: null,
    instagram_url: null,
    twitter_url: null,
    linkedin_url: null,
    threads_url: null,
    tiktok_url: null
  };

  // Search in website and editorial summary
  const searchText = [
    placeData.website,
    placeData.editorial_summary?.overview,
    ...(placeData.reviews?.map(r => r.text) || [])
  ].filter(Boolean).join(' ');

  // Extract URLs using regex patterns
  const patterns = {
    facebook_url: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[\w.-]+/i,
    instagram_url: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[\w.-]+/i,
    twitter_url: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[\w.-]+/i,
    linkedin_url: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/[\w.-]+/i,
    threads_url: /(?:https?:\/\/)?(?:www\.)?threads\.net\/@?[\w.-]+/i,
    tiktok_url: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+/i
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = searchText.match(pattern);
    if (match) {
      socialUrls[key] = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
    }
  });

  return socialUrls;
};

/**
 * Convert Google Places data to our business form format
 */
export const mapGooglePlaceToBusinessForm = (placeData) => {
  const addressComponents = parseAddressComponents(placeData.address_components);
  const address = `${addressComponents.street_number} ${addressComponents.route}`.trim();

  // Extract description - prioritize editorial summary from Google My Business
  let description = '';
  if (placeData.editorial_summary?.overview) {
    description = placeData.editorial_summary.overview;
  } else if (placeData.business_description) {
    // Some Google Business Profiles have a business_description field
    description = placeData.business_description;
  }
  // Note: Don't use reviews as fallback description - reviews will be displayed separately in a carousel

  // Determine suggested category
  const suggestedCategorySlug = mapGoogleTypeToCategory(placeData.types || []);

  // Process ALL reviews (Google Places API returns up to 5 by default, but we'll take all that are available)
  const processedReviews = placeData.reviews?.map(review => ({
    author_name: review.author_name,
    rating: review.rating,
    text: review.text,
    time: review.time,
    relative_time_description: review.relative_time_description,
    profile_photo_url: review.profile_photo_url
  })) || [];

  // Extract social media URLs
  const socialMediaUrls = extractSocialMediaUrls(placeData);

  return {
    name: placeData.name || '',
    description: description,
    phone: placeData.formatted_phone_number || placeData.international_phone_number || '',
    email: '', // Google doesn't provide email via Places API
    website: placeData.website || '',
    address: address,
    address_line2: '',
    city: addressComponents.city,
    region: '',
    postal_code: addressComponents.postal_code,
    latitude: placeData.geometry?.location?.lat || null,
    longitude: placeData.geometry?.location?.lng || null,

    // Additional data
    google_place_id: placeData.place_id,
    google_maps_url: placeData.url,
    rating_average: placeData.rating || 0,
    rating_count: placeData.user_ratings_total || 0,
    business_status: placeData.business_status,
    suggested_category_slug: suggestedCategorySlug,

    // Google reviews data
    google_rating: placeData.rating || null,
    google_reviews_count: placeData.user_ratings_total || 0,
    google_reviews: processedReviews,

    // Social media URLs
    ...socialMediaUrls,

    // Opening hours (would need additional processing)
    opening_hours: placeData.opening_hours?.weekday_text || [],

    // Photos with complete metadata (name, dimensions, attributions)
    photos: placeData.photos?.slice(0, 10).map(photo => ({
      name: photo.photo_reference, // Use photo_reference as name identifier
      reference: photo.photo_reference,
      widthPx: photo.width,
      heightPx: photo.height,
      authorAttributions: photo.html_attributions || []
    })) || [],

    // Logo from icon (if available and square-ish)
    icon: placeData.icon,
    icon_background_color: placeData.icon_background_color,

    // Restaurant/Commerce attributes (only from new Places API)
    // Note: These fields are not available in legacy Places API Details
    restaurantAttributes: placeData.dine_in !== undefined ? {
      dineIn: placeData.dine_in,
      takeout: placeData.takeout,
      delivery: placeData.delivery,
      servesBreakfast: placeData.serves_breakfast,
      servesLunch: placeData.serves_lunch,
      servesDinner: placeData.serves_dinner,
      servesBrunch: placeData.serves_brunch,
      servesVegetarianFood: placeData.serves_vegetarian_food,
      servesBeer: placeData.serves_beer,
      servesWine: placeData.serves_wine,
      outdoorSeating: placeData.outdoor_seating,
      liveMusic: placeData.live_music,
      reservable: placeData.reservable,
      goodForChildren: placeData.good_for_children,
      goodForGroups: placeData.good_for_groups
    } : null,

    // Parking options (only from new Places API)
    parkingOptions: placeData.parking || null,

    // Payment options (only from new Places API)
    paymentOptions: placeData.payment_options || null,

    // Accessibility options
    accessibilityOptions: {
      wheelchairAccessibleEntrance: placeData.wheelchair_accessible_entrance,
      ...(placeData.accessibility || {})
    },

    // EV Charging options (only from new Places API)
    evChargeOptions: placeData.ev_charge_options || null,

    // Fuel options (only from new Places API)
    fuelOptions: placeData.fuel_options || null
  };
};

/**
 * Search for multiple places by name and address (via backend proxy)
 * Returns array of matching businesses for user to choose from
 */
export const searchMultiplePlaces = async (businessName, address) => {
  const response = await fetch(`${PROXY_ENDPOINT}/search-multiple`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ businessName, address })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Business not found on Google Maps');
  }

  const data = await response.json();
  return data.results || []; // Array of place results
};

/**
 * Main function to import business from Google with confirmation support
 * @param {string} input - Can be a Place ID, URL, or business name + address
 * @param {string} address - Optional address if input is business name
 * @param {boolean} returnMultiple - If true, returns array of matches for search queries
 * @returns {Promise<Object|Array>} - Single business object or array of businesses
 */
export const importFromGoogle = async (input, address = '', returnMultiple = false) => {
  try {
    // Use the unified import endpoint on the backend
    const response = await fetch(`${PROXY_ENDPOINT}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input, address, returnMultiple })
    });

    if (!response.ok) {
      let errorMessage = 'Failed to import business from Google';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch (e) {
        // Si le JSON parsing échoue, utiliser le message par défaut
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // If multiple results requested and received
    if (returnMultiple && Array.isArray(result.results)) {
      return result.results.map(place => mapGooglePlaceToBusinessForm(place));
    }

    // Single result (direct Place ID or URL)
    return mapGooglePlaceToBusinessForm(result);
  } catch (error) {
    // Améliorer le message d'erreur pour les problèmes de connexion
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const isDev = import.meta.env.MODE === 'development';
      const errorMsg = isDev
        ? '❌ Impossible de se connecter au serveur backend.\n\n' +
          '💡 Solution: Démarrez le serveur avec la commande:\n' +
          '   npm run dev:server\n\n' +
          'Ou utilisez: npm run dev:all (pour tout démarrer)'
        : '❌ Impossible de se connecter au serveur API.\n\n' +
          '💡 Vérifiez que:\n' +
          '   • La clé API Google Places est configurée dans Vercel\n' +
          '   • Les variables d\'environnement sont correctement définies\n' +
          '   • Votre connexion Internet fonctionne';
      throw new Error(errorMsg);
    }
    throw error;
  }
};

/**
 * Get photo URL from photo reference (via backend proxy)
 */
export const getPhotoUrl = async (photoReference, maxWidth = 400) => {
  if (!photoReference) return null;

  try {
    const response = await fetch(`${PROXY_ENDPOINT}/photo/${photoReference}?maxwidth=${maxWidth}`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Failed to get photo URL:', error);
    return null;
  }
};

/**
 * Download photo from Google Places and convert to File object
 * @param {string} photoReference - Google Places photo reference
 * @param {number} maxWidth - Maximum width of photo
 * @param {string} fileName - Name for the downloaded file
 * @returns {Promise<File>} - File object ready for upload
 */
export const downloadGooglePhoto = async (photoReference, maxWidth = 400, fileName = 'google-photo.jpg') => {
  if (!photoReference) return null;

  try {
    // Get the photo URL
    const photoUrl = await getPhotoUrl(photoReference, maxWidth);
    if (!photoUrl) return null;

    // Fetch the image
    const response = await fetch(photoUrl);
    const blob = await response.blob();

    // Convert to File object
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  } catch (error) {
    console.error('Failed to download Google photo:', error);
    return null;
  }
};
