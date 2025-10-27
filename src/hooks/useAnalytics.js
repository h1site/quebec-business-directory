import { useEffect } from 'react';
import { trackBusinessView, trackWebsiteClick } from '../services/analyticsService';

/**
 * Hook personnalisé pour gérer le tracking des analytics
 */

/**
 * Track automatiquement la vue d'une fiche d'entreprise
 * @param {string} businessId - L'ID de l'entreprise
 */
export const useTrackBusinessView = (businessId) => {
  useEffect(() => {
    if (businessId) {
      // Attendre 2 secondes avant de tracker pour éviter les bounces
      const timer = setTimeout(() => {
        trackBusinessView(businessId);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [businessId]);
};

/**
 * Retourne une fonction pour tracker les clics sur site web
 * @param {string} businessId - L'ID de l'entreprise
 */
export const useTrackWebsiteClick = (businessId) => {
  return (websiteUrl) => {
    if (businessId && websiteUrl) {
      trackWebsiteClick(businessId, websiteUrl);
    }
  };
};

export default {
  useTrackBusinessView,
  useTrackWebsiteClick
};
