/**
 * API endpoint for searching Google Places
 * Used by admin to find the correct Google My Business listing
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleApiKey) {
    console.error('Missing GOOGLE_PLACES_API_KEY or VITE_GOOGLE_MAPS_API_KEY');
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Search for places using Google Places API (Find Place)
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,rating,user_ratings_total,business_status&key=${googleApiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status === 'OK' && searchData.candidates && searchData.candidates.length > 0) {
      return res.status(200).json({
        success: true,
        results: searchData.candidates
      });
    } else if (searchData.status === 'ZERO_RESULTS') {
      return res.status(200).json({
        success: true,
        results: []
      });
    } else {
      console.error('Google Places API error:', searchData);
      return res.status(500).json({
        error: `Google Places API error: ${searchData.status}`,
        details: searchData.error_message || 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Error searching Google Places:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
