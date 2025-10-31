/**
 * Utilitaire pour déclencher la régénération des sitemaps
 * À utiliser après ajout/modification/suppression d'entreprise
 */

const SITEMAP_API_URL = import.meta.env.VITE_SITEMAP_REGENERATE_URL || '/api/regenerate-sitemaps';
const SITEMAP_SECRET = import.meta.env.VITE_SITEMAP_REGENERATE_SECRET;

/**
 * Déclenche la régénération des sitemaps
 * @param {string} reason - Raison du déclenchement (pour les logs)
 * @returns {Promise<boolean>} - Succès ou échec
 */
export async function triggerSitemapRegeneration(reason = 'manual') {
  try {
    console.log(`🗺️  Déclenchement régénération sitemap: ${reason}`);

    const response = await fetch(SITEMAP_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: SITEMAP_SECRET,
        reason: reason,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sitemap régénération déclenchée:', data);
      return true;
    } else {
      console.error('❌ Erreur régénération sitemap:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du déclenchement:', error);
    return false;
  }
}

/**
 * Déclenche la régénération avec un délai (debouncing)
 * Utile pour éviter de régénérer trop souvent
 */
let regenerationTimeout = null;
export function triggerSitemapRegenerationDelayed(reason = 'manual', delayMs = 60000) {
  // Annuler le précédent timer si existe
  if (regenerationTimeout) {
    clearTimeout(regenerationTimeout);
  }

  // Programmer la régénération dans X minutes
  regenerationTimeout = setTimeout(() => {
    triggerSitemapRegeneration(reason);
    regenerationTimeout = null;
  }, delayMs);

  console.log(`⏱️  Régénération sitemap programmée dans ${delayMs/1000}s`);
}

/**
 * Hook à utiliser dans les composants React
 */
export function useSitemapRegeneration() {
  const triggerNow = (reason) => triggerSitemapRegeneration(reason);
  const triggerDelayed = (reason, delay) => triggerSitemapRegenerationDelayed(reason, delay);

  return { triggerNow, triggerDelayed };
}
