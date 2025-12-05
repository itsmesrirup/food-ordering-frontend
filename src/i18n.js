import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import enTranslations from './locales/en/translation.json';
import frTranslations from './locales/fr/translation.json';
import deTranslations from './locales/de/translation.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: true, // Set to false in production
    supportedLngs: ['en', 'fr', 'de'], // Ensure 'de' is here
    fallbackLng: 'fr', // --- Fallback to French if language not detected ---
    lng: 'fr', // --- Force start in French (optional, usually detection is better) ---
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    resources: {
      en: {
        translation: enTranslations
      },
      fr: {
        translation: frTranslations
      },
      de: {
        translation: deTranslations
      }
    }
  });

export default i18n;