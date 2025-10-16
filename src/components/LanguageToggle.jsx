import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n, t } = useTranslation();

  const handleToggle = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
    document.documentElement.lang = nextLang;
  };

  return (
    <button type="button" className="language-toggle" onClick={handleToggle}>
      {t('footer.languageToggle')}
    </button>
  );
};

export default LanguageToggle;
