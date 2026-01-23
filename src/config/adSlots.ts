/**
 * Google AdSense Ad Slot IDs Configuration
 *
 * Create these slots in your AdSense dashboard:
 * https://adsense.google.com/
 *
 * Ad Client: ca-pub-8781698761921917
 */

export const AD_SLOTS = {
  // Homepage
  homepage: {
    hero: '1234567890',        // Leaderboard below search
    inFeed1: '1234567891',     // Between categories
    inFeed2: '1234567892',     // Before footer
  },

  // Business Pages
  business: {
    sidebar1: '2234567890',    // Sidebar rectangle 300x250
    sidebar2: '2234567891',    // Sidebar skyscraper 300x600 sticky
    inContent: '2234567892',   // In-article between sections
    beforeRelated: '2234567893', // Leaderboard before related businesses
  },

  // Search Pages
  search: {
    header: '3234567890',      // Leaderboard below search bar
    inFeed: '3234567891',      // In-feed between results
    sidebar: '3234567892',     // Sidebar on desktop
  },

  // Category Pages
  category: {
    header: '4234567890',      // Below category title
    inFeed: '4234567891',      // Between businesses
    sidebar: '4234567892',     // Sidebar
  },

  // City Pages
  city: {
    header: '5234567890',      // Below city name
    inFeed: '5234567891',      // Between categories
    sidebar: '5234567892',     // Sidebar
  },

  // Blog Pages
  blog: {
    inArticle1: '6234567890',  // After introduction
    inArticle2: '6234567891',  // Middle of article
    endArticle: '6234567892',  // End of article
    sidebar: '6234567893',     // Sidebar skyscraper
  },
} as const

/**
 * Ad layout keys for in-feed ads
 * Get these from AdSense when creating in-feed ad units
 */
export const AD_LAYOUT_KEYS = {
  inFeed: '-fb+5w+4e-db+86',  // Default in-feed layout
} as const

/**
 * Helper to check if we're in development mode
 * Show placeholder ads instead of real ones
 */
export const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Get ad slot with fallback for development
 */
export function getAdSlot(slot: string): string {
  return isDevelopment ? '0000000000' : slot
}
