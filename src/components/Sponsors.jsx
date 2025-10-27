import './Sponsors.css';

const Sponsors = () => {
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

  return (
    <section className="sponsors-section">
      <div className="container">
        <p className="sponsors-title">Commanditaires</p>
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
        <p className="sponsors-contact">
          Pour commanditer notre registre, nous rejoindre sur{' '}
          <a href="https://h1site.com" target="_blank" rel="noopener noreferrer">
            h1site.com
          </a>
        </p>
      </div>
    </section>
  );
};

export default Sponsors;
