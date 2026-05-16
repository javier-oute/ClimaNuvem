import { t } from "@/lib/i18n";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export default function useTomarFoto() {
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const abrirCamara = async () => {
    console.log("perm: ", permission);

    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        if (res.canAskAgain === false) {
          Alert.alert(t("camera.permissionTitle"), t("camera.permissionMsg"), [
            { text: t("camera.cancel"), style: "cancel" },
            {
              text: t("camera.openSettings"),
              onPress: () => Linking.openSettings(),
            },
          ]);
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

    console.log(result.assets[0]);
    return result.assets[0];
  };

  return { abrirCamara, permission };
}
