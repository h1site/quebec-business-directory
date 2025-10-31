/**
 * API Endpoint pour régénérer les sitemaps
 * URL: /api/regenerate-sitemaps
 *
 * Utilisation:
 * - Appel manuel via l'interface admin
 * - Webhook après ajout d'entreprise
 * - Cron job quotidien
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Clé secrète pour sécuriser l'endpoint (à mettre dans .env)
const REGENERATE_SECRET = process.env.SITEMAP_REGENERATE_SECRET || 'votre-cle-secrete-ici';

export default async function handler(req, res) {
  // Vérifier la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Sécurité: vérifier le token
  const { secret } = req.body;
  if (secret !== REGENERATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🗺️  Début de la régénération des sitemaps...');

    // Régénérer le sitemap français
    const { stdout: frOutput } = await execAsync('node scripts/generate-sitemap-all-businesses.js');
    console.log('✅ Sitemap FR généré');

    // Régénérer le sitemap anglais
    const { stdout: enOutput } = await execAsync('node scripts/generate-sitemap-en-split.js');
    console.log('✅ Sitemap EN généré');

    return res.status(200).json({
      success: true,
      message: 'Sitemaps régénérés avec succès',
      timestamp: new Date().toISOString(),
      details: {
        french: 'Sitemap français régénéré',
        english: 'Sitemap anglais régénéré'
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la régénération:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la régénération des sitemaps',
      details: error.message
    });
  }
}
