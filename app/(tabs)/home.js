import { BotonCargarImagen, BotonTomarFoto } from "@/components/buttons";
import DemoVideo from "@/components/videoComponent";
import { Text, View } from "react-native";
import "../../global.css";

export default function Index() {
  return (
    <View className="flex-1 flex-grow justify-end bg-white">
      <DemoVideo />

      <View className=" bg-white rounded-t-3xl text-balance">
        <View className="pt-8 pl-8 pb-12 pr-8 gap-3">
          <Text className="font-bold text-3xl">Bienvenido a ClimaNuvem</Text>
          <Text className="font-normal text-lg">
            Saca una foto a las nubes que te preocupan y te daremos el
            pronóstico{" "}
          </Text>
        </View>
        <View className="items-center pb-12 gap-8">
          <BotonTomarFoto />
          <BotonCargarImagen />
        </View>
      </View>
    </View>
  );
}

/* 


export default function Index() {
  return (
    <View className="flex-1">
      <DemoVideo />
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-end"
      >
        <View className=" bg-white rounded-t-3xl text-balance">
          <View className="pt-8 pl-8 pb-12 pr-8 gap-3">
            <Text className="font-bold text-3xl">Bienvenido a ClimaNuvem</Text>
            <Text className="font-normal text-lg">
              Saca una foto a las nubes que te preocupan y te daremos el
              pronóstico{" "}
            </Text>
          </View>
          <View className="items-center pb-12 gap-8">
            <BotonTomarFoto />
            <BotonCargarImagen />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}



      <Image
        source={require("../../assets/images/fondo-nubes-1.avif")}
        className="w-full h-full absolute z-0"
        resizeMode="cover"
      />

            <Pressable className="flex flex-row items-center justify-between w-64 rounded-3xl bg-black px-6 py-4 shadow-sm active:opacity-75">
              <View>
                <Text className="text-lg font-semibold text-white">
                  Cargar imagen
                </Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                <IconoImage />
              </View>
            </Pressable>



            // Pressable inicial
            <Pressable className="flex flex-row gap-4 rounded-2xl bg-yellow-300 px-12 py-4 shadow-sm active:opacity-70">
              <Text className="font-semibold text-lg">Cargar imagen</Text>
              <IconoImage />
            </Pressable>



            <Pressable className="w-full max-w-xs flex-row items-center justify-between rounded-3xl bg-white/70 px-6 py-4 border border-white/50 shadow-sm active:opacity-90">
              <View className="gap-0.5">
                <Text className="text-lg font-semibold">Tomar foto</Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/15">
                <IconoCamera />
              </View>
            </Pressable>






        {({ pressed }) =>
          pressed ? (
            <Text className="font-semibold text-xl">Tomar foto</Text>
          ) : (
            <Text className="font-semibold text-xl">Tomar foto</Text>
          )
        }


          <Link href={`/${prueba.id}`} asChild>
            <Text className="mt-4 text-black underline">
              Go to Item Detail Page
            </Text>
          </Link>
          <Link href="/profile" className="mt-4 text-black underline">
            Go to Profile Page
          </Link>


 */
