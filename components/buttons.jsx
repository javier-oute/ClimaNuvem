import { useT } from "@/lib/i18n";
import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import CargarImagen from "../hooks/useCargarImagen";
import useTomarFoto from "../hooks/useTomarFoto";
import { tryGetCoordsAndPlace } from "../lib/location";
import { useSavePhoto, useSaveSupabasePhoto } from "../lib/savePhotos";
import { DownloadIcon, IconoCamera, IconoImage, SaveIcon } from "./icons";

export function BotonTomarFoto() {
  const t = useT();
  const { abrirCamara } = useTomarFoto();

  const onPress = useCallback(async () => {
    try {
      const foto = await abrirCamara();
      if (!foto) return;

      const loc = await tryGetCoordsAndPlace();

      router.push({
        pathname: "/forecast-screen",
        params: {
          imageUri: foto.uri,
          source: "camera",
          lat: loc ? String(loc.coords.latitude) : "",
          lon: loc ? String(loc.coords.longitude) : "",
          placeNameAuto: loc?.placeNameAuto ?? "",
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

export function DownloadPhotoButton({ uri, color }) {
  const { saveCameraPhoto } = useSavePhoto();

  const handleDownload = useCallback(async () => {
    try {
      await saveCameraPhoto(uri);
    } catch (e) {
      console.error("Error al guardar la foto:", e);
    }
  }, [uri, saveCameraPhoto]);

  return (
    <Pressable
      onPress={handleDownload}
      className="flex p-2 items-center justify-center"
    >
      <DownloadIcon color={color} />
    </Pressable>
  );
}

export function DownloadSupabaseImageButton({ uri, color }) {
  const { saveSupabasePhoto } = useSaveSupabasePhoto();

  const handleDownload = useCallback(async () => {
    try {
      await saveSupabasePhoto(uri);
    } catch (e) {
      console.error("Error al guardar la foto:", e);
    }
  }, [uri, saveSupabasePhoto]);

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

/* 

          await saveForecastWithPhoto({
            asset: foto, // el asset que devuelve abrirCamara()
            name: "eyou",
            forecast: "choiva",
            probability: 0.8,
          });

*/

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
/*
export function BotonTomarFoto() {
  const { abrirCamara } = useTomarFoto();
  const [photo, setPhoto] = useState(null);

  return (
    <Pressable
      onPress={() => {
        abrirCamara().then(async (foto) => {
          if (foto) {
            console.log("foto tomada: ", foto);
          }
          await saveForecastWithPhoto({
            asset: foto, // el asset que devuelve abrirCamara()
            name: "eyou",
            forecast: "choiva",
            probability: 0.8,
          });
        });
      }}
      className="flex flex-row items-center justify-between w-64 rounded-3xl bg-black px-6 py-4 shadow-sm active:opacity-75"
    >
      <View>
        <Text className="text-lg font-semibold text-white">Tomar foto</Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
        <IconoCamera />
      </View>
    </Pressable>
  );
}

export function BotonCargarImagen() {
  return (
    <Pressable
      onPress={() => {
        CargarImagen().then((imagen) => {
          if (imagen) {
            console.log("imagen cargada: ", imagen);
          }
        });
      }}
      className="flex flex-row items-center justify-between w-64 rounded-3xl bg-black px-6 py-4 shadow-sm active:opacity-75"
    >
      <View>
        <Text className="text-lg font-semibold text-white">Cargar imagen</Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
        <IconoImage />
      </View>
    </Pressable>
  );
}
*/
