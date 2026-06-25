import { useColorScheme } from "nativewind";
import { Image, Pressable, Text, View } from "react-native";

// Estado genérico centrado (vacío / error / no encontrado) con marca ClimaNuvem.
// Reutilizable: logo opcional según tema (mismo par que el login, fondos que coinciden con
// bg-white / dark:bg-zinc-900), título, subtítulo y una acción opcional (p. ej. "Reintentar").
export function StateMessage({
  logo = false,
  title,
  subtitle,
  actionLabel,
  onAction,
  fill = true,
}) {
  const { colorScheme } = useColorScheme();

  return (
    <View
      className={
        fill ? "flex-1 items-center justify-center px-8" : "items-center"
      }
    >
      {logo ? (
        <Image
          source={
            colorScheme === "dark"
              ? require("@/assets/images/icon-login-dark.png")
              : require("@/assets/images/icon.png")
          }
          style={{ width: 128, height: 128, opacity: 0.85 }}
          resizeMode="contain"
        />
      ) : null}
      {title ? (
        <Text className="mt-4 text-center text-xl font-bold text-slate-900 dark:text-zinc-100">
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text className="mt-2 text-center text-base text-slate-500 dark:text-zinc-400">
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="mt-5 flex-row items-center justify-center rounded-3xl bg-[#314468] px-6 py-3 active:opacity-75"
        >
          <Text className="text-base font-semibold text-white">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
