import { useAuthStore } from "@/stores/auth.store";
import { Redirect } from "expo-router";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Mientras inicializa supabase (AuthBootstrap), no redirijas todavía
  if (isLoading || session === undefined) return null;

  return session ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
