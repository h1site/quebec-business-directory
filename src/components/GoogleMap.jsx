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
      console.log('GoogleMap: Coordonnées manquantes', { latitude, longitude });
      setError('Coordonnées GPS manquantes. Veuillez ajouter la latitude et longitude pour afficher la carte.');
      setLoading(false);
      return;
    }

    console.log('GoogleMap: Chargement avec coordonnées', { latitude, longitude });

    const initMap = () => {
      console.log('GoogleMap: initMap appelé', { isMounted, hasRef: !!mapRef.current });

      // Make sure component is still mounted and ref exists
      if (!isMounted || !mapRef.current) {
        console.log('GoogleMap: Component non monté ou ref manquante');
        return;
      }

      try {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
          console.error('GoogleMap: Coordonnées invalides', { lat, lng });
          setError('Coordonnées GPS invalides. Veuillez vérifier la latitude et longitude.');
          setLoading(false);
          return;
        }

        const position = { lat, lng };
        console.log('GoogleMap: Création de la carte', position);

        const map = new window.google.maps.Map(mapRef.current, {
          center: position,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        console.log('GoogleMap: Carte créée, ajout du marker');

        new window.google.maps.Marker({
          map: map,
          position: position,
          title: businessName || 'Emplacement de l\'entreprise'
        });

        mapInstanceRef.current = map;
        console.log('GoogleMap: Carte complète!');
        setLoading(false);
      } catch (err) {
        console.error('GoogleMap: Erreur lors de la création de la carte:', err);
        setError('Erreur lors de l\'affichage de la carte');
        setLoading(false);
      }
    };

    const tryInitMap = (attempt = 0) => {
      if (!mapRef.current) {
        if (attempt < 20) {
          // Retry up to 20 times with 50ms delay (1 second total)
          console.log(`GoogleMap: Ref pas prête, retry ${attempt + 1}/20`);
          setTimeout(() => tryInitMap(attempt + 1), 50);
        } else {
          console.error('GoogleMap: Timeout - ref jamais prête');
          setError('Élément de carte non disponible');
          setLoading(false);
        }
        return;
      }
      initMap();
    };

    const loadGoogleMapsScript = () => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        console.log('GoogleMap: Script déjà chargé, init map');
        tryInitMap();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('GoogleMap: Script en cours de chargement, attente...');
        existingScript.addEventListener('load', () => {
          console.log('GoogleMap: Script chargé via listener, init map');
          tryInitMap();
        });
        return;
      }

      // Load the script (without loading=async to get synchronous loading)
      console.log('GoogleMap: Chargement du script Google Maps...');
      const script = document.createElement('script');
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBY1wKHk0p0bf_Cw2lNZDW2zypePUrylxM';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('GoogleMap: Script chargé avec succès, init map');
        tryInitMap();
      };
      script.onerror = () => {
        console.error('GoogleMap: Erreur chargement script');
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

  return (
    <div className="google-map-container">
      {loading && <div className="map-loading">Chargement de la carte...</div>}
      {error && <div className="map-error">{error}</div>}
      <div
        ref={mapRef}
        className="google-map"
        style={{ display: loading || error ? 'none' : 'block' }}
      />
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
