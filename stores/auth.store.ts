import { hardResetSupabaseAuth } from "@/lib/resetSupabaseAuth";
import type { Session } from "@supabase/supabase-js";
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
};

// Selector derivado (mejor que duplicar estado)
export const selectIsLoggedIn = (s: { session: Session | null | undefined }) =>
  !!s.session;

export const useAuthStore = create<AuthState>((set, get) => {
  // Para evitar races al cargar profile
  let profileReqId = 0;

  // Para evitar flicker en isLoading por operaciones solapadas
  let loadingCount = 0;
  const beginLoading = () => {
    loadingCount++;
    set({ isLoading: true });
  };
  const endLoading = () => {
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
    isLoading: true,

    initialize: () => {
      const { safeSet, kill, isAlive } = makeSafeSet();

      // 1) sesión inicial (async, pero cleanup sync)
      (async () => {
        beginLoading();
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

          console.log("INIT getSession:", {
            hasSession: !!session,
            userId: session?.user?.id,
            expiresAt: session?.expires_at,
          });

          if (error) console.warn("getSession:", error.message);

          safeSet({ session: session ?? null });
          await loadProfileForSession(session ?? null, safeSet, isAlive);
        } finally {
          endLoading();
        }
      })();

      // 2) suscripción (sync)
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth event:", event, "hasSession:", !!session);
          // Opcional “perfecto”: no recargar perfil en refresh de token si no cambia el usuario
          const prevUserId = get().session?.user?.id;
          const nextUserId = session?.user?.id;

          safeSet({ session: session ?? null });

          const userChanged = prevUserId !== nextUserId;

          if (
            userChanged ||
            event === "SIGNED_IN" ||
            event === "USER_UPDATED"
          ) {
            beginLoading();
            try {
              await loadProfileForSession(session ?? null, safeSet, isAlive);
            } finally {
              endLoading();
            }
          } else if (!session) {
            safeSet({ profile: null });
          }
        },
      );

      // cleanup
      return () => {
        kill();
        data.subscription.unsubscribe();
      };
    },

    refreshProfile: async () => {
      beginLoading();
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
        endLoading();
      }
    },

    signIn: async (email, password) => {
      beginLoading();
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
      } finally {
        endLoading();
      }
    },

    signUp: async (email, password) => {
      beginLoading();
      try {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw new Error(error.message);
      } finally {
        endLoading();
      }
    },

    signOut: async () => {
      beginLoading();
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
        set({ session: null, profile: null });
      } finally {
        endLoading();
      }
    },
  };
});

/*
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();

        console.log("SERVER getUser:", {
          ok: !userErr,
          userId: userData?.user?.id,
          err: userErr?.message,
        });

        if (userErr) {
          // sesión local vieja → límpiala
          await supabase.auth.signOut();
          set({ session: null, profile: null });
        }

        await supabase.auth.signOut(); // limpia storage (si puede)

        await SecureStore.deleteItemAsync("sb-egefjrnnjyuazdoabebd-auth-token");
*/
