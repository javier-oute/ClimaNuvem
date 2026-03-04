import AuthBootstrap from "@/providers/AuthBootstrap";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
//import SplashScreenController from "../components/splash-screen-controller";
import "../global.css";

// añadir splash screen controller aquí para que se muestre en toda la app, incluso en la pantalla de login

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
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
