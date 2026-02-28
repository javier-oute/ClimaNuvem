import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useCallback } from "react";
import { Alert } from "react-native";

const ALBUM_NAME = "ClimaNuvem";

async function ensurePermission(permission, requestPermission) {
  if (permission?.granted) return true;
  const res = await requestPermission();
  return !!res.granted;
}

async function saveAssetToAlbum(asset) {
  const album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);

  if (!album) {
    await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset, false);
  } else {
    await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  }
}

export function useSavePhoto() {
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  const saveCameraPhoto = useCallback(
    async (uri) => {
      try {
        if (!uri) {
          Alert.alert("Sin imagen", "No hay foto para guardar.");
          return;
        }

        const ok = await ensurePermission(permission, requestPermission);
        if (!ok) {
          Alert.alert(
            "Permiso necesario",
            "Necesito permiso para guardar fotos.",
          );
          return false;
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await saveAssetToAlbum(asset);

        Alert.alert("Guardada ✅", "La foto se guardó en tu galería.");
      } catch (e) {
        Alert.alert("No se pudo guardar", e?.message ?? "Error");
      }
    },
    [permission, requestPermission],
  );

  return { saveCameraPhoto, permission };
}

export function useSaveSupabasePhoto() {
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  const saveSupabasePhoto = useCallback(
    async (signedUri) => {
      try {
        if (!signedUri) {
          Alert.alert("Sin imagen", "No hay imagen para guardar.");
          return false;
        }

        const ok = await ensurePermission(permission, requestPermission);
        if (!ok) {
          Alert.alert(
            "Permiso necesario",
            "Necesito permiso para guardar fotos.",
          );
          return false;
        }

        const dir = new Directory(Paths.cache, "downloads");
        if (!dir.exists) dir.create();

        const dest = new File(
          Paths.cache,
          "downloads",
          `climan-${Date.now()}.jpg`,
        );

        const file = await File.downloadFileAsync(signedUri, dest);

        const asset = await MediaLibrary.createAssetAsync(file?.uri);
        await saveAssetToAlbum(asset);

        Alert.alert("Guardada ✅", "La foto se guardó en tu galería.");
        return true;
      } catch (e) {
        Alert.alert("No se pudo guardar", e?.message ?? "Error");
        return false;
      }
    },
    [permission, requestPermission],
  );

  return { saveSupabasePhoto, permission };
}

/*
  if (Platform.OS === "web") {
    // En web, la “galería” no existe: lo más parecido es descargar
    downloadUriOnWeb(uri, `climan-camera-${Date.now()}.jpg`);
    return;
  }

  function downloadUriOnWeb(uri, filename) {
  const a = document.createElement("a");
  a.href = uri; // puede ser blob: o data:
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
*/
