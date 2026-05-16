import { t } from "@/lib/i18n";
import { useCallback } from "react";
import { Alert, Share } from "react-native";
import { formatProbability } from "../lib/format";

export function useShareForecast({ name, placeName, forecast, probability }) {
  const onShare = useCallback(async () => {
    const shareText = [
      (name ?? "").trim()
        ? `${t("share.predictionPrefix")}${name}`
        : t("share.defaultTitle"),
      (placeName ?? "").trim()
        ? `${t("share.locationPrefix")}${placeName}`
        : null,
      `${t("share.forecastLabel")}${forecast || "-"}`,
      `${t("share.probabilityLabel")}${formatProbability(probability)}%`,
      t("share.footer"),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await Share.share({ message: shareText });
    } catch (e) {
      Alert.alert(t("share.error"), e?.message ?? "Error");
    }
  }, [name, placeName, forecast, probability]);

  return { onShare };
}
