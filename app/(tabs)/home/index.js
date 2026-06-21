import { BotonCargarImagen, BotonTomarFoto } from "@/components/buttons";
import { FloatingHeaderButton } from "@/components/floating-header-button";
import { HelpIcon, UserIcon } from "@/components/icons";
import DemoVideo from "@/components/videoComponent";
import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth.store";
import { makeRedirectUri } from "expo-auth-session";
import { router, Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { Platform, Pressable, Text, View } from "react-native";
import "../../../global.css";

export default function Index() {
  const t = useT();
  const { colorScheme } = useColorScheme();
  const session = useAuthStore((s) => s.session);

  const redirectTo = makeRedirectUri({ useProxy: true });
  console.log("REDIRECT:", redirectTo);
  return (
    <View className="flex-1 flex-grow justify-end bg-white dark:bg-zinc-900">
      <Stack.Screen
        options={{
          // En Android quitamos el header nativo (intercepta toques y pinta
          // sombra/fondo fantasma); los botones se dibujan flotantes (más abajo).
          // En iOS se mantiene el header nativo transparente con sus botones.
          headerShown: Platform.OS === "ios",
          headerTransparent: true,
          headerTitle: "",
          headerBackTitle: "",
          // iOS: botón de perfil (solo invitado) y de ayuda en el header nativo.
          headerLeft:
            Platform.OS === "ios" && session === null
              ? () => (
                  <Pressable
                    onPress={() => router.replace("/(auth)/login")}
                    hitSlop={10}
                    className="p-2"
                  >
                    <UserIcon
                      color={colorScheme === "dark" ? "white" : "black"}
                      size={24}
                    />
                  </Pressable>
                )
              : undefined,
          headerRight:
            Platform.OS === "ios"
              ? () => (
                  <Pressable
                    onPress={() => router.push("/help")}
                    hitSlop={10}
                    className="p-2"
                  >
                    <HelpIcon
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  </Pressable>
                )
              : undefined,
        }}
      />
      <DemoVideo />
      {/* Android (sin header nativo): botones de cabecera flotantes
          (icono blanco con sombra). */}
      {Platform.OS === "android" && (
        <>
          <FloatingHeaderButton
            side="right"
            onPress={() => router.push("/help")}
          >
            <HelpIcon color="white" />
          </FloatingHeaderButton>
          {session === null ? (
            <FloatingHeaderButton
              side="left"
              onPress={() => router.replace("/(auth)/login")}
            >
              <UserIcon color="white" size={24} />
            </FloatingHeaderButton>
          ) : null}
        </>
      )}
      <View
        className={`bg-white dark:bg-zinc-900 rounded-t-3xl text-balance ${
          Platform.OS === "ios" ? "pb-20" : "pb-0"
        }`}
      >
        <View className="pt-8 pb-12 px-8 gap-3">
          <Text className="font-bold text-3xl text-slate-900 dark:text-zinc-100">
            {t("home.title")}
          </Text>
          <Text className="font-normal text-lg text-slate-600 dark:text-zinc-400">
            {t("home.subtitle")}
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
        source={require("../../../assets/images/fondo-nubes-1.avif")}
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




 */
