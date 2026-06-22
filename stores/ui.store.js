import { create } from "zustand";

// Estado de UI efímero de la sesión de ejecución (NO se persiste: debe arrancar en su valor
// por defecto en cada lanzamiento). De momento solo lleva la señal de "splash terminado", que
// usa el onboarding de la home para no lanzar su Alert mientras el overlay del splash sigue
// visible (un Alert nativo se dibuja por encima de todo, incluido el splash).
export const useUiStore = create((set) => ({
  // true cuando el overlay AnimatedSplash ya ha desaparecido por completo.
  splashDone: false,
  setSplashDone: () => set({ splashDone: true }),
}));
