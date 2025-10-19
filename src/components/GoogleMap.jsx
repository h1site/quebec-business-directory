import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './GoogleMap.css';

const GoogleMap = ({ address, city, province = 'QC', postalCode, businessName, latitude, longitude }) => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError('La carte met trop de temps à charger');
        setLoading(false);
      }
    }, 8000); // 8 seconds timeout

    const loadMap = () => {
      try {
        if (!window.google || !window.google.maps) {
          setError('Google Maps n\'est pas disponible');
          setLoading(false);
          return;
        }

        // Small delay to ensure DOM element is ready
        setTimeout(() => {
          if (!mapRef.current) {
            setError('Élément de carte non disponible');
            setLoading(false);
            return;
          }

          // Use coordinates if available (MUCH FASTER - no Geocoding API call needed)
          if (latitude && longitude) {
            try {
              const position = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

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

              setLoading(false);
            } catch (err) {
              console.error('Erreur lors de la création de la carte avec coordonnées:', err);
              setError('Erreur lors de l\'affichage de la carte');
              setLoading(false);
            }
          } else {
            // Fallback: Use Geocoding API if no coordinates (slower)
            const fullAddress = `${address}, ${city}, ${province} ${postalCode}, Canada`;
            const geocoder = new window.google.maps.Geocoder();

            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === 'OK' && results[0]) {
                try {
                  if (!mapRef.current) {
                    setError('Élément de carte perdu');
                    setLoading(false);
                    return;
                  }

                  const map = new window.google.maps.Map(mapRef.current, {
                    center: results[0].geometry.location,
                    zoom: 15,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true
                  });

                  new window.google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    title: businessName || 'Emplacement de l\'entreprise'
                  });

                  setLoading(false);
                } catch (err) {
                  console.error('Erreur lors de la création de la carte:', err);
                  setError('Erreur lors de l\'affichage de la carte');
                  setLoading(false);
                }
              } else {
                console.error('Geocoding failed:', status);
                setError(`Impossible de localiser l'adresse (${status})`);
                setLoading(false);
              }
            });
          }
        }, 50); // Small 50ms delay to ensure DOM is ready
      } catch (err) {
        console.error('Erreur dans loadMap:', err);
        setError('Erreur lors du chargement de la carte');
        setLoading(false);
      }
    };

    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      loadMap();
    } else {
      // Load Google Maps script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');

      if (existingScript) {
        // Script is already loading or loaded, wait for it
        existingScript.addEventListener('load', loadMap);
      } else {
        const script = document.createElement('script');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBY1wKHk0p0bf_Cw2lNZDW2zypePUrylxM';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = loadMap;
        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setError('Erreur lors du chargement de Google Maps');
          setLoading(false);
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      clearTimeout(timeout);
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
  address: PropTypes.string.isRequired,
  city: PropTypes.string.isRequired,
  province: PropTypes.string,
  postalCode: PropTypes.string.isRequired,
  businessName: PropTypes.string,
  latitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  longitude: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default GoogleMap;
