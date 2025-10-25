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
  // Don't render anything if coordinates are missing
  if (!latitude || !longitude) {
    return null;
  }

  // Validate coordinates
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const position = [lat, lng];

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
