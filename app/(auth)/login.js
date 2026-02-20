import * as AppleAuthentication from "expo-apple-authentication";
import { Image, Text, View } from "react-native";
import AppleSignInButton from "../../components/social-auth-buttons/apple/apple-sign-in-button";
import GuestButton from "../../components/social-auth-buttons/apple/guest-button";
//import DemoVideo from "../../components/videoComponent";

export default function LoginScreen() {
  const appleProps = {
    buttonType: AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN,
    buttonStyle: AppleAuthentication.AppleAuthenticationButtonStyle.BLACK,
    cornerRadius: 6,
    style: { width: 200, height: 44 }, // w: 200 h: 44
  };

  return (
    <View className="flex-1 justify-start bg-white">
      <View className="pt-24">
        <Image
          source={require("@/assets/images/logo_nube_v1.0.jpg")}
          style={{ width: 120, height: 120, alignSelf: "center" }}
          resizeMode="contain"
        />
        <View className="p-8 mt-4 gap-3">
          <Text className="font-bold text-3xl text-center">
            ¡Bienvenido a ClimaNuvem!
          </Text>
          <Text className="font-normal text-lg text-center ">
            Inicia sesión para guardar tus predicciones y acceder a funciones
            exclusivas
          </Text>
        </View>
        <View className="items-center pt-8 gap-8">
          <AppleSignInButton {...appleProps} />
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
