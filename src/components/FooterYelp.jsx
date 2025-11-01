import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import LocalizedLink from './LocalizedLink.jsx';
import { translatePath } from '../utils/languageRouting';
import './FooterYelp.css';

const FooterYelp = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const handleLanguageChange = (targetLang) => {
    // Translate current path to target language
    const newPath = translatePath(location.pathname, targetLang);

    // Save preference and navigate
    localStorage.setItem('language', targetLang);
    i18n.changeLanguage(targetLang);
    navigate(newPath);
  };

  return (
    <footer className="footer-yelp">
      <div className="container">
        {/* Main Footer Columns */}
        <div className="footer-yelp-columns">
          {/* Logo & Disclaimer Column */}
          <div className="footer-yelp-column footer-yelp-column-wide">
            <div className="footer-logo-with-title">
              <div className="footer-logo">
                <img src="/images/logos/logoblue.webp" alt="Registre du Québec" width="100" height="100" />
              </div>
              <div className="footer-disclaimer-inline">
                <p>{t('footer.disclaimerLine1')}</p>
                <p>{t('footer.disclaimerLine2')}</p>
                <p>{t('footer.disclaimerLine3')}</p>
              </div>
            </div>
          </div>

          {/* About Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">{t('footer.about')}</h3>
            <ul className="footer-yelp-links">
              <li><LocalizedLink to="/a-propos">{t('footer.aboutRegistry')}</LocalizedLink></li>
              <li><LocalizedLink to="/blogue">{t('footer.blog')}</LocalizedLink></li>
              <li><a href="https://www.facebook.com/groups/registreduquebec" target="_blank" rel="nofollow noopener noreferrer">{t('footer.facebookGroup')}</a></li>
              <li><LocalizedLink to="/mentions-legales">{t('footer.legalNotice')}</LocalizedLink></li>
              <li><LocalizedLink to="/politique-confidentialite">{t('footer.privacyPolicy')}</LocalizedLink></li>
              <li><a href="mailto:info@h1site.com">{t('footer.contactUs')}</a></li>
            </ul>
          </div>

          {/* Discover Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">{t('footer.discover')}</h3>
            <ul className="footer-yelp-links">
              <li><LocalizedLink to="/recherche">{t('footer.searchBusinesses')}</LocalizedLink></li>
              <li><LocalizedLink to="/parcourir">{t('footer.browseByCity')}</LocalizedLink></li>
              <li><LocalizedLink to="/parcourir/regions">{t('footer.browseByRegion')}</LocalizedLink></li>
              <li><LocalizedLink to="/recherche?category=restaurants">{t('footer.restaurants')}</LocalizedLink></li>
              <li><LocalizedLink to="/recherche?category=services">{t('footer.services')}</LocalizedLink></li>
            </ul>
          </div>

          {/* For Business Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">{t('footer.forBusinesses')}</h3>
            <ul className="footer-yelp-links">
              <li><LocalizedLink to="/connexion">{t('footer.ownerLogin')}</LocalizedLink></li>
              <li><LocalizedLink to="/inscription">{t('footer.createAccount')}</LocalizedLink></li>
              <li><LocalizedLink to="/entreprise/nouvelle">{t('footer.addBusiness')}</LocalizedLink></li>
              <li><LocalizedLink to="/mes-entreprises">{t('footer.manageBusinesses')}</LocalizedLink></li>
              <li><a href="https://h1site.com" target="_blank" rel="noopener noreferrer">{t('footer.h1siteServices')}</a></li>
            </ul>
          </div>

          {/* Languages Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">{t('footer.languages')}</h3>
            <ul className="footer-yelp-links">
              <li>
                <button
                  onClick={() => handleLanguageChange('fr')}
                  className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                >
                  Français {i18n.language === 'fr' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
                >
                  English {i18n.language === 'en' && '✓'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Facebook Group Banner */}
        <div className="footer-yelp-facebook">
          <div className="footer-yelp-facebook-content">
            <div className="footer-yelp-facebook-text">
              <strong>{t('footer.facebookBannerTitle')}</strong>
              <span>{t('footer.facebookBannerSubtitle')}</span>
            </div>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="footer-yelp-facebook-btn"
            >
              <span className="footer-yelp-facebook-logo">f</span>
              {t('footer.facebookJoinButton')}
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-yelp-bottom">
          <p>
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="footer-yelp-credits">
            {t('footer.createdByLink')} <a href="https://h1site.com" target="_blank" rel="noopener noreferrer">H1Site.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterYelp;
