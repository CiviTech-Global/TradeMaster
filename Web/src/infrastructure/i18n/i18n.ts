import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import faTranslation from './locales/fa/translation.json';

const STORAGE_KEY = 'trademaster_language';

export const SUPPORTED_LANGUAGES = ['fa', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const getDefaultLanguage = (): SupportedLanguage => 'fa';

export const getStoredLanguage = (): SupportedLanguage | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch {
    // ignore
  }
  return null;
};

export const setStoredLanguage = (lang: SupportedLanguage) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
};

export const getLanguageDirection = (lang: string): 'rtl' | 'ltr' => {
  return lang === 'fa' ? 'rtl' : 'ltr';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fa: {
        translation: faTranslation,
      },
    },
    fallbackLng: 'fa',
    supportedLngs: ['fa', 'en'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: true,
    },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
