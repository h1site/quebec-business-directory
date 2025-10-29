/**
 * Normalise le texte en enlevant les accents
 * Exemple: "Montréal" → "Montreal", "Québec" → "Quebec"
 */
export const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Normalise le texte pour la recherche (enlève accents + lowercase)
 */
export const normalizeForSearch = (str) => {
  if (!str) return '';
  return removeAccents(str).toLowerCase().trim();
};

/**
 * Vérifie si deux chaînes correspondent sans tenir compte des accents
 */
export const matchesIgnoreAccents = (text, searchTerm) => {
  if (!text || !searchTerm) return false;
  return normalizeForSearch(text).includes(normalizeForSearch(searchTerm));
};
