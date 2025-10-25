import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../supabaseClient.js';

const Header = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserAvatar();
    }
  }, [user]);

  const loadUserAvatar = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single();

    if (data && data.avatar_url) {
      setAvatarUrl(data.avatar_url);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={isScrolled ? 'scrolled' : ''}>
      <div className="header-container">
        <nav>
          <div className="nav-top">
            {/* Language switcher pour mobile (colonne gauche) */}
            <div className="nav-mobile-language">
              <LanguageToggle />
            </div>

            {/* Centre: Logo + texte pour mobile */}
            <div className="nav-mobile-center">
              <Link to="/" className="nav-brand-logo-link-mobile">
                <img src="/images/logos/logo.webp" alt="Logo" className="nav-brand-logo" />
              </Link>
              <div className="nav-brand-text-mobile">
                <Link to="/">Registre d'entreprise du Québec</Link>
              </div>
            </div>

            {/* Brand avec logo et texte pour desktop */}
            <Link to="/" className="nav-brand">
              <img src="/images/logos/logo.webp" alt="Logo" className="nav-brand-logo" />
              <span>Registre d'entreprise du Québec</span>
            </Link>

            {/* Menu hamburger pour mobile (colonne droite) */}
            <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? (
                <img src="/images/icons/close.svg" alt="Close" className="close-icon" />
              ) : (
                <img src="/images/icons/menu.svg" alt="Menu" className="menu-icon" />
              )}
            </button>

            {/* Navigation links desktop */}
            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <NavLink to="/" onClick={closeMenu}>{t('navigation.home')}</NavLink>
              <NavLink to="/recherche" onClick={closeMenu}>{t('navigation.search')}</NavLink>
              {user ? (
                <>
                  <NavLink to="/entreprise/nouvelle" onClick={closeMenu}>{t('navigation.addListing')}</NavLink>
                  <NavLink to="/mes-entreprises" onClick={closeMenu}>Mes entreprises</NavLink>
                  <NavLink to="/profil" onClick={closeMenu} className="profile-avatar-link">
                    <img
                      src={avatarUrl || '/default-avatar.svg'}
                      alt="Profil"
                      className="header-avatar"
                    />
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/connexion" onClick={closeMenu}>{t('navigation.login')}</NavLink>
                  <NavLink to="/inscription" onClick={closeMenu}>{t('navigation.register')}</NavLink>
                </>
              )}
              <a
                href="https://www.paypal.com/donate/?hosted_button_id=GUPL4K5WR3ZG4"
                target="_blank"
                rel="noopener noreferrer"
                className="donate-button"
                onClick={closeMenu}
              >
                {t('navigation.donate')}
              </a>
              <LanguageToggle />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
