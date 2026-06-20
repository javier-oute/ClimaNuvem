import { Alert } from "react-native";
import {
  CURRENT_MAP_CONSENT_VERSION,
  useSettingsStore,
} from "@/stores/settings.store";

// Aviso de consentimiento para publicar en el mapa comunitario.
// Es el ÚNICO punto donde se concede el consentimiento: si el usuario acepta, guarda la versión
// actual (versionado) y ejecuta onAccept; si cancela, ejecuta onCancel (opcional).
// Se reutiliza tanto al pulsar "Publicar" (forecast-screen) como al activar el ajuste (perfil),
// para que el aviso sea idéntico en ambos flujos.
export function promptMapPublishConsent({ t, onAccept, onCancel } = {}) {
  Alert.alert(t("community.consentTitle"), t("community.consentMsg"), [
    { text: t("buttons.cancel"), style: "cancel", onPress: onCancel },
    {
      text: t("buttons.accept"),
      onPress: () => {
        useSettingsStore
          .getState()
          .setMapPublishConsent(CURRENT_MAP_CONSENT_VERSION);
        onAccept?.();
      },
    },
  ]);
}

// Aviso al DESACTIVAR "compartir en el mapa": advierte de que se eliminarán todas las publicaciones
// activas del usuario. Es solo la confirmación (UI); el borrado y la retirada del consentimiento los
// ejecuta onConfirm en quien lo llama, para no acoplar el helper a la capa de datos.
export function promptMapPublishDisable({ t, onConfirm, onCancel } = {}) {
  Alert.alert(
    t("settings.mapConsentDisableTitle"),
    t("settings.mapConsentDisableMsg"),
    [
      { text: t("buttons.cancel"), style: "cancel", onPress: onCancel },
      {
        text: t("settings.mapConsentDisableConfirm"),
        style: "destructive",
        onPress: onConfirm,
      },
    ],
  );
}
