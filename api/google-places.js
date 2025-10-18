// Use native fetch (available in Node.js 18+)
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

// Helper to check API key
const checkApiKey = () => {
  if (!GOOGLE_PLACES_API_KEY) {
    return {
      error: 'Google Places API key not configured on server',
      message: 'Please add GOOGLE_PLACES_API_KEY to your environment variables'
    };
  }
  return null;
};

// Helper to parse request body
const parseBody = async (req) => {
  if (req.body) return req.body;

  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check API key
  const apiKeyError = checkApiKey();
  if (apiKeyError) {
    return res.status(500).json(apiKeyError);
  }

  const { query } = req;
  const path = query.path ? query.path.join('/') : '';

  try {
    // Route: /api/google-places/search
    if (req.method === 'POST' && path === 'search') {
      const body = await parseBody(req);
      const { businessName, address } = body;

      if (!businessName) {
        return res.status(400).json({ error: 'Business name is required' });
      }

      const searchQuery = `${businessName} ${address || ''}`.trim();
      const url = `${GOOGLE_PLACES_API_URL}/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.candidates || data.candidates.length === 0) {
        return res.status(404).json({
          error: 'Business not found',
          message: 'No business found matching your search criteria',
          googleStatus: data.status
        });
      }

      return res.json({
        placeId: data.candidates[0].place_id,
        name: data.candidates[0].name
      });
    }

    // Route: /api/google-places/details/:placeId
    if (req.method === 'GET' && path.startsWith('details/')) {
      const placeId = path.replace('details/', '');

      if (!placeId) {
        return res.status(400).json({ error: 'Place ID is required' });
      }

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
        'utc_offset_minutes',
        'photos',
        'rating',
        'user_ratings_total',
        'reviews',
        'editorial_summary'
      ].join(',');

      const url = `${GOOGLE_PLACES_API_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result) {
        return res.status(404).json({
          error: 'Place not found',
          message: 'Could not retrieve place details',
          googleStatus: data.status
        });
      }

      return res.json(data.result);
    }

    // Route: /api/google-places/photo/:photoReference
    if (req.method === 'GET' && path.startsWith('photo/')) {
      const photoReference = path.replace('photo/', '');
      const maxwidth = query.maxwidth || 400;

      if (!photoReference) {
        return res.status(400).json({ error: 'Photo reference is required' });
      }

      const url = `${GOOGLE_PLACES_API_URL}/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({
          error: 'Failed to fetch photo',
          message: 'Could not retrieve photo from Google Places'
        });
      }

      const imageBuffer = await response.buffer();
      const contentType = response.headers.get('content-type');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(imageBuffer);
    }

    // Route: /api/google-places/import
    if (req.method === 'POST' && path === 'import') {
      const body = await parseBody(req);
      const { placeId } = body;

      if (!placeId) {
        return res.status(400).json({ error: 'Place ID is required' });
      }

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
        'photos'
      ].join(',');

      const url = `${GOOGLE_PLACES_API_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result) {
        return res.status(404).json({
          error: 'Place not found',
          googleStatus: data.status
        });
      }

      const place = data.result;
      const addressComponents = place.address_components || [];

      // Extract address components
      const getComponent = (types) => {
        const component = addressComponents.find(c =>
          types.some(type => c.types.includes(type))
        );
        return component?.long_name || '';
      };

      const streetNumber = getComponent(['street_number']);
      const route = getComponent(['route']);
      const city = getComponent(['locality', 'sublocality']);
      const postalCode = getComponent(['postal_code']);

      const importedData = {
        name: place.name || '',
        description: place.editorial_summary?.overview || '',
        phone: place.formatted_phone_number || place.international_phone_number || '',
        website: place.website || '',
        address: [streetNumber, route].filter(Boolean).join(' '),
        city: city,
        postal_code: postalCode,
        google_rating: place.rating || null,
        google_reviews_count: place.user_ratings_total || 0,
        google_reviews: place.reviews || [],
        opening_hours: place.opening_hours?.periods || [],
        photos: place.photos || []
      };

      return res.json(importedData);
    }

    // Health check
    if (req.method === 'GET' && (path === '' || path === 'health')) {
      return res.json({ status: 'ok', message: 'Google Places API proxy is running' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Google Places API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
