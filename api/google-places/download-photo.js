// Vercel serverless function for /api/google-places/download-photo
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export default async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only GET allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check API key
  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({
      error: 'Google Places API key not configured'
    });
  }

  try {
    const { photoReference, maxwidth = 1200 } = req.query;

    if (!photoReference) {
      return res.status(400).json({
        error: 'photoReference is required'
      });
    }

    // Construct photo URL
    const photoUrl = `${GOOGLE_PLACES_API_URL}/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

    // Fetch the photo from Google
    const photoResponse = await fetch(photoUrl);

    if (!photoResponse.ok) {
      return res.status(photoResponse.status).json({
        error: 'Failed to fetch photo from Google'
      });
    }

    // Get the image as buffer
    const imageBuffer = await photoResponse.arrayBuffer();
    const contentType = photoResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.status(200).send(Buffer.from(imageBuffer));

  } catch (error) {
    console.error('Download Photo Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
