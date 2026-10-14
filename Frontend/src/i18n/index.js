import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import az from "./locales/az.json";
import en from "./locales/en.json";

const savedLanguage = localStorage.getItem("hospital_language");

i18n.use(initReactI18next).init({
  resources: {
    az: { translation: az },
    en: { translation: en },
  },
  lng: savedLanguage === "en" ? "en" : "az",
  fallbackLng: "az",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem("hospital_language", language);
  document.documentElement.lang = language;
});

document.documentElement.lang = i18n.language;

export default i18n;