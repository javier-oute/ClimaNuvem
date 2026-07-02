import { useAuthStore } from "@/stores/auth.store";
import { useUiStore } from "@/stores/ui.store";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";

// Mantener la splash NATIVA visible hasta que el overlay tome el relevo (evita parpadeo).
SplashScreen.preventAutoHideAsync().catch(() => {});
// Corte seco (sin cross-fade): con el overlay pixel-idéntico y quieto, el cut es invisible y evita el fantasma del fade.
try {
  SplashScreen.setOptions({ fade: false });
} catch {
  // setOptions no disponible en versiones antiguas: no es bloqueante.
}

// Imagen del overlay = la misma splash nativa (iOS lockup completo, Android solo la nube), para un relevo pixel-idéntico.
const isAndroid = Platform.OS === "android";
const LOCKUP_LIGHT = isAndroid
  ? require("../assets/images/splash-icon.png")
  : require("../assets/images/splash-square.png");
const LOCKUP_DARK = isAndroid
  ? require("../assets/images/splash-icon-dark.png")
  : require("../assets/images/splash-dark-square.png");
const LOCKUP_RATIO = 1; // PNG cuadrado (lockup 1080x1080 / icono 1024x1024)

// El logo arranca como la splash nativa (escala 1.0) y hace un push-in continuo que acelera al dar paso a la app.
const SCALE_START = 1.0; // idéntico a la splash nativa (sin salto)
const SCALE_HOLD = 1.15; // crecimiento suave mientras se ve
const SCALE_EXIT = 1.5; // zoom-through final (entrar en la app)

const START_DELAY_MS = 220; // breve pausa quieto a 1.0 tras el relevo, antes de arrancar el zoom
const GROW_MS = 1000; // push-in (más rápido que antes), con arranque suave (easing inOut)
const MIN_VISIBLE_MS = 1000; // tiempo mínimo en pantalla antes de poder salir
const MAX_WAIT_MS = 2500; // tope: una red lenta no deja al usuario mirando el logo
const EXIT_MS = 650;

// IMPORTANTE: LOGO_WIDTH debe coincidir con imageWidth de la splash nativa (app.json) para que la escala 1.0 sea pixel-idéntica.
const LOGO_WIDTH = 200;

const BG_LIGHT = "#ffffff";
const BG_DARK = "#18181b";

// Overlay React que replica la splash nativa con zoom-in + fade-out; sobre toda la app, se desmonta al resolver la sesión.
export default function AnimatedSplash() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const session = useAuthStore((s) => s.session);
  const ready = session !== undefined;

  const [visible, setVisible] = useState(true);
  const [minElapsed, setMinElapsed] = useState(false);
  const [capReached, setCapReached] = useState(false);
  // true cuando la splash nativa ya se ocultó (relevo completado); el zoom no arranca hasta entonces.
  const [handedOff, setHandedOff] = useState(false);

  // Contenedor arranca opaco y el logo a escala 1.0 (idéntico a la splash nativa), y crece de forma continua.
  const opacity = useSharedValue(1);
  const scale = useSharedValue(SCALE_START);

  // Push-in: arranca solo tras el relevo, con una breve pausa y arranque suave para evitar el tirón.
  useEffect(() => {
    if (!handedOff) return;
    scale.value = withDelay(
      START_DELAY_MS,
      withTiming(SCALE_HOLD, {
        duration: GROW_MS,
        easing: Easing.inOut(Easing.quad),
      }),
    );
  }, [handedOff, scale]);

  // Tiempo mínimo en pantalla y tope de seguridad.
  useEffect(() => {
    const min = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    const cap = setTimeout(() => setCapReached(true), MAX_WAIT_MS);
    return () => {
      clearTimeout(min);
      clearTimeout(cap);
    };
  }, []);

  // Salida: con la sesión lista y el mínimo cumplido (o al tope), el zoom sigue creciendo mientras se desvanece.
  const hide = useCallback(() => {
    setVisible(false);
    // Señal para que el onboarding de la home no lance su Alert hasta que el splash desaparezca.
    useUiStore.getState().setSplashDone();
  }, []);
  useEffect(() => {
    const shouldExit = (ready && minElapsed) || capReached;
    if (!shouldExit) return;
    // Zoom-through: el logo sigue creciendo (acelerando) mientras se desvanece → "entrar" en la app.
    scale.value = withTiming(SCALE_EXIT, {
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(hide)();
      },
    );
  }, [ready, minElapsed, capReached, opacity, scale, hide]);

  // Oculta la splash nativa solo cuando el overlay ya está pintado (onLoadEnd + doble rAF), sin pantallazo blanco.
  const hideNative = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        SplashScreen.hideAsync()
          .catch(() => {})
          // Solo al completar el ocultado de la nativa damos paso al zoom (handedOff).
          .finally(() => setHandedOff(true));
      });
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
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
        onLoadEnd={hideNative}
        fadeDuration={0}
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
