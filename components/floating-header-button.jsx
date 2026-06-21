import { useColorScheme } from "nativewind";
import { cloneElement, isValidElement } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Botón de cabecera FLOTANTE para Android.
 *
 * En Android quitamos el header nativo (intercepta el toque y pinta sombra/
 * fondo fantasma); estos botones se dibujan como overlay absoluto -> reciben el
 * toque y controlamos el aspecto. En iOS NO se usa (se mantiene el header nativo
 * transparente intacto).
 *
 * Aspecto: círculo translúcido con el icono dentro, que sigue el tema de la app:
 *   · claro  -> icono negro + círculo blanco translúcido
 *   · oscuro -> icono blanco + círculo oscuro translúcido
 * El color del icono lo inyecta este componente (ignora el `color` del hijo), de
 * modo que todos los botones flotantes cambian de color con el tema desde un
 * único sitio. El icono pasado como `children` debe aceptar la prop `color`.
 */
const ICON_LIGHT = "#111827"; // negro suave (tema claro)
const ICON_DARK = "#ffffff"; // blanco (tema oscuro)
const CIRCLE_LIGHT = "rgba(255, 255, 255, 0.6)"; // blanco translúcido
const CIRCLE_DARK = "rgba(24, 24, 27, 0.55)"; // zinc-900 translúcido

export function FloatingHeaderButton({
  onPress,
  disabled = false,
  side = "right",
  children,
}) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const icon = isValidElement(children)
    ? cloneElement(children, { color: isDark ? ICON_DARK : ICON_LIGHT })
    : children;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={12}
      style={{
        position: "absolute",
        top: insets.top + 6,
        [side]: 8,
        backgroundColor: isDark ? CIRCLE_DARK : CIRCLE_LIGHT,
        zIndex: 50,
      }}
      className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
    >
      {icon}
    </Pressable>
  );
}
