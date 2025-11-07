import { Link } from 'react-router-dom';
import './CitiesSection.css';

const CitiesSection = () => {
  const cities = [
    { name: 'Montréal', slug: 'montreal' },
    { name: 'Québec', slug: 'quebec' },
    { name: 'Laval', slug: 'laval' },
    { name: 'Gatineau', slug: 'gatineau' },
    { name: 'Longueuil', slug: 'longueuil' },
    { name: 'Sherbrooke', slug: 'sherbrooke' },
    { name: 'Saguenay', slug: 'saguenay' },
    { name: 'Lévis', slug: 'levis' },
    { name: 'Trois-Rivières', slug: 'trois-rivieres' },
    { name: 'Terrebonne', slug: 'terrebonne' },
    { name: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu' },
    { name: 'Repentigny', slug: 'repentigny' },
    { name: 'Brossard', slug: 'brossard' },
    { name: 'Drummondville', slug: 'drummondville' },
    { name: 'Granby', slug: 'granby' },
    { name: 'Saint-Jérôme', slug: 'saint-jerome' },
    { name: 'Mirabel', slug: 'mirabel' },
    { name: 'Rimouski', slug: 'rimouski' },
    { name: 'Vaudreuil-Dorion', slug: 'vaudreuil-dorion' },
    { name: 'Victoriaville', slug: 'victoriaville' }
  ];

  return (
    <section className="cities-section">
      <div className="container">
        <h2 className="cities-section-title">Entreprises par ville</h2>
        <p className="cities-section-subtitle">Découvrez les entreprises des principales villes du Québec</p>
        
        <div className="cities-grid-home">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to={`/ville/${city.slug}`}
              className="city-link-home"
            >
              <span className="city-name-home">{city.name}</span>
              <span className="city-arrow-home">→</span>
            </Link>
          ))}
        </div>

        <div className="view-all-cities">
          <Link to="/villes" className="btn-view-all-cities">
            Voir toutes les villes →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CitiesSection;
