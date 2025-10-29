import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Wrapper component that detects language from URL and synchronizes i18n
 * - /en/* routes → English
 * - /* routes → French (default)
 */
const LanguageRouteWrapper = ({ children }) => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Detect language from URL
    const isEnglish = location.pathname === '/en' || location.pathname.startsWith('/en/');
    const detectedLang = isEnglish ? 'en' : 'fr';

    // Only change if different to avoid unnecessary re-renders
    if (i18n.language !== detectedLang) {
      console.log(`🌐 Language detected from URL: ${detectedLang}`);
      i18n.changeLanguage(detectedLang);
      localStorage.setItem('language', detectedLang);
      document.documentElement.lang = detectedLang;
    }
  }, [location.pathname, i18n]);

  return children;
};

export default LanguageRouteWrapper;
