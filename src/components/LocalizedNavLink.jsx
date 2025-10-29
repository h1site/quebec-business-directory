import { NavLink, useLocation } from 'react-router-dom';
import { localizedLink } from '../utils/languageRouting';

/**
 * Wrapper around React Router's NavLink component that automatically
 * localizes the path based on the current language from URL.
 *
 * Usage: <LocalizedNavLink to="/recherche">Search</LocalizedNavLink>
 * - FR: /recherche
 * - EN: /en/search
 */
const LocalizedNavLink = ({ to, ...props }) => {
  const location = useLocation();

  // Detect current language from URL path
  const isEnglish = location.pathname === '/en' || location.pathname.startsWith('/en/');
  const currentLang = isEnglish ? 'en' : 'fr';

  const localizedTo = localizedLink(to, currentLang);

  return <NavLink to={localizedTo} {...props} />;
};

export default LocalizedNavLink;
