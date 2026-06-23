import AuthBootstrap from "@/providers/AuthBootstrap";
import { applyStoredTheme } from "@/stores/settings.store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { InteractionManager, Platform } from "react-native";
import { preloadModel } from "@/lib/tflite/modelLoader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import AnimatedSplash from "@/components/animated-splash";
import "../global.css";

// Mismos colores que la splash (app.json) → ninguna capa puede asomar en blanco en el relevo.
const SPLASH_BG_LIGHT = "#ffffff";
const SPLASH_BG_DARK = "#18181b";

// Temas de navegación (headers nativos de React Navigation). Sin esto, todos los headers caen al
// tema CLARO por defecto → fondo blanco aunque la app esté en oscuro (afectaba a Historial en
// Android, y a Login/Help en ambas plataformas). La paleta usa los colores reales de la app para
// que el header del Historial case sin costura con la lista (zinc-900 = #18181b). No afecta a los
// headers transparentes (los respeta) ni a las tab bars (color propio).
const CN_LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FFFFFF",
    card: "#FFFFFF",
    text: "#0F172A", // slate-900
    border: "#E2E8F0", // slate-200
    primary: "#314468",
  },
};
const CN_DarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#18181b", // zinc-900 (igual que dark:bg-zinc-900 de las pantallas)
    card: "#18181b",
    text: "#FFFFFF",
    border: "#3f3f46", // zinc-700
    primary: "#7B9BD0", // mismo activo que la tab bar oscura
  },
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    applyStoredTheme();
  }, []);

  // Precarga del modelo TFLite una sola vez, diferida tras las interacciones de
  // arranque para que la congelación de JS de la carga (~1-2 s) no pille el splash
  // ni la primera pantalla. Cuando el usuario llega a tomar una foto, el modelo ya
  // está en memoria → el "cargando" del pronóstico aparece al instante.
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      preloadModel().catch(() => {});
    });
    return () => task.cancel();
  }, []);

  // Fondo NATIVO de ventana (host/windowBackground) acorde al tema: evita el destello blanco
  // por debajo de React durante el relevo splash → app.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(
      colorScheme === "dark" ? SPLASH_BG_DARK : SPLASH_BG_LIGHT,
    ).catch(() => {});
  }, [colorScheme]);

  return (
    <GestureHandlerRootView className="flex-1 bg-white dark:bg-[#18181b]">
      {/* Color de los iconos de la barra de estado según el tema (oscuros en claro,
          claros en oscuro). En Android edge-to-edge evita que el reloj/notificaciones
          se vuelvan blancos e ilegibles sobre fondos claros. */}
      <StatusBar style="auto" />
      <KeyboardProvider>
        <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
          <BottomSheetModalProvider>
            <AuthBootstrap>
              <ThemeProvider
                value={colorScheme === "dark" ? CN_DarkTheme : CN_LightTheme}
              >
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
              </ThemeProvider>
            </AuthBootstrap>
            {/* Overlay de splash animada (zoom-in + fade). Sobre toda la app, incluido
              el login. Toma el relevo de la splash nativa y se desmonta al cargar. */}
            <AnimatedSplash />
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
