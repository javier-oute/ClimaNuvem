import { Alert, Linking } from "react-native";

// Aviso cuando un permiso está bloqueado (canAskAgain false): ofrece abrir Ajustes para concederlo a mano.
export function alertPermissionBlocked({ t, title, message }) {
  Alert.alert(title, message, [
    { text: t("permissions.cancel"), style: "cancel" },
    {
      text: t("permissions.openSettings"),
      onPress: () => Linking.openSettings(),
    },
  ]);
}
