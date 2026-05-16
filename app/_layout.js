import AuthBootstrap from "@/providers/AuthBootstrap";
import { applyStoredTheme } from "@/stores/settings.store";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
//import SplashScreenController from "../components/splash-screen-controller";
import "../global.css";

// añadir splash screen controller aquí para que se muestre en toda la app, incluso en la pantalla de login

export default function RootLayout() {
  useEffect(() => {
    applyStoredTheme();
  }, []);

  return (
    <GestureHandlerRootView className="flex-1 dark:bg-zinc-900">
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? undefined}>
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
          </Stack>
        </AuthBootstrap>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// <Slot />

/* 
<SplashScreenController />
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
*/
