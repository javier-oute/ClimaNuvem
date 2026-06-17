import AuthBootstrap from "@/providers/AuthBootstrap";
import { applyStoredTheme } from "@/stores/settings.store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import AnimatedSplash from "@/components/animated-splash";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    applyStoredTheme();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1 dark:bg-zinc-900">
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
        <BottomSheetModalProvider>
          <AuthBootstrap>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen
                name="(tabs)"
                options={{
                  title: "",
                }}
              />
              <Stack.Screen
                name="[id]"
                options={{
                  headerBackTitleVisible: false,
                  headerShown: true,
                  headerTitle: "",
                  headerBackTitle: "",
                  headerTransparent: true,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="forecast-screen"
                options={{
                  headerBackTitleVisible: false,
                  headerShown: true,
                  headerTitle: "",
                  headerBackTitle: "",
                  headerTransparent: true,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="help"
                options={{
                  headerBackTitleVisible: false,
                  headerShown: true,
                  headerBackTitle: "",
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="map-prediction/[id]"
                options={{
                  headerBackTitleVisible: false,
                  headerShown: true,
                  headerTitle: "",
                  headerBackTitle: "",
                  headerTransparent: true,
                  headerShadowVisible: false,
                }}
              />
              <Stack.Screen
                name="cloud/[type]"
                options={{
                  headerBackTitleVisible: false,
                  headerShown: true,
                  headerTitle: "",
                  headerBackTitle: "",
                  headerTransparent: true,
                  headerShadowVisible: false,
                }}
              />
            </Stack>
          </AuthBootstrap>
          {/* Overlay de splash animada (zoom-in + fade). Sobre toda la app, incluido
              el login. Toma el relevo de la splash nativa y se desmonta al cargar. */}
          <AnimatedSplash />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
