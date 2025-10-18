import { Link } from 'react-router-dom';
import { quebecRegions } from '../data/quebecRegions.js';
import './RegionsGrid.css';

const RegionsGrid = () => {
  // Split regions into 4 columns (distribute evenly)
  const regionsPerColumn = Math.ceil(quebecRegions.length / 4);
  const columns = [
    quebecRegions.slice(0, regionsPerColumn),
    quebecRegions.slice(regionsPerColumn, regionsPerColumn * 2),
    quebecRegions.slice(regionsPerColumn * 2, regionsPerColumn * 3),
    quebecRegions.slice(regionsPerColumn * 3)
  ];

  return (
    <div className="regions-section">
      <h2 className="section-title">Explorer par région</h2>
      <div className="regions-grid">
        {columns.map((columnRegions, colIndex) => (
          <div key={colIndex} className="region-column">
            {columnRegions.map((region, index) => (
              <div key={index} className="region-group">
                <div className="region-name">{region.name}</div>
                <ul className="cities-list">
                  {region.cities.slice(0, 6).map((city, cityIndex) => (
                    <li key={cityIndex}>
                      <Link
                        to={`/recherche?city=${encodeURIComponent(city)}`}
                        className="city-link"
                      >
                        {city}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionsGrid;
