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
          Alert.alert(
            "Permiso de cámara",
            "Activa la cámara en Ajustes para poder tomar fotos.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Abrir Ajustes", onPress: () => Linking.openSettings() },
            ],
          );
        }
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsMultipleSelection: false,
      quality: 1,
    });
    if (result.canceled) return;

    console.log(result.assets[0]);
    return result.assets[0];
  };

  return { abrirCamara, permission };
}
