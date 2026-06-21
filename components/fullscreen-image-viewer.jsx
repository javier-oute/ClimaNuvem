import { useT } from "@/lib/i18n";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { StatusBar } from "expo-status-bar";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseIcon, ExpandIcon } from "./icons";

/**
 * Pista "Toca para ampliar" (icono ⤢ + texto) centrada arriba sobre la foto de fondo.
 * Al pulsarla abre el visor a pantalla completa (mismo efecto que tocar la foto).
 *
 * En iOS estas pantallas mantienen un header nativo transparente (UINavigationBar) que
 * se monta POR ENCIMA del contenido y captura los toques de su franja (~44pt). Por eso
 * el botón se baja por debajo del header en iOS; el zIndex de RN no puede superar una
 * vista nativa del header. En Android no hay header nativo, así que va casi arriba.
 */
export function ImageZoomHint({ onPress }) {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={{
        position: "absolute",
        top: insets.top + (Platform.OS === "ios" ? 52 : 8),
        alignSelf: "center",
        zIndex: 50,
      }}
      className="flex-row items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 active:opacity-70"
    >
      <ExpandIcon size={13} color="rgba(255,255,255,0.9)" />
      <Text className="text-xs font-medium text-white/90">
        {t("buttons.tapToZoom")}
      </Text>
    </Pressable>
  );
}

/**
 * Visor de imagen a pantalla completa (zoom + desplazamiento).
 *
 * Se abre tocando la foto de fondo de una pantalla. Muestra la imagen ENTERA
 * (`contain`, sin recortar) sobre negro. Cerrar: botón ✕, un toque sobre la foto,
 * o el botón atrás de Android (`onRequestClose`).
 */
export function FullscreenImageViewer({ visible, uri, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* RN Modal crea otra jerarquía de vistas: los gestos necesitan su propio root. */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className="flex-1 bg-black">
          <StatusBar style="light" />
          {uri ? (
            <ImageZoom
              uri={uri}
              style={{ flex: 1 }}
              resizeMode="contain"
              minScale={1}
              maxScale={5}
              doubleTapScale={2.5}
              isDoubleTapEnabled
              isSingleTapEnabled
              onSingleTap={onClose}
            />
          ) : null}
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={{ position: "absolute", top: insets.top + 8, right: 16 }}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-70"
          >
            <CloseIcon color="white" />
          </Pressable>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
