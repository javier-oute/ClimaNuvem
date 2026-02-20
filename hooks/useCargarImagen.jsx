import * as ImagePicker from "expo-image-picker";

export default async function CargarImagen() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (result.canceled) return null;
  console.log(result.assets[0]);
  return result.assets[0];
}

/*
// ACCEDER A LA GALERÍA SIN PERMISOS
import * as ImagePicker from "expo-image-picker";

export default async function CargarImagen() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (result.canceled) return null;
  console.log(result.assets[0]);
  return result.assets[0];
}

// ACCEDER A LA GALERÍA CON PERMISOS
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export default function useCargarImagen() {
  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const cargarImagen = async () => {
    console.log("perm: ", permission);
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        if (res.canAskAgain === false) {
          Alert.alert(
            "Permiso de galería",
            "Activa la galería en Ajustes para poder cargar fotos.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Abrir Ajustes", onPress: () => Linking.openSettings() },
            ],
          );
        }
        return null;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) return null;
    console.log(result.assets[0]);
    return result.assets[0];
  };

  return { cargarImagen, permission };
}


// POSIBLE IDEA
import * as ImagePicker from "expo-image-picker";
import { useRef } from "react";

export default function useCargarImagen() {
  const [permission, requestPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const askedOnceRef = useRef(false);

  const cargarImagen = async () => {
    // Pedir permiso solo la primera vez que el usuario pulsa
    if (!askedOnceRef.current) {
      askedOnceRef.current = true;

      // Solo pedimos si NO está concedido (o aún no sabemos)
      if (!permission?.granted) {
        await requestPermission();
        // Nota: aunque lo deniegue, seguimos y abrimos el picker igual
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) return null;
    return result.assets[0];
  };

  return { cargarImagen, permission };
}



*/
