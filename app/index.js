import { useAuthStore } from "@/stores/auth.store";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Mientras inicializa supabase (AuthBootstrap), no redirijas todavía. Loader con el fondo del tema
  // (evita el flash en blanco) en lugar de null.
  if (isLoading || session === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <ActivityIndicator />
      </View>
    );
  }

  return session ? (
    <Redirect href="/(tabs)/home" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
