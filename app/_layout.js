import AuthBootstrap from "@/providers/AuthBootstrap";
import { applyStoredTheme } from "@/stores/settings.store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import AnimatedSplash from "@/components/animated-splash";
import "../global.css";

// Mismos colores que la splash (app.json) → ninguna capa puede asomar en blanco en el relevo.
const SPLASH_BG_LIGHT = "#ffffff";
const SPLASH_BG_DARK = "#1e2a44";

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    applyStoredTheme();
  }, []);

  // Fondo NATIVO de ventana (host/windowBackground) acorde al tema: evita el destello blanco
  // por debajo de React durante el relevo splash → app.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      colorScheme === "dark" ? SPLASH_BG_DARK : SPLASH_BG_LIGHT,
    ).catch(() => {});
  }, [colorScheme]);

  return (
    <GestureHandlerRootView className="flex-1 bg-white dark:bg-[#1e2a44]">
      {/* Color de los iconos de la barra de estado según el tema (oscuros en claro,
          claros en oscuro). En Android edge-to-edge evita que el reloj/notificaciones
          se vuelvan blancos e ilegibles sobre fondos claros. */}
      <StatusBar style="auto" />
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
                  // Android: sin header nativo desde el primer frame (evita el
                  // flash del botón atrás negro al abrir); la pantalla dibuja su
                  // propio botón flotante. iOS mantiene su header transparente.
                  headerShown: Platform.OS === "ios",
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
                  headerShown: Platform.OS === "ios",
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
                  headerShown: Platform.OS === "ios",
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
                  headerShown: Platform.OS === "ios",
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
