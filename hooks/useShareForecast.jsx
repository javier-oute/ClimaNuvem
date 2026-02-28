import { useCallback } from "react";
import { Alert, Share } from "react-native";
import { formatProbability } from "../lib/format";

export function useShareForecast({ name, placeName, forecast, probability }) {
  const onShare = useCallback(async () => {
    const shareText = [
      (name ?? "").trim() ? `🌤️ Predicción: ${name}` : "Predicción",
      (placeName ?? "").trim() ? `📍 ${placeName}` : null,
      `Pronóstico: ${forecast || "-"}`,
      `Probabilidad: ${formatProbability(probability)}%`,
      `\n— Enviado desde ClimaNuvem`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await Share.share({ message: shareText });
    } catch (e) {
      Alert.alert("No se pudo compartir", e?.message ?? "Error");
    }
  }, [name, placeName, forecast, probability]);

  return { onShare };
}
