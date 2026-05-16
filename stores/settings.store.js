import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set) => ({
      language: "es", // 'es' | 'gl' | 'en'
      theme: "system", // 'light' | 'dark' | 'system'
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => {
        Appearance.setColorScheme(theme === "system" ? null : theme);
        set({ theme });
      },
    }),
    {
      name: "climanuvem-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function applyStoredTheme() {
  const { theme } = useSettingsStore.getState();
  Appearance.setColorScheme(theme === "system" ? null : theme);
}
