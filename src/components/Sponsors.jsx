import { useTranslation } from 'react-i18next';
import './Sponsors.css';

const Sponsors = () => {
  const { t } = useTranslation();

  return (
    <section className="sponsors-section">
      <div className="container">
        {/* Hero Section avec message de croissance */}
        <div className="sponsors-hero">
          <div className="sponsors-hero-badge">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 15.5L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" fill="currentColor"/>
            </svg>
            <span>{t('home.sponsors')}</span>
          </div>

          <h2 className="sponsors-hero-title">
            {t('home.sponsorsGrowthTitle')}
          </h2>

          <p className="sponsors-hero-description">
            {t('home.sponsorsGrowthDescription')}
          </p>

          <a
            href="https://h1site.com/contact/"
            target="_blank"
            rel="noopener noreferrer"
            className="sponsors-cta-button"
          >
            {t('home.sponsorsCtaButton')}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
