import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './FooterYelp.css';

const FooterYelp = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-yelp">
      <div className="container">
        {/* Main Footer Columns */}
        <div className="footer-yelp-columns">
          {/* About Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">À propos</h3>
            <ul className="footer-yelp-links">
              <li><Link to="/a-propos">À propos du Registre</Link></li>
              <li><a href="https://www.facebook.com/groups/registreduquebec" target="_blank" rel="nofollow noopener noreferrer">Groupe Facebook</a></li>
              <li><Link to="/mentions-legales">Mentions légales</Link></li>
              <li><Link to="/politique-confidentialite">Politique de confidentialité</Link></li>
              <li><a href="mailto:info@h1site.com">Nous joindre</a></li>
            </ul>
          </div>

          {/* Discover Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">Découvrir</h3>
            <ul className="footer-yelp-links">
              <li><Link to="/recherche">Rechercher des entreprises</Link></li>
              <li><Link to="/parcourir">Parcourir par ville</Link></li>
              <li><Link to="/parcourir/regions">Parcourir par région</Link></li>
              <li><Link to="/recherche?category=restaurants">Restaurants</Link></li>
              <li><Link to="/recherche?category=services">Services</Link></li>
            </ul>
          </div>

          {/* For Business Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">Pour les entreprises</h3>
            <ul className="footer-yelp-links">
              <li><Link to="/connexion">Connexion propriétaire</Link></li>
              <li><Link to="/inscription">Créer un compte</Link></li>
              <li><Link to="/entreprise/nouvelle">Ajouter votre entreprise</Link></li>
              <li><Link to="/mes-entreprises">Gérer mes entreprises</Link></li>
              <li><a href="https://h1site.com" target="_blank" rel="noopener noreferrer">Services H1Site</a></li>
            </ul>
          </div>

          {/* Languages Column */}
          <div className="footer-yelp-column">
            <h3 className="footer-yelp-title">Langues</h3>
            <ul className="footer-yelp-links">
              <li>
                <button
                  onClick={() => i18n.changeLanguage('fr')}
                  className={`lang-btn ${i18n.language === 'fr' ? 'active' : ''}`}
                >
                  Français {i18n.language === 'fr' && '✓'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => i18n.changeLanguage('en')}
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
              <strong>Joignez notre groupe d'entrepreneurs</strong>
              <span>Connectez avec des milliers d'entrepreneurs québécois</span>
            </div>
            <a
              href="https://www.facebook.com/groups/registreduquebec"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="footer-yelp-facebook-btn"
            >
              <span className="footer-yelp-facebook-logo">f</span>
              Rejoindre le groupe
            </a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-yelp-bottom">
          <p>
            Copyright © 2004-{currentYear} Registre du Québec Inc. et marques connexes sont des marques déposées du Registre du Québec.
          </p>
          <p className="footer-yelp-credits">
            Créé par <a href="https://h1site.com" target="_blank" rel="noopener noreferrer">H1Site.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterYelp;
