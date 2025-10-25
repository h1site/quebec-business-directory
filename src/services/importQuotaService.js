/**
 * Import Quota Service
 *
 * Manages Google Places API import quota to stay within free tier (100 calls/day).
 * Limit set to 90 imports/day to leave margin of safety.
 */

// Get API base URL (same logic as googleBusinessService.js)
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (import.meta.env.MODE === 'production' && apiUrl.startsWith('http://')) {
      return apiUrl.replace('http://', 'https://');
    }
    return apiUrl;
  }
  return import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
const QUOTA_ENDPOINT = `${API_BASE_URL}/google-places/quota`;

/**
 * Get current import quota information
 * @param {number} limit - Daily limit (default 90)
 * @returns {Promise<Object>} Quota info: { imports_today, limit, remaining, can_import, percentage_used, date }
 */
export const getQuotaInfo = async (limit = 90) => {
  try {
    const response = await fetch(`${QUOTA_ENDPOINT}?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch quota info: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quota info:', error);
    // Return default values if fetch fails
    return {
      imports_today: 0,
      limit: limit,
      remaining: limit,
      can_import: true,
      percentage_used: 0,
      date: new Date().toISOString().split('T')[0],
      error: error.message
    };
  }
};

/**
 * Check if user can import (quota not exceeded)
 * @param {number} limit - Daily limit (default 90)
 * @returns {Promise<boolean>} True if can import, false if quota exceeded
 */
export const canImport = async (limit = 90) => {
  try {
    const quotaInfo = await getQuotaInfo(limit);
    return quotaInfo.can_import;
  } catch (error) {
    console.error('Error checking if can import:', error);
    // If check fails, allow import (fail-open)
    return true;
  }
};

/**
 * Get quota status message for display
 * @param {Object} quotaInfo - Quota information object
 * @returns {Object} { message, type, icon } - Message with type (info/warning/danger)
 */
export const getQuotaStatusMessage = (quotaInfo) => {
  if (!quotaInfo || quotaInfo.error) {
    return {
      message: 'Unable to check import quota',
      type: 'info',
      icon: 'ℹ️'
    };
  }

  const { imports_today, limit, percentage_used } = quotaInfo;

  // Quota exceeded (100%)
  if (imports_today >= limit) {
    return {
      message: `Quota quotidien atteint (${imports_today}/${limit}). Revenez demain ou utilisez la demande manuelle.`,
      type: 'danger',
      icon: '🚫'
    };
  }

  // Warning level (80-99%)
  if (percentage_used >= 80) {
    return {
      message: `Attention: ${imports_today}/${limit} imports utilisés aujourd'hui (${percentage_used}%)`,
      type: 'warning',
      icon: '⚠️'
    };
  }

  // Normal level (0-79%)
  return {
    message: `Imports aujourd'hui: ${imports_today}/${limit} (${quotaInfo.remaining} restants)`,
    type: 'info',
    icon: '✅'
  };
};

/**
 * Get admin-specific quota status (with more details and different thresholds)
 * @param {Object} quotaInfo - Quota information object
 * @returns {Object} { message, type, icon, canOverride } - Admin-specific message
 */
export const getAdminQuotaStatusMessage = (quotaInfo) => {
  if (!quotaInfo || quotaInfo.error) {
    return {
      message: 'Unable to check import quota',
      type: 'info',
      icon: 'ℹ️',
      canOverride: true
    };
  }

  const { imports_today, limit, percentage_used } = quotaInfo;

  // Quota exceeded (100%) - Admin can still override
  if (imports_today >= limit) {
    return {
      message: `🚨 LIMITE ATTEINTE! ${imports_today}/${limit} imports. Les prochains imports seront PAYANTS ($0.02 chacun)`,
      type: 'danger',
      icon: '🚨',
      canOverride: true,
      costWarning: true
    };
  }

  // Warning level (80-99%) - Admin warning
  if (percentage_used >= 80) {
    return {
      message: `⚠️ ATTENTION: ${imports_today}/${limit} imports (${percentage_used}%). Proche de la limite gratuite!`,
      type: 'warning',
      icon: '⚠️',
      canOverride: true
    };
  }

  // Normal level (0-79%)
  return {
    message: `✅ Quota OK: ${imports_today}/${limit} imports (${quotaInfo.remaining} restants)`,
    type: 'success',
    icon: '✅',
    canOverride: true
  };
};

/**
 * Format quota info for display (compact version for button)
 * @param {Object} quotaInfo - Quota information object
 * @returns {string} Compact display string: "45/90"
 */
export const formatQuotaDisplay = (quotaInfo) => {
  if (!quotaInfo || quotaInfo.error) {
    return '?/90';
  }
  return `${quotaInfo.imports_today}/${quotaInfo.limit}`;
};

/**
 * Check if quota is in warning zone (>= 80%)
 * @param {Object} quotaInfo - Quota information object
 * @returns {boolean} True if in warning zone
 */
export const isQuotaWarning = (quotaInfo) => {
  if (!quotaInfo) return false;
  return quotaInfo.percentage_used >= 80;
};

/**
 * Check if quota is exceeded
 * @param {Object} quotaInfo - Quota information object
 * @returns {boolean} True if quota exceeded
 */
export const isQuotaExceeded = (quotaInfo) => {
  if (!quotaInfo) return false;
  return !quotaInfo.can_import;
};
