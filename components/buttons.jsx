import { useT } from "@/lib/i18n";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import CargarImagen from "../hooks/useCargarImagen";
import useTomarFoto from "../hooks/useTomarFoto";
import { useSavePhoto, useSaveSupabasePhoto } from "../lib/savePhotos";
import { FloatingHeaderButton } from "./floating-header-button";
import { DownloadIcon, IconoCamera, IconoImage, SaveIcon } from "./icons";

export function BotonTomarFoto() {
  const t = useT();
  const { abrirCamara } = useTomarFoto();

  const onPress = useCallback(async () => {
    try {
      const foto = await abrirCamara();
      if (!foto) return;

      // Navegamos YA, sin esperar al GPS (antes se hacía `await
      // tryGetCoordsAndPlace()` aquí y bloqueaba la transición varios segundos
      // dejando la Home congelada). La ubicación se resuelve dentro de
      // forecast-screen sin bloquear la pantalla de carga.
      router.push({
        pathname: "/forecast-screen",
        params: {
          imageUri: foto.uri,
          source: "camera",
          lat: "",
          lon: "",
          placeNameAuto: "",
        },
      });
    } catch (e) {
      console.error("Error al tomar la foto:", e);
    }
  }, [abrirCamara]);

  return (
    <Pressable
      onPress={onPress}
      className="flex flex-row items-center justify-between w-60 rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full">
        <IconoCamera />
      </View>
      <View>
        <Text className="text-lg font-semibold text-white">
          {t("buttons.takePhoto")}
        </Text>
      </View>
    </Pressable>
  );
}

export function SaveButton({ onSave, isSaving }) {
  const t = useT();
  return (
    <Pressable
      onPress={onSave}
      className="flex-1 flex-row items-center justify-between rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <SaveIcon />
      <Text className="text-base font-semibold text-white">
        {isSaving ? t("buttons.saving") : t("buttons.save")}
      </Text>
    </Pressable>
  );
}

// `floating`: en Android se renderiza como botón flotante circular (el header
// transparente nativo no recibe toques en Android). En iOS se usa la versión
// normal dentro de headerRight.
export function DownloadPhotoButton({ uri, color, floating = false }) {
  const { saveCameraPhoto } = useSavePhoto();

  const handleDownload = useCallback(async () => {
    try {
      await saveCameraPhoto(uri);
    } catch (e) {
      console.error("Error al guardar la foto:", e);
    }
  }, [uri, saveCameraPhoto]);

  if (floating) {
    return (
      <FloatingHeaderButton side="right" onPress={handleDownload}>
        <DownloadIcon color={color} />
      </FloatingHeaderButton>
    );
  }

  return (
    <Pressable
      onPress={handleDownload}
      className="flex p-2 items-center justify-center"
    >
      <DownloadIcon color={color} />
    </Pressable>
  );
}

export function DownloadSupabaseImageButton({ uri, color, floating = false }) {
  const { saveSupabasePhoto } = useSaveSupabasePhoto();

  const handleDownload = useCallback(async () => {
    try {
      await saveSupabasePhoto(uri);
    } catch (e) {
      console.error("Error al guardar la foto:", e);
    }
  }, [uri, saveSupabasePhoto]);

  if (floating) {
    return (
      <FloatingHeaderButton
        side="right"
        onPress={handleDownload}
        disabled={!uri}
      >
        <DownloadIcon color={color} />
      </FloatingHeaderButton>
    );
  }

  return (
    <Pressable
      onPress={handleDownload}
      disabled={!uri}
      className="flex p-2 items-center justify-center"
    >
      <DownloadIcon color={color} />
    </Pressable>
  );
}

export function BotonCargarImagen() {
  const t = useT();

  const onPress = useCallback(async () => {
    try {
      const imagen = await CargarImagen();
      if (!imagen) return;

      router.push({
        pathname: "/forecast-screen",
        params: {
          imageUri: imagen.uri,
          source: "gallery",
          lat: "",
          lon: "",
          placeNameAuto: "",
        },
      });
    } catch (e) {
      console.error("Error al cargar imagen:", e);
    }
  }, []);

  return (
    <Pressable
      onPress={onPress}
      className="flex flex-row items-center justify-between w-60 rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full">
        <IconoImage />
      </View>
      <View>
        <Text className="text-lg font-semibold text-white">
          {t("buttons.loadImage")}
        </Text>
      </View>
    </Pressable>
  );
}
