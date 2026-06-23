import * as ImagePicker from "expo-image-picker";

export default async function CargarImagen() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (result.canceled) return null;
  return result.assets[0];
}
