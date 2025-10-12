// --- ADDED: NEW FILE ---
// src/utils/formatPrice.js

/**
 * Formats a number into a currency string based on locale and currency code.
 * @param {number} price The numerical price to format.
 * @param {string} currency The ISO currency code (e.g., 'EUR', 'USD'). Defaults to 'EUR'.
 * @param {string} locale The locale string (e.g., 'fr-FR', 'en-US'). Defaults to 'fr-FR'.
 * @returns {string} The formatted currency string.
 */
export const formatPrice = (price, currency = 'EUR', locale = 'fr-FR') => {
  // Ensure price is a number, default to 0 if not.
  const numericPrice = typeof price === 'number' ? price : 0;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(numericPrice);
};