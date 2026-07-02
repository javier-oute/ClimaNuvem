import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Versión del consentimiento del mapa: subir este número hace reaparecer el aviso a todos.
export const CURRENT_MAP_CONSENT_VERSION = 1;

export const useSettingsStore = create(
  persist(
    (set) => ({
      language: "gl", // 'es' | 'gl' | 'en'  (por defecto gallego)
      theme: "light", // 'light' | 'dark' | 'system'  (por defecto claro)
      // Consentimiento de publicación por dispositivo (null = no consentido); guarda la versión aceptada.
      mapPublishConsentVersion: null,
      // ¿Ya se mostró el aviso de bienvenida/onboarding en este dispositivo? (una sola vez)
      hasSeenOnboarding: false,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => {
        Appearance.setColorScheme(theme === "system" ? null : theme);
        set({ theme });
      },
      // version = CURRENT_MAP_CONSENT_VERSION para conceder; null para retirar.
      setMapPublishConsent: (version) =>
        set({ mapPublishConsentVersion: version }),
      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: "climanuvem-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// ¿El usuario ha consentido publicar en el mapa con la versión actual? (uso fuera de React)
export function hasMapPublishConsent() {
  return (
    useSettingsStore.getState().mapPublishConsentVersion ===
    CURRENT_MAP_CONSENT_VERSION
  );
}

export function applyStoredTheme() {
  const { theme } = useSettingsStore.getState();
  Appearance.setColorScheme(theme === "system" ? null : theme);
}
