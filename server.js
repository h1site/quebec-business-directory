import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import googlePlacesRoutes from './google-places-routes.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/google-places', googlePlacesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`📍 Google Places API proxy available at http://localhost:${PORT}/api/google-places\n`);

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️  WARNING: GOOGLE_PLACES_API_KEY not found in environment variables');
    console.warn('   Add it to your .env file to enable Google Business import\n');
  }
});
