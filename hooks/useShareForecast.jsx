import { useCallback } from "react";
import { Alert, Share } from "react-native";
import { formatProbability } from "../lib/format";

export function useShareForecast({
  name,
  placeName,
  forecast,
  probability,
  uri,
}) {
  const onShare = useCallback(async () => {
    const shareText = [
      name ? `🌤️ Predicción: ${name}` : "Predicción",
      placeName ? `📍 ${placeName}` : null,
      `🔮 Pronóstico: ${forecast || "-"}`,
      `📊 Probabilidad: ${formatProbability(probability)}%`,
      `\n— Enviado desde ClimaNuvem`,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (uri) {
        await Share.share({ message: shareText, url: uri });
      } else {
        await Share.share({ message: shareText });
      }
    } catch (e) {
      Alert.alert("No se pudo compartir", e?.message ?? "Error");
    }
  }, [name, placeName, forecast, probability, uri]);

  return { onShare };
}
