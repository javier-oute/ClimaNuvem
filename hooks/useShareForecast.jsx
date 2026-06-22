import { t } from "@/lib/i18n";
import { useCallback } from "react";
import { Alert, Share } from "react-native";

export function useShareForecast({
  placeName,
  forecast,
  recommendation,
  reliability,
}) {
  const onShare = useCallback(async () => {
    // Se comparte la fiabilidad (banda), nunca el porcentaje.
    const reliabilityLabel = reliability
      ? `${t("share.reliabilityLabel")}${t(`alerts.fiabilidad.${reliability}`)}`
      : null;

    // El título es siempre genérico ("🌤️ Predicción"): nunca se comparte el nombre
    // que el usuario le haya puesto a la predicción.
    const shareText = [
      t("share.defaultTitle"),
      (placeName ?? "").trim()
        ? `${t("share.locationPrefix")}${placeName}`
        : null,
      `${t("share.forecastLabel")}${forecast || "-"}`,
      (recommendation ?? "").trim()
        ? `${t("share.recommendationLabel")}${recommendation}`
        : null,
      reliabilityLabel,
      t("share.footer"),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await Share.share({ message: shareText });
    } catch (e) {
      Alert.alert(t("share.error"), e?.message ?? "Error");
    }
  }, [placeName, forecast, recommendation, reliability]);

  return { onShare };
}
