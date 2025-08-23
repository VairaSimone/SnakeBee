import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import it from './locales/it/translation.json';

const detectedLang = (() => {
  try {
    const fromStorage = localStorage.getItem('language') || localStorage.getItem('i18nextLng');
    if (fromStorage) return fromStorage;
    return navigator.language?.split('-')[0] || 'it';
  } catch (e) {
    return 'it';
  }
})();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      it: { translation: it },
    },
    lng: detectedLang,
    fallbackLng: 'it',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
