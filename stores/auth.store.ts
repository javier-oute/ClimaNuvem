import { hardResetSupabaseAuth } from "@/lib/resetSupabaseAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { AppState } from "react-native";
import { create } from "zustand";
import { supabase } from "../lib/supabase";

type AuthState = {
  session: Session | null | undefined; // undefined = aún no sabemos
  profile: any | null | undefined; // undefined = aún no sabemos
  isLoading: boolean;

  initialize: () => () => void; // cleanup sync
  refreshProfile: () => Promise<void>;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

// Selector derivado (mejor que duplicar estado)
export const selectIsLoggedIn = (s: { session: Session | null | undefined }) =>
  !!s.session;

export const useAuthStore = create<AuthState>((set, get) => {
  // Para evitar races al cargar profile
  let profileReqId = 0;

  // Para evitar flicker en isLoading por operaciones solapadas
  let loadingCount = 0;
  const beginLoading = (_reason: string) => {
    loadingCount++;
    set({ isLoading: true });
  };
  const endLoading = (_reason: string) => {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) set({ isLoading: false });
  };

  // helper: evita sets tras cleanup (si te interesa “perfecto”)
  const makeSafeSet = () => {
    let alive = true;
    const safeSet = (partial: Partial<AuthState>) => {
      if (alive) set(partial);
    };
    const kill = () => {
      alive = false;
    };
    return { safeSet, kill, isAlive: () => alive };
  };

  const loadProfileForSession = async (
    session: Session | null,
    safeSet: (partial: Partial<AuthState>) => void,
    isAlive: () => boolean,
  ) => {
    const reqId = ++profileReqId;

    if (!session) {
      safeSet({ profile: null });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // Si ya no es el último request, ignora
    if (reqId !== profileReqId) return;
    // Si ya no estamos “vivos”, ignora
    if (!isAlive()) return;

    if (error) {
      // Si NO tienes tabla profiles todavía, esto saltará.
      console.warn("refreshProfile:", error.message);
      safeSet({ profile: null });
      return;
    }

    safeSet({ profile: data ?? null });
  };

  return {
    session: undefined,
    profile: undefined,
    isLoading: false,

    initialize: () => {
      const { safeSet, kill, isAlive } = makeSafeSet();

      // Auto-refresh controlado por AppState (registrar SOLO una vez)
      const onAppState = (state: string) => {
        if (state === "active") supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      };
      const appStateSub = AppState.addEventListener("change", onAppState);
      onAppState(AppState.currentState);

      // 1) sesión inicial (async, pero cleanup sync)
      (async () => {
        beginLoading("initializa: getSession");
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error?.message?.includes("Invalid Refresh Token")) {
            console.warn("Invalid refresh token -> hard reset");
            await hardResetSupabaseAuth();
            safeSet({ session: null, profile: null });
            return; // salimos: ya está limpio, el user verá login
          }

          if (error) console.warn("getSession:", error.message);

          safeSet({ session: session ?? null });
          await loadProfileForSession(session ?? null, safeSet, isAlive);
        } finally {
          endLoading("initializa: getSession");
        }
      })();

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        const prevUserId = get().session?.user?.id;
        const nextUserId = session?.user?.id;

        safeSet({ session: session ?? null });

        const userChanged = prevUserId !== nextUserId;

        if (userChanged || event === "SIGNED_IN" || event === "USER_UPDATED") {
          // IMPORTANTÍSIMO: difiere la carga del perfil fuera del callback
          setTimeout(() => {
            beginLoading(`auth:${event}:profile`);
            loadProfileForSession(session ?? null, safeSet, isAlive)
              .catch((e) =>
                console.warn("loadProfileForSession:", e?.message ?? e),
              )
              .finally(() => endLoading(`auth:${event}:profile`));
          }, 0);
        } else if (!session) {
          safeSet({ profile: null });
        }
      });

      // cleanup
      return () => {
        kill();
        data.subscription.unsubscribe();
        appStateSub.remove();
        supabase.auth.stopAutoRefresh();
      };
    },

    refreshProfile: async () => {
      beginLoading("refreshProfile");
      try {
        const session = get().session ?? null;
        // safeSet “normal” aquí porque no hay un lifecycle de cleanup
        // (si te preocupa, puedes hacer versión safe también)
        const reqId = ++profileReqId;

        if (!session) {
          set({ profile: null });
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (reqId !== profileReqId) return;

        if (error) {
          console.warn("refreshProfile:", error.message);
          set({ profile: null });
          return;
        }

        set({ profile: data ?? null });
      } finally {
        endLoading("refreshProfile");
      }
    },

    signIn: async (email, password) => {
      beginLoading("sign-in");
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
      } finally {
        endLoading("sign-in");
      }
    },

    signUp: async (email, password) => {
      beginLoading("sign-up");
      try {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw new Error(error.message);
      } finally {
        endLoading("sign-up");
      }
    },

    signOut: async () => {
      beginLoading("sign-out");
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
        set({ session: null, profile: null });
        router.replace("/(auth)/login");
      } finally {
        endLoading("sign-out");
      }
    },

    // Borrado COMPLETO e irreversible de la cuenta. La Edge Function 'delete-account'
    // elimina Storage + auth.users (cascada a profiles/forecast_history). Aquí solo
    // limpiamos lo local y redirigimos. El modal gestiona su propio loading/error.
    deleteAccount: async () => {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw new Error(error.message);

      // Preferencias locales (idioma/tema) — no son datos de cuenta pero limpiamos por completo.
      try {
        await AsyncStorage.removeItem("climanuvem-settings");
      } catch {
        // no bloqueante
      }

      // Token de sesión cifrado + signOut local (puede fallar porque el usuario ya no existe).
      await hardResetSupabaseAuth();
      set({ session: null, profile: null });
      router.replace("/(auth)/login");
    },
  };
});
