import { useAuthStore } from "@/stores/auth.store";
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
// Corte seco (sin cross-fade): como el overlay es pixel-idéntico y está QUIETO a escala 1.0
// durante el relevo, un cut es invisible y evita la ventana de solape (fantasma) del fade.
try {
  SplashScreen.setOptions({ fade: false });
} catch {
  // setOptions no disponible en versiones antiguas: no es bloqueante.
}

// Imagen del overlay = MISMA que la splash nativa de cada plataforma, para que el relevo
// nativa → overlay sea pixel-idéntico (mismo dibujo, mismo tamaño, centrado).
//   · iOS: lockup completo (nube + "ClimaNuvem").
//   · Android: SOLO la nube (sin texto). En Android 12+ la splash nativa es un "icono" a tamaño
//     fijo pequeño; un wordmark ahí se reescala y sale aliased ("entrecortado"). Por eso el icono
//     nativo y este overlay usan la nube sola y el texto se reserva para dentro de la app.
// Todas son PNG cuadradas → "ajustar por ancho" y "por alto" coinciden, así que el relevo encaja
// independientemente de cómo expo-splash-screen interprete `contain`.
const isAndroid = Platform.OS === "android";
const LOCKUP_LIGHT = isAndroid
  ? require("../assets/images/splash-icon.png")
  : require("../assets/images/splash-square.png");
const LOCKUP_DARK = isAndroid
  ? require("../assets/images/splash-icon-dark.png")
  : require("../assets/images/splash-dark-square.png");
const LOCKUP_RATIO = 1; // PNG cuadrado (lockup 1080x1080 / icono 1024x1024)

// El logo arranca EXACTAMENTE como la splash nativa (escala 1.0, mismo tamaño y centrado)
// para que el relevo nativa → overlay sea invisible, y a partir de ahí hace un "push-in"
// continuo que acelera hacia afuera (zoom-through) al dar paso a la app.
const SCALE_START = 1.0; // idéntico a la splash nativa (sin salto)
const SCALE_HOLD = 1.15; // crecimiento suave mientras se ve
const SCALE_EXIT = 1.5; // zoom-through final (entrar en la app)

const START_DELAY_MS = 220; // breve pausa quieto a 1.0 tras el relevo, antes de arrancar el zoom
const GROW_MS = 1000; // push-in (más rápido que antes), con arranque suave (easing inOut)
const MIN_VISIBLE_MS = 1000; // tiempo mínimo en pantalla antes de poder salir
const MAX_WAIT_MS = 2500; // tope: una red lenta no deja al usuario mirando el logo
const EXIT_MS = 650;

// IMPORTANTE: LOGO_WIDTH debe coincidir con imageWidth de la splash nativa (app.json) para
// que la escala 1.0 sea pixel-idéntica al relevo.
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
  // true cuando la splash nativa ya se ha ocultado (relevo completado). El zoom NO arranca
  // hasta entonces, para que el overlay permanezca pixel-idéntico a la nativa durante el relevo.
  const [handedOff, setHandedOff] = useState(false);

  // Contenedor arranca OPACO (relevo sin parpadeo). El logo arranca a escala 1.0 (idéntico
  // a la splash nativa) y crece de forma continua.
  const opacity = useSharedValue(1);
  const scale = useSharedValue(SCALE_START);

  // Push-in: arranca SOLO tras el relevo (handedOff), desde el tamaño exacto de la splash
  // nativa. Una breve pausa quieto a 1.0 (START_DELAY_MS) + arranque suave (easing inOut, que
  // acelera de forma gradual en vez de salir a tope) evitan la sensación de tirón al empezar.
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

  // Salida: cuando (sesión lista Y mínimo cumplido) o se agota el tope. El zoom CONTINÚA
  // creciendo (misma dirección) mientras se desvanece → transición suave, sin tirón.
  const hide = useCallback(() => setVisible(false), []);
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

  // Ocultar la splash nativa SOLO cuando la imagen del overlay ya está pintada (onLoadEnd) y
  // tras un doble requestAnimationFrame (frame ya volcado a pantalla). Así no hay hueco entre
  // que la nativa desaparece y el overlay se ve → sin pantallazo blanco.
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
