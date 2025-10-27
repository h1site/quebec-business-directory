import { supabase } from './supabaseClient';

/**
 * Service pour gérer les statistiques et analytics
 */

// Fonction pour obtenir l'IP publique du client
export const getClientIP = async () => {
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
    // On peut ajouter d'autres infos si nécessaire
  };
};

/**
 * Enregistre une vue sur une fiche d'entreprise
 * @param {string} businessId - L'ID de l'entreprise
 */
export const trackBusinessView = async (businessId) => {
  try {
    const ip = await getClientIP();
    const clientInfo = getClientInfo();

    if (!ip) {
      console.warn('Could not get client IP, view not tracked');
      return;
    }

    // Appeler la fonction PostgreSQL qui gère l'exclusion des IPs admin
    const { error } = await supabase.rpc('record_business_view', {
      p_business_id: businessId,
      p_ip_address: ip,
      p_user_agent: clientInfo.userAgent,
      p_referrer: clientInfo.referrer
    });

    if (error) {
      console.error('Error tracking business view:', error);
    }
  } catch (error) {
    console.error('Error in trackBusinessView:', error);
  }
};

/**
 * Enregistre un clic sur le site web d'une entreprise
 * @param {string} businessId - L'ID de l'entreprise
 * @param {string} websiteUrl - L'URL du site web cliqué
 */
export const trackWebsiteClick = async (businessId, websiteUrl) => {
  try {
    const ip = await getClientIP();
    const clientInfo = getClientInfo();

    if (!ip) {
      console.warn('Could not get client IP, click not tracked');
      return;
    }

    // Appeler la fonction PostgreSQL
    const { error } = await supabase.rpc('record_website_click', {
      p_business_id: businessId,
      p_website_url: websiteUrl,
      p_ip_address: ip,
      p_user_agent: clientInfo.userAgent,
      p_referrer: clientInfo.referrer
    });

    if (error) {
      console.error('Error tracking website click:', error);
    }
  } catch (error) {
    console.error('Error in trackWebsiteClick:', error);
  }
};

/**
 * Enregistre l'IP d'un admin pour l'exclure des stats
 * @param {string} userId - L'ID de l'utilisateur admin
 */
export const registerAdminIP = async (userId) => {
  try {
    const ip = await getClientIP();

    if (!ip) {
      console.warn('Could not get client IP');
      return;
    }

    const { error } = await supabase
      .from('admin_ips')
      .upsert({
        user_id: userId,
        ip_address: ip,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,ip_address'
      });

    if (error) {
      console.error('Error registering admin IP:', error);
    } else {
      console.log('Admin IP registered successfully:', ip);
    }
  } catch (error) {
    console.error('Error in registerAdminIP:', error);
  }
};

/**
 * Récupère les statistiques globales du site
 */
export const getGlobalStats = async () => {
  try {
    // Récupérer le nombre total d'entreprises
    const { count: totalBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    // Récupérer le nombre d'entreprises revendiquées
    const { count: claimedBusinesses } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('is_claimed', true);

    // Récupérer les stats agrégées
    const { data: dailyStats } = await supabase
      .from('daily_stats')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    // Top 10 des fiches les plus vues
    const { data: topViewed } = await supabase
      .from('business_stats')
      .select('business_id, total_views, businesses(name, slug, city)')
      .order('total_views', { ascending: false })
      .limit(10);

    // Top 10 des fiches avec le plus de clics
    const { data: topClicked } = await supabase
      .from('business_stats')
      .select('business_id, total_clicks, businesses(name, slug, city, website)')
      .order('total_clicks', { ascending: false })
      .limit(10);

    return {
      totalBusinesses: totalBusinesses || 0,
      claimedBusinesses: claimedBusinesses || 0,
      unclaimedBusinesses: (totalBusinesses || 0) - (claimedBusinesses || 0),
      dailyStats: dailyStats || [],
      topViewed: topViewed || [],
      topClicked: topClicked || []
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return null;
  }
};

/**
 * Récupère les statistiques par catégorie
 */
export const getCategoryStats = async () => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('primary_main_category_slug, primary_main_category_fr')
      .not('primary_main_category_slug', 'is', null);

    if (error) throw error;

    // Compter par catégorie
    const categoryCounts = {};
    data.forEach(business => {
      const category = business.primary_main_category_slug;
      if (category) {
        if (!categoryCounts[category]) {
          categoryCounts[category] = {
            slug: category,
            name: business.primary_main_category_fr,
            count: 0
          };
        }
        categoryCounts[category].count++;
      }
    });

    return Object.values(categoryCounts).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return [];
  }
};

/**
 * Récupère les statistiques géographiques
 */
export const getGeographicStats = async () => {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('city, region')
      .not('city', 'is', null);

    if (error) throw error;

    // Compter par ville
    const cityCounts = {};
    data.forEach(business => {
      const city = business.city;
      if (city) {
        if (!cityCounts[city]) {
          cityCounts[city] = {
            city,
            region: business.region,
            count: 0
          };
        }
        cityCounts[city].count++;
      }
    });

    return Object.values(cityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 villes
  } catch (error) {
    console.error('Error fetching geographic stats:', error);
    return [];
  }
};

/**
 * Récupère les statistiques pour une entreprise spécifique
 */
export const getBusinessStats = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('business_stats')
      .select('*')
      .eq('business_id', businessId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || {
      total_views: 0,
      total_clicks: 0,
      views_this_month: 0,
      clicks_this_month: 0
    };
  } catch (error) {
    console.error('Error fetching business stats:', error);
    return null;
  }
};

export default {
  trackBusinessView,
  trackWebsiteClick,
  registerAdminIP,
  getGlobalStats,
  getCategoryStats,
  getGeographicStats,
  getBusinessStats,
  getClientIP
};
