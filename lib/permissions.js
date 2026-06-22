import { Alert, Linking } from "react-native";

// Aviso cuando un permiso está BLOQUEADO (denegado permanentemente, canAskAgain === false):
// el SO ya no mostrará su diálogo de permiso, así que ofrecemos abrir los Ajustes del sistema
// para que el usuario pueda concederlo manualmente. Mismo patrón i18n que lib/mapConsent.js.
export function alertPermissionBlocked({ t, title, message }) {
  Alert.alert(title, message, [
    { text: t("permissions.cancel"), style: "cancel" },
    {
      text: t("permissions.openSettings"),
      onPress: () => Linking.openSettings(),
    },
  ]);
}
