import { PropsWithChildren, useEffect } from "react";
import { useAuthStore } from "../stores/auth.store";

export default function AuthBootstrap({ children }: PropsWithChildren) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  return <>{children}</>;
}

/*
import { PropsWithChildren, useEffect } from "react";
import { useAuthStore } from "../stores/auth.store";

export default function AuthBootstrap({ children }: PropsWithChildren) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    let cleanup: undefined | (() => void);
    let cancelled = false;

    (async () => {
      try {
        cleanup = initialize();
      } catch (e: any) {
        // initialize() en tu store es sync, así que normalmente no entra aquí
        console.warn("initialize threw synchronously:", e);
      }

      /**
       * Lo normal es que el error salga en tu store al hacer getSession/refresh,
       * así que la forma más robusta es: si detectas ese error dentro del store,
       * llamas a hardResetSupabaseAuth desde allí.
       *
       * Pero si tú lo estás viendo aquí y quieres un “safety net”, puedes hacer:
       *
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [initialize]);

  return <>{children}</>;
}
*/
