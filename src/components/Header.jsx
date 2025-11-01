import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from './LocalizedLink.jsx';
import LocalizedNavLink from './LocalizedNavLink.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../services/supabaseClient.js';

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
      .maybeSingle();

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
              <LocalizedLink to="/" className="nav-brand-logo-link-mobile">
                <img src="/images/logos/logo.webp" alt="Logo" className="nav-brand-logo" width="40" height="40" />
              </LocalizedLink>
              <div className="nav-brand-text-mobile">
                <LocalizedLink to="/">{t('navigation.siteTitle')}</LocalizedLink>
                <span className="header-beta-badge">BÊTA</span>
              </div>
            </div>

            {/* Brand avec logo et texte pour desktop */}
            <LocalizedLink to="/" className="nav-brand">
              <img src="/images/logos/logo.webp" alt="Logo" className="nav-brand-logo" width="40" height="40" />
              <span>{t('navigation.siteTitle')}</span>
              <span className="header-beta-badge">BÊTA</span>
            </LocalizedLink>

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
              <LocalizedNavLink to="/" onClick={closeMenu}>{t('navigation.home')}</LocalizedNavLink>
              <LocalizedNavLink to="/recherche" onClick={closeMenu}>{t('navigation.search')}</LocalizedNavLink>
              {user ? (
                <>
                  <LocalizedNavLink to="/entreprise/nouvelle" onClick={closeMenu}>{t('navigation.addListing')}</LocalizedNavLink>
                  <LocalizedNavLink to="/mes-entreprises" onClick={closeMenu}>{t('navigation.myBusinesses')}</LocalizedNavLink>
                  <LocalizedNavLink to="/profil" onClick={closeMenu} className="profile-avatar-link">
                    <img
                      src={avatarUrl || '/default-avatar.svg'}
                      alt="Profil"
                      className="header-avatar"
                    />
                  </LocalizedNavLink>
                </>
              ) : (
                <>
                  <LocalizedNavLink to="/connexion" onClick={closeMenu}>{t('navigation.login')}</LocalizedNavLink>
                  <LocalizedNavLink to="/inscription" onClick={closeMenu}>{t('navigation.register')}</LocalizedNavLink>
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
