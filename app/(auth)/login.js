import { useT } from "@/lib/i18n";
import { useAuthStore } from "@/stores/auth.store";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import AppleSignInButton from "../../components/social-auth-buttons/apple/apple-sign-in-button";
import GuestButton from "../../components/social-auth-buttons/apple/guest-button";
import GoogleSignInButton from "../../components/social-auth-buttons/google-sign-in-button";
//import DemoVideo from "../../components/videoComponent";

export default function LoginScreen() {
  const t = useT();
  const { colorScheme } = useColorScheme();

  const appleProps = {
    buttonType: AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
    buttonStyle: AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
    cornerRadius: 6,
    style: { width: 240, height: 44 }, // w: 240 h: 44 (mismo ancho que Google/Invitado)
  };

  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session) {
      console.log("Para home con session: ", session);
      router.replace("/(tabs)/home");
    }
  }, [session]);

  return (
    <View className="flex-1 justify-start bg-white dark:bg-zinc-900">
      <View className="pt-8">
        <Image
          // Logo según tema: en oscuro, el blanco que rodea nube+gota es el negro del
          // login (#18181b); la nube y la gota mantienen su color. En claro, sin cambios.
          source={
            colorScheme === "dark"
              ? require("@/assets/images/icon-login-dark.png")
              : require("@/assets/images/icon.png")
          }
          style={{ width: 200, height: 200, alignSelf: "center" }}
          resizeMode="contain"
        />
        <View className="p-8 mt-4 gap-3">
          <Text className="font-bold text-3xl text-center text-slate-900 dark:text-zinc-100">
            {t("login.title")}
          </Text>
          <Text className="font-normal text-lg text-center text-slate-600 dark:text-zinc-400">
            {t("login.subtitle")}
          </Text>
        </View>
        <View className="items-center pt-8 gap-8">
          <AppleSignInButton {...appleProps} />
          <GoogleSignInButton />
          <GuestButton />
        </View>
      </View>
    </View>
  );
}

/*
export default function LoginScreen() {
  const appleProps = {
    buttonType: AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
    buttonStyle: AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
    cornerRadius: 6,
    style: { width: 200, height: 44 }, // w: 200 h: 44
  };

  return (
    <View className="flex-1">
      <DemoVideo />
      <View className="flex-1 flex-grow justify-end">
        <View className=" bg-white rounded-t-3xl text-balance">
          <View className="pt-8 pl-8 pb-12 pr-8 gap-3">
            <Text className="font-bold text-3xl item">
              ¡Bienvenido a ClimaNuvem!
            </Text>
            <Text className="font-normal text-lg">
              Inicia sesión para guardar tus predicciones y acceder a funciones
              exclusivas
            </Text>
          </View>
          <View className="items-center pb-24 gap-8">
            <AppleSignInButton {...appleProps} />
            <GuestButton />
          </View>
        </View>
      </View>
    </View>
  );
}

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

    */
