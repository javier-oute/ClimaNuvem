import en from "@/locales/en";
import es from "@/locales/es";
import gl from "@/locales/gl";
import { useSettingsStore } from "@/stores/settings.store";

const translations = { es, gl, en };

function resolve(obj, key) {
  return key.split(".").reduce((o, k) => o?.[k], obj);
}

// Para componentes React — reactivo al cambio de idioma
export function useT() {
  const lang = useSettingsStore((s) => s.language);
  return (key) =>
    resolve(translations[lang], key) ?? resolve(translations.es, key) ?? key;
}

// Para fuera de React (hooks utilitarios, stores)
export function t(key) {
  const lang = useSettingsStore.getState().language;
  return (
    resolve(translations[lang], key) ?? resolve(translations.es, key) ?? key
  );
}

// Mapa de código de idioma → locale BCP-47 para Intl.DateTimeFormat
export const LOCALE_MAP = { es: "es-ES", gl: "gl-ES", en: "en-GB" };
