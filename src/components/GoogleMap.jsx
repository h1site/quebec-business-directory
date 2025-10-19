import { useState } from 'react';
import PropTypes from 'prop-types';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import './GoogleMap.css';

const GoogleMap = ({ latitude, longitude }) => {
  const [error, setError] = useState(null);

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

  const position = { lat, lng };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBY1wKHk0p0bf_Cw2lNZDW2zypePUrylxM';

  // Log the exact coordinates where the pin is placed
  console.log('📍 GoogleMap: Pin positionnée aux coordonnées:', {
    latitude: lat,
    longitude: lng,
    position: position
  });

  return (
    <div className="google-map-container">
      {error && <div className="map-error">{error}</div>}
      <APIProvider
        apiKey={apiKey}
        onLoad={() => console.log('✅ Google Maps API chargée avec succès')}
        onError={(err) => {
          console.error('❌ Erreur chargement Google Maps API:', err);
          setError('Erreur lors du chargement de Google Maps');
        }}
      >
        <Map
          defaultCenter={position}
          defaultZoom={15}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          className="google-map"
          mapId="business-map"
          onCameraChanged={(ev) => {
            console.log('🗺️ Caméra déplacée - Centre:', ev.detail.center, 'Zoom:', ev.detail.zoom);
          }}
        >
          <AdvancedMarker position={position}>
            <Pin
              background="#EA4335"
              borderColor="#C5221F"
              glyphColor="#FFF"
            />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

GoogleMap.propTypes = {
  address: PropTypes.string,
  city: PropTypes.string,
  province: PropTypes.string,
  postalCode: PropTypes.string,
  businessName: PropTypes.string,
  latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default GoogleMap;
