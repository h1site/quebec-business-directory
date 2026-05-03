/**
 * Google AdSense Ad Slot IDs Configuration
 *
 * Ad Client: ca-pub-8781698761921917
 *
 * À FAIRE pour optimiser le RPM:
 * Créer des slots distincts dans le dashboard AdSense pour chaque type de placement.
 * https://adsense.google.com/ → Ads → By ad unit → Create new
 *
 * Tant qu'un slot dédié n'existe pas, on retombe sur le slot universel `8544579045`.
 * Remplace les `FALLBACK_SLOT` ci-dessous par les vrais IDs au fur et à mesure.
 *
 * Types de slots à créer (par ordre d'impact RPM):
 *   1. "in-article" (Display ads → fluid → in-article)         → highest RPM in content
 *   2. "in-feed" (Display ads → fluid → in-feed) + layoutKey   → between cards/results
 *   3. "multiplex" (Multiplex ads, related-content style)      → end of pages
 *   4. "leaderboard" (Display ads → 728x90 ou responsive)      → top/bottom of pages
 *   5. "sidebar" (Display ads → 300x600 skyscraper)            → desktop sidebar
 */

const FALLBACK_SLOT = '8544579045'

export const AD_SLOTS = {
  inArticle: FALLBACK_SLOT,   // TODO: créer slot "In-article" dans AdSense
  inFeed: FALLBACK_SLOT,      // TODO: créer slot "In-feed" + récupérer layoutKey
  multiplex: FALLBACK_SLOT,   // TODO: créer slot "Multiplex" dans AdSense
  leaderboard: FALLBACK_SLOT, // TODO: créer slot Display responsive horizontal
  sidebar: FALLBACK_SLOT,     // TODO: créer slot Display 300x600
} as const

/**
 * Layout keys pour les ads in-feed.
 * Récupère la valeur dans AdSense au moment de créer le slot in-feed.
 */
export const AD_LAYOUT_KEYS = {
  inFeed: '-fb+5w+4e-db+86', // TODO: remplacer par le vrai layoutKey du slot in-feed
} as const
