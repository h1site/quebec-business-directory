// Entry point that loads environment variables before starting the server
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables FIRST
dotenv.config({ path: join(__dirname, '.env') });

// Verify API key is loaded
if (process.env.GOOGLE_PLACES_API_KEY) {
  console.log('✅ Environment variables loaded successfully');
} else {
  console.warn('⚠️  WARNING: GOOGLE_PLACES_API_KEY not found in .env file');
}

// Now import and start the server
import './server.js';
