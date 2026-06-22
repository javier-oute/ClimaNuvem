import { t } from "@/lib/i18n";
import { alertPermissionBlocked } from "@/lib/permissions";
import { Directory, File, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useCallback } from "react";
import { Alert } from "react-native";

const ALBUM_NAME = "ClimaNuvem";

// Devuelve el resultado del permiso (no solo bool) para poder leer canAskAgain.
async function ensureMediaPermission(permission, requestPermission) {
  if (permission?.granted) return { granted: true };
  return await requestPermission(); // { granted, canAskAgain, ... }
}

// Maneja la denegación del permiso de fotos siguiendo el mismo patrón que la cámara
// (hooks/useTomarFoto.jsx): denegación temporal → silencioso (el SO ya mostró su diálogo);
// denegación permanente (canAskAgain === false) → aviso con ruta a Ajustes.
function handleMediaPermissionDenied(res) {
  if (res.canAskAgain === false) {
    alertPermissionBlocked({
      t,
      title: t("permissions.photosTitle"),
      message: t("permissions.photosMsg"),
    });
  }
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
          Alert.alert(t("save.noImageTitle"), t("save.noImageMsg"));
          return;
        }

        const res = await ensureMediaPermission(permission, requestPermission);
        if (!res.granted) {
          handleMediaPermissionDenied(res);
          return false;
        }

        const asset = await MediaLibrary.createAssetAsync(uri);
        await saveAssetToAlbum(asset);

        Alert.alert(t("save.successTitle"), t("save.successMsg"));
      } catch (e) {
        Alert.alert(t("save.error"), e?.message ?? "Error");
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
          Alert.alert(t("save.noImageTitle"), t("save.noImageMsg"));
          return false;
        }

        const res = await ensureMediaPermission(permission, requestPermission);
        if (!res.granted) {
          handleMediaPermissionDenied(res);
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

        Alert.alert(t("save.successTitle"), t("save.successMsg"));
        return true;
      } catch (e) {
        Alert.alert(t("save.error"), e?.message ?? "Error");
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
