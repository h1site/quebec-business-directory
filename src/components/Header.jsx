import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Header = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header>
      <div className="container">
        <nav>
          <Link to="/" className="nav-brand">
            <span>Québec</span>&nbsp;<span>Entreprises</span>
          </Link>
          <div className="nav-links">
            <NavLink to="/">{t('navigation.home')}</NavLink>
            <NavLink to="/recherche">{t('navigation.search')}</NavLink>
            <NavLink to="/entreprise/nouvelle">{t('navigation.addListing')}</NavLink>
            {user ? (
              <span>{user.email}</span>
            ) : (
              <>
                <NavLink to="/connexion">{t('navigation.login')}</NavLink>
                <NavLink to="/inscription">{t('navigation.register')}</NavLink>
              </>
            )}
            <LanguageToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
