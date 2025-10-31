import { supabase } from './supabaseClient';

/**
 * Service pour tracker tous les clics sur les CTA (Call-To-Action)
 * des fiches d'entreprises
 */

// Fonction pour obtenir l'IP publique du client
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching client IP:', error);
    return null;
  }
};

// Fonction pour obtenir les informations du client
const getClientInfo = () => {
  return {
    userAgent: navigator.userAgent,
    referrer: document.referrer || null,
  };
};

/**
 * Fonction générique pour tracker un CTA
 * @param {string} businessId - ID de l'entreprise
 * @param {string} ctaType - Type de CTA (phone, website, waze, share_facebook, etc.)
 */
export const trackCTA = async (businessId, ctaType) => {
  try {
    const ip = await getClientIP();
    const clientInfo = getClientInfo();

    // Appeler la fonction PostgreSQL
    const { error } = await supabase.rpc('track_cta_click', {
      p_business_id: businessId,
      p_cta_type: ctaType,
      p_ip_address: ip,
      p_user_agent: clientInfo.userAgent,
      p_referrer: clientInfo.referrer
    });

    if (error) {
      console.error(`Error tracking CTA ${ctaType}:`, error);
    } else {
      console.log(`✅ CTA tracked: ${ctaType} for business ${businessId}`);
    }
  } catch (error) {
    console.error(`Error in trackCTA for ${ctaType}:`, error);
  }
};

/**
 * Tracker un clic sur le numéro de téléphone
 */
export const trackPhoneClick = (businessId) => {
  return trackCTA(businessId, 'phone');
};

/**
 * Tracker un clic sur le site web
 */
export const trackWebsiteClick = (businessId) => {
  return trackCTA(businessId, 'website');
};

/**
 * Tracker un clic sur Waze
 */
export const trackWazeClick = (businessId) => {
  return trackCTA(businessId, 'waze');
};

/**
 * Tracker un partage sur Facebook
 */
export const trackFacebookShare = (businessId) => {
  return trackCTA(businessId, 'share_facebook');
};

/**
 * Tracker un partage sur Twitter/X
 */
export const trackTwitterShare = (businessId) => {
  return trackCTA(businessId, 'share_twitter');
};

/**
 * Tracker un partage sur LinkedIn
 */
export const trackLinkedInShare = (businessId) => {
  return trackCTA(businessId, 'share_linkedin');
};

/**
 * Tracker un partage par email
 */
export const trackEmailShare = (businessId) => {
  return trackCTA(businessId, 'share_email');
};

/**
 * Obtenir les statistiques CTA d'une entreprise
 * @param {string} businessId - ID de l'entreprise
 * @param {number} days - Nombre de jours (par défaut 30)
 * @returns {Promise<Array>} Statistiques par type de CTA
 */
export const getBusinessCTAStats = async (businessId, days = 30) => {
  try {
    const { data, error } = await supabase.rpc('get_business_cta_stats', {
      p_business_id: businessId,
      p_days: days
    });

    if (error) {
      console.error('Error fetching CTA stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getBusinessCTAStats:', error);
    return [];
  }
};

export default {
  trackCTA,
  trackPhoneClick,
  trackWebsiteClick,
  trackWazeClick,
  trackFacebookShare,
  trackTwitterShare,
  trackLinkedInShare,
  trackEmailShare,
  getBusinessCTAStats
};
