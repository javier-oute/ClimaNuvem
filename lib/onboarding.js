import { Alert } from "react-native";

// Aviso de bienvenida una vez por dispositivo (abre ayuda o cierra); helper solo de UI, quien lo llama marca el flag 'visto'.
export function promptOnboarding({ t, onHelp } = {}) {
  Alert.alert(t("onboarding.title"), t("onboarding.message"), [
    { text: t("buttons.cancel"), style: "cancel" },
    { text: t("onboarding.help"), onPress: onHelp },
  ]);
}
