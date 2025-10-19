// Vercel serverless function for /api/google-places/photo/:photoReference
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

export default async function handler(req, res) {
  // Enable CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return res.status(500).json({
      error: 'Google Places API key not configured'
    });
  }

  try {
    const { photoReference } = req.query;
    const maxwidth = req.query.maxwidth || 400;

    if (!photoReference) {
      return res.status(400).json({ error: 'Photo reference is required' });
    }

    // Build the Google Places Photo URL
    // Note: This URL will redirect to the actual image, but we return it as a JSON response
    const photoUrl = `${GOOGLE_PLACES_API_URL}/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

    // Return the URL as JSON (the frontend will use this URL to display the image)
    return res.json({ url: photoUrl });
  } catch (error) {
    console.error('Photo URL Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
