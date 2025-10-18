/**
 * Business Hours Service
 *
 * Handles parsing, saving, and managing business hours from various sources
 * including Google Business Profile.
 */

import { supabase } from './supabaseClient.js';

/**
 * Parse Google's weekday_text format to structured hours
 * Example: "Monday: 9:00 AM – 5:00 PM" or "Monday: Closed"
 *
 * @param {Array<string>} weekdayText - Array from Google Places API
 * @returns {Array<Object>} - Structured hours for database
 */
export const parseGoogleHours = (weekdayText) => {
  if (!weekdayText || weekdayText.length === 0) return [];

  const dayMapping = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 0
  };

  const hours = [];

  weekdayText.forEach((dayText) => {
    // Format: "Monday: 9:00 AM – 5:00 PM" or "Monday: Closed" or "Monday: Open 24 hours"
    const match = dayText.match(/^(\w+):\s*(.+)$/);
    if (!match) return;

    const [, dayName, hoursText] = match;
    const dayOfWeek = dayMapping[dayName];

    if (dayOfWeek === undefined) return;

    // Check if closed
    if (hoursText.toLowerCase().includes('closed')) {
      hours.push({
        day_of_week: dayOfWeek,
        is_closed: true,
        is_24h: false,
        opens_at: null,
        closes_at: null
      });
      return;
    }

    // Check if 24 hours
    if (hoursText.toLowerCase().includes('24 hours') || hoursText.toLowerCase().includes('open 24')) {
      hours.push({
        day_of_week: dayOfWeek,
        is_closed: false,
        is_24h: true,
        opens_at: null,
        closes_at: null
      });
      return;
    }

    // Parse time range: "9:00 AM – 5:00 PM"
    const timeMatch = hoursText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;

      const opensAt = convertTo24Hour(parseInt(openHour), parseInt(openMin), openPeriod);
      const closesAt = convertTo24Hour(parseInt(closeHour), parseInt(closeMin), closePeriod);

      hours.push({
        day_of_week: dayOfWeek,
        is_closed: false,
        is_24h: false,
        opens_at: opensAt,
        closes_at: closesAt
      });
    }
  });

  return hours;
};

/**
 * Convert 12-hour time to 24-hour format (HH:MM:SS)
 */
const convertTo24Hour = (hour, minute, period) => {
  let hour24 = hour;

  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour24 = hour + 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour24 = 0;
  }

  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
};

/**
 * Save business hours to database
 *
 * @param {string} businessId - UUID of the business
 * @param {Array<Object>} hours - Array of hour objects
 */
export const saveBusinessHours = async (businessId, hours) => {
  if (!businessId || !hours || hours.length === 0) return { error: 'Invalid input' };

  try {
    // Delete existing hours for this business
    const { error: deleteError } = await supabase
      .from('business_hours')
      .delete()
      .eq('business_id', businessId);

    if (deleteError) throw deleteError;

    // Insert new hours
    const hoursWithBusinessId = hours.map(hour => ({
      ...hour,
      business_id: businessId
    }));

    const { data, error } = await supabase
      .from('business_hours')
      .insert(hoursWithBusinessId)
      .select();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error saving business hours:', error);
    return { data: null, error };
  }
};

/**
 * Get business hours for a business
 *
 * @param {string} businessId - UUID of the business
 * @returns {Promise<Object>} - { data, error }
 */
export const getBusinessHours = async (businessId) => {
  try {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching business hours:', error);
    return { data: null, error };
  }
};

/**
 * Format hours for display
 * Converts database format to human-readable format
 *
 * @param {Array<Object>} hours - Hours from database
 * @param {string} language - 'fr' or 'en'
 * @returns {Array<Object>} - Formatted hours with labels
 */
export const formatHoursForDisplay = (hours, language = 'fr') => {
  const dayNames = {
    fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };

  const closedText = language === 'fr' ? 'Fermé' : 'Closed';
  const open24Text = language === 'fr' ? 'Ouvert 24h' : 'Open 24h';

  return hours.map(hour => {
    const dayName = dayNames[language][hour.day_of_week];

    let hoursText = '';
    if (hour.is_closed) {
      hoursText = closedText;
    } else if (hour.is_24h) {
      hoursText = open24Text;
    } else {
      const opensAt = format12Hour(hour.opens_at);
      const closesAt = format12Hour(hour.closes_at);
      hoursText = `${opensAt} - ${closesAt}`;
    }

    return {
      day_of_week: hour.day_of_week,
      day_name: dayName,
      hours_text: hoursText,
      is_closed: hour.is_closed,
      is_24h: hour.is_24h,
      opens_at: hour.opens_at,
      closes_at: hour.closes_at
    };
  });
};

/**
 * Convert 24-hour time (HH:MM:SS) to 12-hour format
 */
const format12Hour = (time24) => {
  if (!time24) return '';

  const [hour, minute] = time24.split(':');
  const hour24 = parseInt(hour);

  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  return `${hour12}:${minute} ${period}`;
};

/**
 * Get current status and next opening/closing time
 *
 * @param {Array<Object>} hours - Hours from database
 * @param {Date} currentDate - Current date/time (defaults to now)
 * @returns {Object} - { isOpen, status, nextChange }
 */
export const getCurrentStatus = (hours, currentDate = new Date()) => {
  if (!hours || hours.length === 0) {
    return { isOpen: null, status: 'Heures non disponibles', nextChange: null };
  }

  const dayOfWeek = currentDate.getDay();
  const currentTime = `${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:00`;

  const todayHours = hours.find(h => h.day_of_week === dayOfWeek);

  if (!todayHours) {
    return { isOpen: null, status: 'Heures non disponibles', nextChange: null };
  }

  if (todayHours.is_closed) {
    return { isOpen: false, status: 'Fermé', nextChange: null };
  }

  if (todayHours.is_24h) {
    return { isOpen: true, status: 'Ouvert 24h', nextChange: null };
  }

  const isOpen = currentTime >= todayHours.opens_at && currentTime < todayHours.closes_at;
  const status = isOpen ? `Ouvert jusqu'à ${format12Hour(todayHours.closes_at)}` : 'Fermé';

  return { isOpen, status, nextChange: isOpen ? todayHours.closes_at : todayHours.opens_at };
};

/**
 * Validate hours data
 */
export const validateHours = (hours) => {
  if (!Array.isArray(hours)) return false;

  for (const hour of hours) {
    if (hour.day_of_week < 0 || hour.day_of_week > 6) return false;

    if (!hour.is_closed && !hour.is_24h) {
      if (!hour.opens_at || !hour.closes_at) return false;
    }
  }

  return true;
};
