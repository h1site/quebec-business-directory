import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" style={{ minHeight: '60px', display: 'flex', alignItems: 'center', padding: '1rem 0' }}>
      <div className="container">
        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <p style={{ margin: 0 }}>
            {t('footer.copyrightYear', { year: currentYear })}
            <br className="footer-mobile-break" />
            {t('footer.copyrightRights')}
          </p>
          <p style={{ margin: 0 }}>
            {t('footer.createdBy')}{' '}
            <a
              href="https://h1site.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#ffbd3d',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffd700'}
              onMouseLeave={(e) => e.target.style.color = '#ffbd3d'}
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
