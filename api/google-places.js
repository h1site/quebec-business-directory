// Vercel serverless function
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
  // Enable CORS - use the origin from the request to handle www/non-www variations
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
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
      const { input, address } = body;

      if (!input) {
        return res.status(400).json({
          error: 'Input is required (URL, Place ID, or business name)'
        });
      }

      let placeId = input;

      // If input looks like a URL or is not a Place ID, try to extract or search
      if (input.includes('google.com') || input.includes('goo.gl') || !/^[A-Za-z0-9_-]{20,}$/.test(input)) {
        // Try to extract Place ID from URL (basic extraction)
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

      // Get place details
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

      // Return the raw Google Place data - the frontend will map it
      return res.json(detailsData.result);
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
