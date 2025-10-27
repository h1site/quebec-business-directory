import { useState, useEffect } from 'react';
import './Sponsors.css';

const Sponsors = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sponsors = [
    {
      name: 'KracRadio',
      logo: '/images/sponsors/kracradio.png',
      url: 'https://kracradio.com',
      description: 'KracRadio is a Montreal-based, 100% indie music web radio station that was founded in 2020 and focuses on promoting emerging and alternative artists. It features varied programming, podcasts, and magazines, and also provides a platform for artists to connect, share their talent, and collaborate through its social media communities.'
    },
    {
      name: 'MenuCochon',
      logo: '/images/sponsors/menucochon-blanc.svg',
      url: 'https://menucochon.com',
      description: 'MenuCochon est un blogue de recettes gourmandes, dédié à la cuisine généreuse et savoureuse. Nous sommes des passionnés de cuisine et adorons partager notre amour pour la bonne nourriture. Nous espérons que vous y trouverez une recette d\'antan ou plus actuelle qui fera le bonheur de votre famille.'
    }
  ];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sponsors.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sponsors.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="sponsors-section">
      <div className="container">
        <h2 className="sponsors-title">Nos Commanditaires</h2>

        <div className="sponsors-carousel">
          <div className="sponsors-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {sponsors.map((sponsor, index) => (
              <div key={index} className="sponsor-slide">
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-link"
                >
                  <div className="sponsor-logo-container">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="sponsor-logo"
                    />
                  </div>
                  <div className="sponsor-info">
                    <h3 className="sponsor-name">{sponsor.name}</h3>
                    <p className="sponsor-description">{sponsor.description}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="sponsors-indicators">
          {sponsors.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to sponsor ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
