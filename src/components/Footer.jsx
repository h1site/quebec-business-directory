import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import communityAnimation from '../assets/community.json';
import './Footer.css';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        {/* Facebook Group Banner */}
        <div className="facebook-banner">
          <div className="facebook-banner-content">
            <div className="facebook-banner-text">
              <Lottie
                animationData={communityAnimation}
                loop={true}
                className="facebook-icon"
              />
              <div className="facebook-banner-message">
                <strong>Joignez notre groupe d'entrepreneurs sur Facebook</strong>
                <span className="facebook-subtitle">Connectez avec des milliers d'entrepreneurs québécois</span>
              </div>
            </div>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="btn-join-facebook"
            >
              <span className="facebook-logo">f</span>
              Rejoindre le groupe
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="footer-copyright">
          <p style={{ margin: 0 }}>
            {t('footer.copyrightYear', { year: currentYear })}
            <br className="footer-mobile-break" />
            {t('footer.copyrightRights')}
          </p>
          <p style={{ margin: 0 }}>
            <Link
              to={i18n.language === 'fr' ? '/mentions-legales' : '/legal-notice'}
              className="footer-link"
            >
              {i18n.language === 'fr' ? 'Mentions légales' : 'Legal Notice'}
            </Link>
            {' · '}
            {t('footer.createdBy')}{' '}
            <a
              href="https://h1site.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              H1Site.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
