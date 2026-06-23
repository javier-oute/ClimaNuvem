import { BotonCargarImagen, BotonTomarFoto } from "@/components/buttons";
import { FloatingHeaderButton } from "@/components/floating-header-button";
import { HelpIcon, UserIcon } from "@/components/icons";
import DemoVideo from "@/components/videoComponent";
import { useT } from "@/lib/i18n";
import { promptOnboarding } from "@/lib/onboarding";
import { useAuthStore } from "@/stores/auth.store";
import { useSettingsStore } from "@/stores/settings.store";
import { useUiStore } from "@/stores/ui.store";
import { router, Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import "../../../global.css";

export default function Index() {
  const t = useT();
  const { colorScheme } = useColorScheme();
  const session = useAuthStore((s) => s.session);

  // Aviso de bienvenida: se muestra UNA sola vez por dispositivo (la primera vez que se llega a la
  // home, como invitado o con cuenta). Condiciones para no romper la experiencia:
  //   1) el splash ya ha desaparecido (un Alert nativo se dibuja por encima del overlay del splash),
  //   2) el store persistido (AsyncStorage) ya está hidratado (no leer el flag por defecto),
  //   3) aún no se ha visto (hasSeenOnboarding === false).
  // El ref evita que se lance dos veces si la home se re-monta o re-renderiza.
  const onboardingShown = useRef(false);
  // Ref con el `t` actual: permite usar el idioma vigente sin meter `t` (que cambia en cada render)
  // en las deps del efecto, evitando re-suscripciones innecesarias.
  const tRef = useRef(t);
  tRef.current = t;
  useEffect(() => {
    const tryShow = () => {
      if (onboardingShown.current) return;
      if (!useUiStore.getState().splashDone) return;
      if (!useSettingsStore.persist.hasHydrated()) return;
      if (useSettingsStore.getState().hasSeenOnboarding) return;
      onboardingShown.current = true;
      useSettingsStore.getState().setOnboardingSeen(); // marcar al MOSTRARSE (no reaparece)
      promptOnboarding({ t: tRef.current, onHelp: () => router.push("/help") });
    };

    tryShow(); // por si las tres condiciones ya se cumplen al montar
    const unsubSplash = useUiStore.subscribe(tryShow);
    const unsubHydrate = useSettingsStore.persist.onFinishHydration(tryShow);
    return () => {
      unsubSplash();
      unsubHydrate?.();
    };
  }, []);

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
