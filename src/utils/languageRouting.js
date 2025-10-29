/**
 * Language-based routing utilities for bilingual URLs
 * Supports French (default, no prefix) and English (/en/ prefix)
 */

// Supported languages
export const LANGUAGES = {
  FR: 'fr',
  EN: 'en'
};

export const DEFAULT_LANGUAGE = LANGUAGES.FR;

// Path segment translations
const PATH_SEGMENTS = {
  [LANGUAGES.FR]: {
    categorie: 'categorie',
    ville: 'ville',
    region: 'region',
    entreprise: 'entreprise',
    recherche: 'recherche',
    connexion: 'connexion',
    inscription: 'inscription',
    'a-propos': 'a-propos',
    'mentions-legales': 'mentions-legales',
    'politique-confidentialite': 'politique-confidentialite',
    blogue: 'blogue',
    'mes-entreprises': 'mes-entreprises',
    profil: 'profil',
    admin: 'admin',
    nouvelle: 'nouvelle',
    parcourir: 'parcourir'
  },
  [LANGUAGES.EN]: {
    categorie: 'category',
    ville: 'city',
    region: 'region',
    entreprise: 'business',
    recherche: 'search',
    connexion: 'login',
    inscription: 'register',
    'a-propos': 'about',
    'mentions-legales': 'legal-notice',
    'politique-confidentialite': 'privacy-policy',
    blogue: 'blog',
    'mes-entreprises': 'my-businesses',
    profil: 'profile',
    admin: 'admin',
    nouvelle: 'new',
    parcourir: 'browse'
  }
};

/**
 * Get current language from pathname
 * @param {string} pathname - Current URL pathname
 * @returns {string} Language code ('fr' or 'en')
 */
export function getCurrentLanguage(pathname) {
  if (!pathname) return DEFAULT_LANGUAGE;

  // Check if path starts with /en or /en/
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return LANGUAGES.EN;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Strip language prefix from pathname
 * @param {string} pathname - URL pathname
 * @returns {string} Pathname without language prefix
 */
export function stripLanguagePrefix(pathname) {
  if (!pathname) return '/';

  // Remove /en prefix
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) {
    return pathname.substring(3) || '/';
  }

  return pathname;
}

/**
 * Translate a path segment to target language
 * @param {string} segment - Path segment to translate
 * @param {string} targetLang - Target language ('fr' or 'en')
 * @param {string} currentLang - Current language (optional, for reverse lookup)
 * @returns {string} Translated segment or original if not found
 */
export function translatePathSegment(segment, targetLang, currentLang = DEFAULT_LANGUAGE) {
  if (!segment) return segment;

  // If already in target language, return as-is
  const targetSegments = PATH_SEGMENTS[targetLang];
  if (Object.values(targetSegments).includes(segment)) {
    return segment;
  }

  // Find the key in current language
  const currentSegments = PATH_SEGMENTS[currentLang];
  const key = Object.keys(currentSegments).find(k => currentSegments[k] === segment);

  if (key && targetSegments[key]) {
    return targetSegments[key];
  }

  // If not found in mappings, return original (e.g., slugs like 'montreal', 'restaurants')
  return segment;
}

/**
 * Translate entire path to target language
 * @param {string} pathname - Full pathname
 * @param {string} targetLang - Target language
 * @returns {string} Translated pathname
 */
export function translatePath(pathname, targetLang) {
  // Handle root path
  if (!pathname || pathname === '/') {
    return targetLang === LANGUAGES.EN ? '/en' : '/';
  }

  const currentLang = getCurrentLanguage(pathname);

  // If already in target language, return as-is
  if (currentLang === targetLang && targetLang === DEFAULT_LANGUAGE) {
    return pathname;
  }

  // Strip current language prefix
  const cleanPath = stripLanguagePrefix(pathname);

  // Split path into segments
  const segments = cleanPath.split('/').filter(Boolean);

  // Translate each segment
  const translatedSegments = segments.map(segment =>
    translatePathSegment(segment, targetLang, currentLang)
  );

  // Rebuild path
  const translatedPath = '/' + translatedSegments.join('/');

  // Add language prefix for non-default language
  if (targetLang === LANGUAGES.EN) {
    return '/en' + translatedPath;
  }

  return translatedPath;
}

/**
 * Get localized path with language prefix
 * @param {string} path - Path without language prefix
 * @param {string} lang - Language code
 * @returns {string} Path with language prefix if needed
 */
export function getLocalizedPath(path, lang = DEFAULT_LANGUAGE) {
  if (!path) return '/';

  // Remove any existing language prefix first
  const cleanPath = stripLanguagePrefix(path);

  // Translate path segments
  const translatedPath = translatePath(cleanPath, lang);

  return translatedPath;
}

/**
 * Switch language for current path
 * @param {string} currentPath - Current pathname
 * @param {string} newLang - New language to switch to
 * @returns {string} New pathname in target language
 */
export function switchLanguage(currentPath, newLang) {
  return translatePath(currentPath, newLang);
}

/**
 * Check if language is the default
 * @param {string} lang - Language code
 * @returns {boolean}
 */
export function isDefaultLanguage(lang) {
  return lang === DEFAULT_LANGUAGE;
}

/**
 * Detect language from browser
 * @returns {string} Detected language code
 */
export function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language || navigator.userLanguage;

  if (browserLang && browserLang.toLowerCase().startsWith('en')) {
    return LANGUAGES.EN;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get language from localStorage
 * @returns {string|null} Stored language or null
 */
export function getStoredLanguage() {
  if (typeof localStorage === 'undefined') return null;

  try {
    const stored = localStorage.getItem('language');
    if (stored === LANGUAGES.FR || stored === LANGUAGES.EN) {
      return stored;
    }
  } catch (e) {
    console.error('Error reading language from localStorage:', e);
  }

  return null;
}

/**
 * Store language preference
 * @param {string} lang - Language to store
 */
export function storeLanguagePreference(lang) {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem('language', lang);
  } catch (e) {
    console.error('Error storing language preference:', e);
  }
}

/**
 * Detect language with priority: URL > localStorage > Browser > Default
 * @param {string} pathname - Current URL pathname
 * @returns {string} Detected language
 */
export function detectLanguage(pathname) {
  // 1. Check URL (highest priority)
  const urlLang = getCurrentLanguage(pathname);
  if (urlLang !== DEFAULT_LANGUAGE) {
    return urlLang;
  }

  // 2. Check localStorage
  const storedLang = getStoredLanguage();
  if (storedLang) {
    return storedLang;
  }

  // 3. Check browser language
  const browserLang = detectBrowserLanguage();
  if (browserLang !== DEFAULT_LANGUAGE) {
    return browserLang;
  }

  // 4. Default to French
  return DEFAULT_LANGUAGE;
}

/**
 * Get hreflang URLs for a given path
 * @param {string} basePath - Path without language prefix
 * @param {string} baseUrl - Base URL (e.g., 'https://registreduquebec.com')
 * @returns {Object} hreflang URLs { fr, en, default }
 */
export function getHreflangUrls(basePath, baseUrl = 'https://registreduquebec.com') {
  const cleanPath = stripLanguagePrefix(basePath);

  return {
    fr: `${baseUrl}${cleanPath}`,
    en: `${baseUrl}/en${cleanPath}`,
    default: `${baseUrl}${cleanPath}` // x-default points to French
  };
}

/**
 * Create a localized link for use in Link components
 * Adds /en/ prefix for English, keeps root for French
 * @param {string} path - The path (e.g., '/recherche', '/categorie/restaurants', '/recherche?q=test')
 * @param {string} lang - Current language ('fr' or 'en')
 * @returns {string} Localized path
 *
 * @example
 * localizedLink('/recherche', 'fr') // returns '/recherche'
 * localizedLink('/recherche', 'en') // returns '/en/search'
 * localizedLink('/categorie/restaurants', 'en') // returns '/en/category/restaurants'
 * localizedLink('/recherche?category=test', 'en') // returns '/en/search?category=test'
 */
export function localizedLink(path, lang = DEFAULT_LANGUAGE) {
  // Separate pathname and query string
  const [pathname, queryString] = path.split('?');

  // If already has language prefix, strip it first
  const cleanPath = stripLanguagePrefix(pathname);

  // For French, return clean path (no prefix)
  if (lang === LANGUAGES.FR) {
    const basePath = cleanPath || '/';
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  // For English, translate path segments and add /en/ prefix
  const translatedPath = translatePath(cleanPath, LANGUAGES.EN);

  // Re-attach query string if present
  return queryString ? `${translatedPath}?${queryString}` : translatedPath;
}
