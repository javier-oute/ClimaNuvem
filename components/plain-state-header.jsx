import { router, Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { Platform } from "react-native";
import { FloatingHeaderButton } from "./floating-header-button";
import { BackIcon } from "./icons";

// Cabecera de los estados de fondo sólido (cargando/no encontrado): en Android oculta el header nativo y dibuja el botón atrás flotante; en iOS mantiene el transparente.
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
