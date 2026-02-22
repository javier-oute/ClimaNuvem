import { saveForecastWithPhoto } from "@/stores/forecast.store";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import CargarImagen from "../hooks/useCargarImagen";
import useTomarFoto from "../hooks/useTomarFoto";
import { IconoCamera, IconoImage } from "./icons";

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
      className="flex flex-row items-center justify-between w-56 rounded-3xl bg-[#314468] px-6 py-4 shadow-sm active:opacity-75"
    >
      <View>
        <Text className="text-lg font-semibold text-white">Tomar foto</Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full">
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
      className="flex flex-row items-center justify-between w-56 rounded-3xl bg-[#b0aeaf] px-6 py-4 shadow-sm active:opacity-75"
    >
      <View>
        <Text className="text-lg font-semibold text-white">Cargar imagen</Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full">
        <IconoImage />
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
