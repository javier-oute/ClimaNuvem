import { router } from "expo-router";
import { Pressable, Text } from "react-native";

export default function GuestButton({
  href = "/(tabs)/home",
  label = "Entrar como invitado",
}) {
  return (
    <Pressable
      onPress={() => {
        router.replace(href);
      }}
      className={[
        "self-center flex-row items-center justify-center",
        "rounded-full border border-white bg-blue-900",
        "px-4 py-2",
      ].join(" ")}
    >
      <Text className="text-white text-sm font-semibold">{label}</Text>
    </Pressable>
  );
}

/*
export default function GuestButton({
  href = "/(tabs)/home",
  label = "Entrar como invitado",
  disabled = false,
}) {
  const [isBusy, setIsBusy] = useState(false);

  const onPress = () => {
    if (disabled || isBusy) return;

    setIsBusy(true);

    // Si quieres marcar “modo invitado” en Zustand, este es el sitio.
    // useAuthStore.getState().setGuest(true)

    router.replace(href);

    // Evita doble tap durante un instante
    setTimeout(() => setIsBusy(false), 250);
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isBusy}
      className={[
        "self-center flex-row items-center justify-center",
        "rounded-full border border-white/40 bg-black/25",
        "px-4 py-2",
        disabled || isBusy ? "opacity-60" : "opacity-100",
      ].join(" ")}
      android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: true }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {isBusy ? (
        <ActivityIndicator />
      ) : (
        <Text className="text-white/90 text-sm font-semibold">{label}</Text>
      )}
    </Pressable>
  );
}
  
*/
