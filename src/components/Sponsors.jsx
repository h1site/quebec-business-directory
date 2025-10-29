import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import './Sponsors.css';

const Sponsors = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const sponsors = [
    {
      name: 'KracRadio',
      logo: '/images/sponsors/kracradio.png',
      url: 'https://kracradio.com'
    },
    {
      name: 'MenuCochon',
      logo: '/images/sponsors/menucochon-blanc.svg',
      url: 'https://menucochon.com'
    },
    {
      name: 'KEmp3.app',
      logo: '/images/sponsors/kemp3.png',
      url: 'https://kemp3.app'
    },
    {
      name: 'AppGratuit.com',
      logo: '/images/sponsors/appgratuit.com.svg',
      url: 'https://appgratuit.com'
    }
  ];

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotate carousel on mobile
  useEffect(() => {
    if (!isMobile) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [isMobile, sponsors.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="sponsors-section">
      <div className="container">
        <p className="sponsors-title">{t('home.sponsors')}</p>

        {isMobile ? (
          // Mobile: Carousel
          <div className="sponsors-carousel">
            <div className="sponsors-carousel-track">
              {sponsors.map((sponsor, index) => (
                <a
                  key={index}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`sponsor-link sponsor-carousel-item ${
                    index === currentIndex ? 'active' : ''
                  } ${sponsor.name === 'AppGratuit.com' ? 'sponsor-link-oval' : ''}`}
                  title={sponsor.name}
                  style={{ display: index === currentIndex ? 'flex' : 'none' }}
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="sponsor-logo"
                  />
                </a>
              ))}
            </div>
            <div className="sponsors-carousel-dots">
              {sponsors.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => handleDotClick(index)}
                  aria-label={`Go to sponsor ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          // Desktop: Grid
          <div className="sponsors-grid">
            {sponsors.map((sponsor, index) => (
              <a
                key={index}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`sponsor-link ${sponsor.name === 'AppGratuit.com' ? 'sponsor-link-oval' : ''}`}
                title={sponsor.name}
              >
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="sponsor-logo"
                />
              </a>
            ))}
          </div>
        )}

        <p className="sponsors-contact">
          {t('home.sponsorContact')}{' '}
          <a href="https://h1site.com" target="_blank" rel="noopener noreferrer">
            h1site.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default Sponsors;
