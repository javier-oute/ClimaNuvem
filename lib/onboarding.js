import { Alert } from "react-native";

// Aviso de bienvenida que aparece UNA sola vez por dispositivo (la primera vez que se llega a la
// home, ya sea como invitado o con cuenta). Ofrece abrir la pantalla de ayuda o cerrar. Mismo
// patrón que lib/mapConsent.js: este helper es solo la UI del aviso; quién lo llama decide cuándo
// se muestra y marca el flag "visto" (stores/settings.store.js). Reutiliza buttons.cancel.
export function promptOnboarding({ t, onHelp } = {}) {
  Alert.alert(t("onboarding.title"), t("onboarding.message"), [
    { text: t("buttons.cancel"), style: "cancel" },
    { text: t("onboarding.help"), onPress: onHelp },
  ]);
}
