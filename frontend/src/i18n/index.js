import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import fr from "./locales/fr.json"
import en from "./locales/en.json"

// The FR/EN switcher in Header.jsx now calls i18n.changeLanguage(), so the
// detector is used to persist and restore that explicit choice across
// reloads/tabs via localStorage. "navigator" is deliberately excluded from
// the order: browser-language auto-detection would show English to
// English-locale visitors who never chose that, so first-time visitors
// (no stored preference yet) must still land on fallbackLng ("fr").
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: "fr",
    supportedLngs: ["fr", "en"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "atlasserenity_lang",
    },
  })

export default i18n
