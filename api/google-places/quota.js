// Vercel serverless function for /api/google-places/quota
// Returns current import quota information
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

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

  // Check Supabase configuration
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      error: 'Supabase not configured',
      message: 'Please add VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY to environment variables'
    });
  }

  try {
    // Create Supabase client with service role (for RLS bypass)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get quota limit from query param (default 90)
    const limit = parseInt(req.query.limit) || 90;

    // Call Supabase function to get quota info
    const { data, error } = await supabase.rpc('get_import_quota_info', {
      limit_count: limit
    });

    if (error) {
      console.error('Supabase RPC Error:', error);
      return res.status(500).json({
        error: 'Failed to get quota information',
        message: error.message
      });
    }

    // Return quota information
    return res.status(200).json(data);
  } catch (error) {
    console.error('Quota Check Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
