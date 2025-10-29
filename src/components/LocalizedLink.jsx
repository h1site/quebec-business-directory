import { Link, useLocation } from 'react-router-dom';
import { localizedLink } from '../utils/languageRouting';

/**
 * Wrapper around React Router's Link component that automatically
 * localizes the path based on the current language from URL.
 *
 * Usage: <LocalizedLink to="/recherche">Search</LocalizedLink>
 * - FR: /recherche
 * - EN: /en/search
 */
const LocalizedLink = ({ to, ...props }) => {
  const location = useLocation();

  // Detect current language from URL path
  const isEnglish = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const currentLang = isEnglish ? 'en' : 'fr';

  const localizedTo = localizedLink(to, currentLang);

  return <Link to={localizedTo} {...props} />;
};

export default LocalizedLink;
