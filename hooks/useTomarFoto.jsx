import { t } from "@/lib/i18n";
import { alertPermissionBlocked } from "@/lib/permissions";
import * as ImagePicker from "expo-image-picker";

export default function useTomarFoto() {
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const abrirCamara = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        if (res.canAskAgain === false) {
          alertPermissionBlocked({
            t,
            title: t("camera.permissionTitle"),
            message: t("camera.permissionMsg"),
          });
        }
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsMultipleSelection: false,
      quality: 1,
      exif: false,
    });
    if (result.canceled) return;

    return result.assets[0];
  };

  return { abrirCamara, permission };
}
