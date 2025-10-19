import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './GoogleMap.css';

const GoogleMap = ({ address, city, province = 'QC', postalCode, businessName, latitude, longitude }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Check if coordinates are provided
    if (!latitude || !longitude) {
      setError('Coordonnées GPS manquantes. Veuillez ajouter la latitude et longitude pour afficher la carte.');
      setLoading(false);
      return;
    }

    const initMap = () => {
      // Make sure component is still mounted and ref exists
      if (!isMounted || !mapRef.current) {
        return;
      }

      try {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
          setError('Coordonnées GPS invalides. Veuillez vérifier la latitude et longitude.');
          setLoading(false);
          return;
        }

        const position = { lat, lng };

        const map = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        new window.google.maps.Marker({
          map: map,
          position: position,
          title: businessName || 'Emplacement de l\'entreprise'
        });

        mapInstanceRef.current = map;
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la création de la carte:', err);
        setError('Erreur lors de l\'affichage de la carte');
        setLoading(false);
      }
    };

    const loadGoogleMapsScript = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        // Wait a tick for the DOM to be ready
        setTimeout(initMap, 100);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          setTimeout(initMap, 100);
        });
        return;
      }

      // Load the script
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBY1wKHk0p0bf_Cw2lNZDW2zypePUrylxM';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => {
        setTimeout(initMap, 100);
      };
      script.onerror = () => {
        if (isMounted) {
          setError('Erreur lors du chargement de Google Maps');
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Cleanup
    return () => {
      isMounted = false;
      mapInstanceRef.current = null;
    };
  }, [address, city, province, postalCode, businessName, latitude, longitude]);

  if (loading) {
    return (
      <div className="google-map-container">
        <div className="map-loading">Chargement de la carte...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="google-map-container">
        <div className="map-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="google-map-container">
      <div ref={mapRef} className="google-map" />
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
