// Vercel serverless function for /api/google-places/import
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key
  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({
      error: 'Google Places API key not configured',
      message: 'Please add GOOGLE_PLACES_API_KEY to Vercel environment variables'
    });
  }

  try {
    const { input, address } = req.body;

    if (!input) {
      return res.status(400).json({
        error: 'Input is required (URL, Place ID, or business name)'
      });
    }

    let placeId = input;

    // If input looks like a URL or is not a Place ID, try to extract or search
    if (input.includes('google.com') || input.includes('goo.gl') || !/^[A-Za-z0-9_-]{20,}$/.test(input)) {
      // Try to extract Place ID from URL
      const placeIdMatch = input.match(/!1s([A-Za-z0-9_-]+)/);
      if (placeIdMatch) {
        placeId = placeIdMatch[1];
      } else {
        // Search by name
        const searchUrl = `${GOOGLE_PLACES_API_URL}/findplacefromtext/json?input=${encodeURIComponent(input + ' ' + (address || ''))}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (searchData.status !== 'OK' || !searchData.candidates || searchData.candidates.length === 0) {
          return res.status(404).json({
            error: 'Business not found',
            message: 'Could not find business on Google Maps'
          });
        }

        placeId = searchData.candidates[0].place_id;
      }
    }

    // Get place details with extended fields including attributes
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'address_components',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'opening_hours',
      'business_status',
      'types',
      'geometry',
      'url',
      'rating',
      'user_ratings_total',
      'reviews',
      'editorial_summary',
      'photos',
      // Restaurant/Commerce attributes
      'dine_in',
      'takeout',
      'delivery',
      'serves_breakfast',
      'serves_lunch',
      'serves_dinner',
      'serves_brunch',
      'serves_vegetarian_food',
      'serves_beer',
      'serves_wine',
      'outdoor_seating',
      'live_music',
      'reservable',
      'good_for_children',
      'good_for_groups',
      'wheelchair_accessible_entrance',
      // Parking
      'parking',
      // Payment
      'payment_options',
      // Accessibility
      'accessibility',
      // EV/Fuel
      'ev_charge_options',
      'fuel_options'
    ].join(',');

    const detailsUrl = `${GOOGLE_PLACES_API_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    if (detailsData.status !== 'OK' || !detailsData.result) {
      return res.status(404).json({
        error: 'Place not found',
        message: `Google API error: ${detailsData.status}`,
        googleStatus: detailsData.status
      });
    }

    // Return the raw Google Place data
    return res.json(detailsData.result);
  } catch (error) {
    console.error('Google Places Import Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
