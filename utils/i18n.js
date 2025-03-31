import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import enTranslation from "../locales/en.json"
import trTranslation from "../locales/tr.json"

const resources = {
  en: {
    translation: enTranslation
  },
  tr: {
    translation: trTranslation
  }
};

// Load saved language or default to Turkish
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('languagePreference');
    return savedLanguage || 'tr';
  } catch (error) {
    console.error('Failed to load language preference', error);
    return 'tr';
  }
};

// Initialize with default language first
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Then try to update with saved language
getInitialLanguage().then(language => {
  i18n.changeLanguage(language);
});

// Override changeLanguage to also save the preference
const originalChangeLanguage = i18n.changeLanguage;
i18n.changeLanguage = async (language) => {
  try {
    await AsyncStorage.setItem('languagePreference', language);
  } catch (error) {
    console.error('Failed to save language preference', error);
  }
  return originalChangeLanguage.call(i18n, language);
};

export default i18n;
