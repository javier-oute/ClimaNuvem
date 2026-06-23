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
