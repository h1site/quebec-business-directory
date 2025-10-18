import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

// Middleware to check if API key is configured
const checkApiKey = (req, res, next) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({
      error: 'Google Places API key not configured on server',
      message: 'Please add GOOGLE_PLACES_API_KEY to your environment variables'
    });
  }
  next();
};

/**
 * @route   POST /api/google-places/search
 * @desc    Search for a place by business name and address
 * @access  Public (consider adding auth in production)
 */
router.post('/search', checkApiKey, async (req, res) => {
  try {
    const { businessName, address } = req.body;

    if (!businessName) {
      return res.status(400).json({
        error: 'Business name is required'
      });
    }

    const query = `${businessName} ${address || ''}`.trim();
    const url = `${GOOGLE_PLACES_API_URL}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.candidates || data.candidates.length === 0) {
      return res.status(404).json({
        error: 'Business not found',
        message: 'No business found matching your search criteria',
        googleStatus: data.status
      });
    }

    res.json({
      placeId: data.candidates[0].place_id,
      name: data.candidates[0].name
    });
  } catch (error) {
    console.error('Google Places Search Error:', error);
    res.status(500).json({
      error: 'Failed to search place',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/google-places/details/:placeId
 * @desc    Get detailed information about a place
 * @access  Public (consider adding auth in production)
 */
router.get('/details/:placeId', checkApiKey, async (req, res) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({
        error: 'Place ID is required'
      });
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

    if (data.status !== 'OK') {
      return res.status(400).json({
        error: 'Failed to fetch place details',
        message: `Google API error: ${data.status}`,
        googleStatus: data.status
      });
    }

    res.json(data.result);
  } catch (error) {
    console.error('Google Places Details Error:', error);
    res.status(500).json({
      error: 'Failed to fetch place details',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/google-places/photo/:photoReference
 * @desc    Get photo URL from photo reference
 * @access  Public
 */
router.get('/photo/:photoReference', checkApiKey, (req, res) => {
  try {
    const { photoReference } = req.params;
    const maxWidth = req.query.maxwidth || 400;

    if (!photoReference) {
      return res.status(400).json({
        error: 'Photo reference is required'
      });
    }

    const photoUrl = `${GOOGLE_PLACES_API_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

    res.json({ url: photoUrl });
  } catch (error) {
    console.error('Google Places Photo Error:', error);
    res.status(500).json({
      error: 'Failed to get photo URL',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/google-places/import
 * @desc    Import business data from Google (combines search and details)
 * @access  Public (consider adding auth in production)
 */
router.post('/import', checkApiKey, async (req, res) => {
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

    if (detailsData.status !== 'OK') {
      return res.status(400).json({
        error: 'Failed to fetch place details',
        message: `Google API error: ${detailsData.status}`
      });
    }

    res.json(detailsData.result);
  } catch (error) {
    console.error('Google Places Import Error:', error);
    res.status(500).json({
      error: 'Failed to import business data',
      message: error.message
    });
  }
});

export default router;
