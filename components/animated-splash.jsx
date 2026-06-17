import { useAuthStore } from "@/stores/auth.store";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

// Mantener la splash NATIVA visible hasta que el overlay tome el relevo (evita parpadeo).
SplashScreen.preventAutoHideAsync().catch(() => {});

// Lockup completo (marca + "ClimaNuvem"). Es la MISMA imagen que la splash nativa
// (app.json), por lo que el relevo nativa → overlay es pixel-idéntico.
const LOCKUP_LIGHT = require("../assets/images/splash.png");
const LOCKUP_DARK = require("../assets/images/splash-dark.png");
const LOCKUP_RATIO = 1024 / 1079; // ancho / alto del PNG

// El zoom de entrada SIEMPRE se reproduce entero antes de salir, aunque la sesión cargue
// al instante. La salida solo se adelanta una vez superado el mínimo visible.
const ENTER_MS = 1000; // zoom-in lento y suave
const MIN_VISIBLE_MS = 1300; // entrada + pequeño hold
const MAX_WAIT_MS = 2500; // tope: una red lenta no deja al usuario mirando el logo
const EXIT_MS = 550;

// Curva suave (ease-out tipo "expo") para una entrada fluida.
const SMOOTH = Easing.bezier(0.22, 1, 0.36, 1);

const LOGO_WIDTH = 200;

const BG_LIGHT = "#ffffff";
const BG_DARK = "#1e2a44";

/**
 * Overlay React que replica la splash nativa (mismo lockup) y hace un zoom-in + fade-out
 * continuo (sin reversión, para que se sienta suave). Se monta sobre toda la app (incluido
 * el login) y se desmonta cuando la sesión está resuelta tras el mínimo visible, o al tope.
 */
export default function AnimatedSplash() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const session = useAuthStore((s) => s.session);
  const ready = session !== undefined;

  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const [capReached, setCapReached] = useState(false);

  // Contenedor arranca OPACO (relevo sin parpadeo). El logo escala de forma continua.
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.9);

  // Entrada: zoom-in lento. Se reproduce entero (MIN_VISIBLE_MS > ENTER_MS).
  useEffect(() => {
    scale.value = withTiming(1, { duration: ENTER_MS, easing: SMOOTH });
  }, [scale]);

  // Tiempo mínimo en pantalla y tope de seguridad.
  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const cap = setTimeout(() => setCapReached(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(cap);
    };
  }, []);

  // Salida: cuando (sesión lista Y mínimo cumplido) o se agota el tope. El zoom CONTINÚA
  // creciendo (misma dirección) mientras se desvanece → transición suave, sin tirón.
  const hide = useCallback(() => setVisible(false), []);
  useEffect(() => {
    const shouldExit = (ready && minElapsed) || capReached;
    if (!shouldExit) return;
    scale.value = withTiming(1.08, {
      duration: EXIT_MS,
      easing: Easing.inOut(Easing.ease),
    });
    opacity.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.inOut(Easing.ease) },
      (finished) => {
        if (finished) runOnJS(hide)();
      },
    );
  }, [ready, minElapsed, capReached, opacity, scale, hide]);

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
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        { backgroundColor: isDark ? BG_DARK : BG_LIGHT },
        containerStyle,
      ]}
    >
      <Animated.Image
        source={isDark ? LOCKUP_DARK : LOCKUP_LIGHT}
        resizeMode="contain"
        style={[
          { width: LOGO_WIDTH, height: LOGO_WIDTH / LOCKUP_RATIO },
          logoStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
});
