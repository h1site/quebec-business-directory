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
 *   2. "anchor" (Display ads → responsive horizontal, ~50-100px)→ sticky bottom mobile
 *   3. "in-feed" (Display ads → fluid → in-feed) + layoutKey   → between cards/results
 *   4. "multiplex" (Multiplex ads, related-content style)      → end of pages
 *   5. "leaderboard" (Display ads → 728x90 ou responsive)      → top/bottom of pages
 *   6. "sidebar" (Display ads → 300x600 skyscraper)            → desktop sidebar
 */

const FALLBACK_SLOT = '8544579045'

export const AD_SLOTS = {
  inArticle: '5312430216',    // In-article fluid
  inFeed: '8550784332',       // In-feed refusé par AdSense → fallback sur display responsive auto
  multiplex: '4591358027',    // Multiplex / Related content (autorelaxed)
  leaderboard: '8550784332',  // Display responsive auto
  sidebar: '8550784332',      // Display responsive auto
  anchor: '8550784332',       // Display responsive auto
} as const

