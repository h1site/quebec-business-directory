import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Cities.css';

const Cities = () => {
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
    <>
      <Helmet>
        <title>Entreprises par ville au Québec | Registre du Québec</title>
        <meta name="description" content="Découvrez les entreprises des 20 plus grandes villes du Québec : Montréal, Québec, Laval, Gatineau, Longueuil et plus." />
        <link rel="canonical" href="https://registreduquebec.com/villes" />
      </Helmet>

      <div className="container cities-page">
        <h1>Entreprises par ville</h1>
        <p className="cities-subtitle">Découvrez les entreprises des principales villes du Québec</p>

        <div className="cities-grid">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to={`/ville/${city.slug}`}
              className="city-card"
            >
              <h2 className="city-name">{city.name}</h2>
              <span className="city-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Cities;
