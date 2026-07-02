import { create } from "zustand";

// Estado de UI efímero no persistido (arranca por defecto); lleva la señal de 'splash terminado' para el onboarding.
export const useUiStore = create((set) => ({
  // true cuando el overlay AnimatedSplash ya ha desaparecido por completo.
  splashDone: false,
  setSplashDone: () => set({ splashDone: true }),
}));
