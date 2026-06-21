import { router, Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { Platform } from "react-native";
import { FloatingHeaderButton } from "./floating-header-button";
import { BackIcon } from "./icons";

/**
 * Cabecera para los estados de fondo sólido (cargando / no encontrado) de las
 * pantallas de detalle.
 *
 * En Android oculta el header nativo (si no, mientras carga se ve el botón de
 * atrás NEGRO nativo, que luego salta a los botones flotantes del estado
 * cargado) y dibuja el botón de atrás flotante. Como aún no hay imagen de fondo
 * (el fondo es blanco/oscuro), el icono se pinta según el tema, no en blanco.
 *
 * En iOS mantiene el header nativo transparente, igual que el resto de estados.
 */
export function PlainStateHeader() {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: Platform.OS === "ios",
          headerTransparent: true,
          headerTitle: "",
        }}
      />
      {Platform.OS === "android" ? (
        <FloatingHeaderButton side="left" onPress={() => router.back()}>
          <BackIcon color={colorScheme === "dark" ? "white" : "black"} />
        </FloatingHeaderButton>
      ) : null}
    </>
  );
}
