import { Pressable, Text, View } from "react-native";
import CargarImagen from "../hooks/useCargarImagen";
import useTomarFoto from "../hooks/useTomarFoto";
import { IconoCamera, IconoImage } from "./icons";

export function BotonTomarFoto() {
  const { abrirCamara } = useTomarFoto();

  return (
    <Pressable
      onPress={() => {
        abrirCamara().then((foto) => {
          if (foto) {
            console.log("foto tomada: ", foto);
          }
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
/* 


*/
