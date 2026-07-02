import { t } from "@/lib/i18n";
import { alertPermissionBlocked } from "@/lib/permissions";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const PICK_OPTIONS = {
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
};

// Redimensiona la imagen a 512×512 JPEG (avatar uniforme y ligero); no sube nada (guardado diferido).
async function processToAvatar(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 512, height: 512 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export default function usePickAvatar() {
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const pickFromCamera = async () => {
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
        return null;
      }
    }

    const result = await ImagePicker.launchCameraAsync(PICK_OPTIONS);
    if (result.canceled) return null;

    return processToAvatar(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      ...PICK_OPTIONS,
    });
    if (result.canceled) return null;

    return processToAvatar(result.assets[0].uri);
  };

  return { pickFromCamera, pickFromGallery, permission };
}
