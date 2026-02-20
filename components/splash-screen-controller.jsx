import { useAuthStore } from "@/stores/auth.store";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashScreenController() {
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
      console.log("Splash screen changed");
    }
  }, [isLoading]);

  return null;
}

/*
import { useAuthContext } from "@/stores/auth.store.ts";
import { SplashScreen } from "expo-router";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuthContext();

  if (!isLoading) {
    SplashScreen.hideAsync();
  }

  return null;
}

*/
