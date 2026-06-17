import { useAuthStore } from "@/stores/auth.store";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";

// Mantener la splash NATIVA visible hasta que el overlay tome el relevo (evita parpadeo).
SplashScreen.preventAutoHideAsync().catch(() => {});

const MARK_LIGHT = require("../assets/images/splash-icon.png");
const MARK_DARK = require("../assets/images/splash-icon-dark.png");

// Tope máximo de espera para que una red lenta no deje al usuario mirando el logo.
const MAX_WAIT_MS = 2500;

/**
 * Overlay React que replica la splash nativa y hace la animación de zoom-in + fade.
 * Se monta sobre toda la app (incluido el login). Cuando la sesión está resuelta
 * (`session !== undefined`) o se agota el tope, se desvanece y se desmonta.
 */
export default function AnimatedSplash() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const session = useAuthStore((s) => s.session);
  const ready = session !== undefined;

  const [visible, setVisible] = useState(true);
  const [capReached, setCapReached] = useState(false);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.85);

  // Animación de entrada al montar.
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withTiming(1, { duration: 500 });
  }, [opacity, scale]);

  // Tope de seguridad.
  useEffect(() => {
    const id = setTimeout(() => setCapReached(true), MAX_WAIT_MS);
    return () => clearTimeout(id);
  }, []);

  // Cuando la app está lista (o se agota el tope), reproducir la salida y desmontar.
  const hide = useCallback(() => setVisible(false), []);
  useEffect(() => {
    if (!ready && !capReached) return;
    opacity.value = withTiming(0, { duration: 350 }, (finished) => {
      if (finished) runOnJS(hide)();
    });
    scale.value = withTiming(1.06, { duration: 350 });
  }, [ready, capReached, opacity, scale, hide]);

  // Ocultar la splash nativa en cuanto el overlay (idéntico) está pintado.
  const onLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      onLayout={onLayout}
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, containerStyle]}
      className="items-center justify-center bg-white dark:bg-[#1e2a44]"
    >
      <Animated.View style={logoStyle} className="items-center gap-5">
        <Image
          source={isDark ? MARK_DARK : MARK_LIGHT}
          style={{ width: 130, height: 130 }}
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-[#314468] dark:text-white">
          ClimaNuvem
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
