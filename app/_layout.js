import AuthBootstrap from "@/providers/AuthBootstrap";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
//import SplashScreenController from "../components/splash-screen-controller";
import "../global.css";

// añadir splash screen controller aquí para que se muestre en toda la app, incluso en la pantalla de login

export default function RootLayout() {
  return (
    <AuthBootstrap>
      <GestureHandlerRootView>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="[id]"
            options={{
              headerTitle: `Item`,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </AuthBootstrap>
  );
}

// <Slot />

/* 
<SplashScreenController />
<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
*/
