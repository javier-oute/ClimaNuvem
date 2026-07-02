import { useColorScheme } from "nativewind";
import { cloneElement, isValidElement } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Botón de cabecera flotante para Android (overlay circular translúcido que sigue el tema); en iOS no se usa.
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
