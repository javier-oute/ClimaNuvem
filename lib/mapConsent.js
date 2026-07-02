import { Alert } from "react-native";
import {
  CURRENT_MAP_CONSENT_VERSION,
  useSettingsStore,
} from "@/stores/settings.store";

// Aviso de consentimiento del mapa: único punto que concede el consentimiento (versionado); se reutiliza en Publicar y en el ajuste.
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

// Aviso al desactivar 'compartir en el mapa': solo la confirmación; el borrado y la retirada del consentimiento los hace quien lo llama.
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
