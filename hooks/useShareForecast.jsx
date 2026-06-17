import { t } from "@/lib/i18n";
import { useCallback } from "react";
import { Alert, Share } from "react-native";
import { formatProbability } from "../lib/format";

export function useShareForecast({
  name,
  placeName,
  forecast,
  recommendation,
  probability,
  reliability,
}) {
  const onShare = useCallback(async () => {
    // El % solo se comparte si la fiabilidad no es baja (coherente con la pantalla de resultado).
    const showProbability = reliability && reliability !== "baja";
    const reliabilityLabel = reliability
      ? `${t("share.reliabilityLabel")}${t(`alerts.fiabilidad.${reliability}`)}`
      : null;

    const shareText = [
      (name ?? "").trim()
        ? `${t("share.predictionPrefix")}${name}`
        : t("share.defaultTitle"),
      (placeName ?? "").trim()
        ? `${t("share.locationPrefix")}${placeName}`
        : null,
      `${t("share.forecastLabel")}${forecast || "-"}`,
      (recommendation ?? "").trim()
        ? `${t("share.recommendationLabel")}${recommendation}`
        : null,
      reliabilityLabel,
      showProbability
        ? `${t("share.probabilityLabel")}${formatProbability(probability)}%`
        : null,
      t("share.footer"),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await Share.share({ message: shareText });
    } catch (e) {
      Alert.alert(t("share.error"), e?.message ?? "Error");
    }
  }, [name, placeName, forecast, recommendation, probability, reliability]);

  return { onShare };
}
