import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { translatePath, stripLanguagePrefix } from '../utils/languageRouting';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentLang = i18n.language || 'fr';
    const nextLang = currentLang === 'fr' ? 'en' : 'fr';

    console.log('🌐 Language toggle:', currentLang, '→', nextLang);

    // Translate current path to target language
    let newPath = translatePath(location.pathname, nextLang);

    console.log('📍 Navigating:', location.pathname, '→', newPath);

    // Save preference and navigate
    localStorage.setItem('language', nextLang);
    i18n.changeLanguage(nextLang);
    navigate(newPath);
  };

  const currentLang = i18n.language || 'fr';

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={handleToggle}
      style={{
        cursor: 'pointer',
        position: 'relative',
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      {currentLang === 'fr' ? 'English' : 'Français'}
    </button>
  );
};

export default LanguageToggle;
