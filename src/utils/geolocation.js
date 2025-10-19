/**
 * Geolocation utilities for Quebec businesses
 */

// Quebec regions with approximate geographic boundaries
// Format: [minLat, maxLat, minLng, maxLng]
const QUEBEC_REGIONS_BOUNDS = {
  'bas-saint-laurent': { lat: [47.3, 48.7], lng: [-69.5, -67.0], name: 'Bas-Saint-Laurent' },
  'saguenay-lac-saint-jean': { lat: [47.8, 51.0], lng: [-73.0, -70.5], name: 'Saguenay-Lac-Saint-Jean' },
  'capitale-nationale': { lat: [46.5, 47.8], lng: [-72.0, -70.0], name: 'Capitale-Nationale' },
  'mauricie': { lat: [46.2, 47.7], lng: [-73.5, -72.0], name: 'Mauricie' },
  'estrie': { lat: [45.0, 46.0], lng: [-72.5, -70.5], name: 'Estrie' },
  'montreal': { lat: [45.4, 45.7], lng: [-73.9, -73.5], name: 'Montréal' },
  'outaouais': { lat: [45.3, 47.0], lng: [-77.0, -75.0], name: 'Outaouais' },
  'abitibi-temiscamingue': { lat: [47.0, 49.5], lng: [-80.0, -77.0], name: 'Abitibi-Témiscamingue' },
  'cote-nord': { lat: [48.5, 52.0], lng: [-70.0, -61.0], name: 'Côte-Nord' },
  'nord-du-quebec': { lat: [49.0, 62.0], lng: [-79.0, -70.0], name: 'Nord-du-Québec' },
  'gaspesie-iles-de-la-madeleine': { lat: [47.0, 49.5], lng: [-66.0, -61.0], name: 'Gaspésie–Îles-de-la-Madeleine' },
  'chaudiere-appalaches': { lat: [45.8, 47.0], lng: [-71.5, -69.5], name: 'Chaudière-Appalaches' },
  'laval': { lat: [45.5, 45.7], lng: [-73.8, -73.6], name: 'Laval' },
  'lanaudiere': { lat: [45.7, 46.8], lng: [-74.5, -73.2], name: 'Lanaudière' },
  'laurentides': { lat: [45.4, 47.0], lng: [-75.0, -73.8], name: 'Laurentides' },
  'monteregie': { lat: [44.9, 45.8], lng: [-74.5, -72.5], name: 'Montérégie' },
  'centre-du-quebec': { lat: [45.8, 46.5], lng: [-72.8, -71.5], name: 'Centre-du-Québec' }
};

/**
 * Get user's current position using browser geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  });
};

/**
 * Determine Quebec region from coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string|null} Region slug or null if outside Quebec
 */
export const getRegionFromCoordinates = (latitude, longitude) => {
  // Check if coordinates are roughly in Quebec bounds
  if (latitude < 44.9 || latitude > 62.0 || longitude < -80.0 || longitude > -61.0) {
    return null; // Outside Quebec
  }

  // Find matching region
  for (const [slug, bounds] of Object.entries(QUEBEC_REGIONS_BOUNDS)) {
    const { lat, lng } = bounds;
    if (
      latitude >= lat[0] &&
      latitude <= lat[1] &&
      longitude >= lng[0] &&
      longitude <= lng[1]
    ) {
      return slug;
    }
  }

  // Default to closest major region if no exact match
  // Montreal area (most populated)
  if (latitude >= 45.0 && latitude <= 46.0 && longitude >= -74.5 && longitude <= -73.0) {
    return 'monteregie';
  }

  // Quebec City area
  if (latitude >= 46.5 && latitude <= 47.5 && longitude >= -72.0 && longitude <= -70.5) {
    return 'capitale-nationale';
  }

  return null;
};

/**
 * Get region name from slug
 * @param {string} slug
 * @returns {string|null}
 */
export const getRegionName = (slug) => {
  return QUEBEC_REGIONS_BOUNDS[slug]?.name || null;
};

/**
 * Request location and get Quebec region
 * @returns {Promise<{regionSlug: string, regionName: string}>}
 */
export const detectUserRegion = async () => {
  try {
    const position = await getCurrentPosition();
    const regionSlug = getRegionFromCoordinates(position.latitude, position.longitude);

    if (!regionSlug) {
      throw new Error('Location is outside Quebec');
    }

    return {
      regionSlug,
      regionName: getRegionName(regionSlug),
      coordinates: position
    };
  } catch (error) {
    console.error('Error detecting region:', error);
    throw error;
  }
};
