import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';
import './OpenStreetMap.css';

// Fix for default marker icons in React-Leaflet
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const OpenStreetMap = ({ latitude, longitude, businessName, address, city }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoordinates = async () => {
      // Si on a déjà les coordonnées, les utiliser directement
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          setPosition([lat, lng]);
          setLoading(false);
          return;
        }
      }

      // Sinon, géocoder l'adresse avec Nominatim
      if (address && city) {
        try {
          const fullAddress = `${address}, ${city}, Quebec, Canada`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&` +
            `q=${encodeURIComponent(fullAddress)}&` +
            `countrycodes=ca&` +
            `limit=1`,
            {
              headers: {
                'User-Agent': 'QuebecBusinessDirectory/1.0'
              }
            }
          );

          const data = await response.json();

          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setPosition([lat, lng]);
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }

      setLoading(false);
    };

    loadCoordinates();
  }, [latitude, longitude, address, city]);

  // Ne rien afficher si pas de coordonnées disponibles
  if (loading || !position) {
    return null;
  }

  return (
    <div className="openstreetmap-container">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="openstreetmap"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {businessName && <strong>{businessName}</strong>}
            {address && <div>{address}</div>}
            {city && <div>{city}</div>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

OpenStreetMap.propTypes = {
  latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  businessName: PropTypes.string,
  address: PropTypes.string,
  city: PropTypes.string
};

export default OpenStreetMap;
