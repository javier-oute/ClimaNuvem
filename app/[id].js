import { fetchForecast } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday } from "@/lib/format";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import "../global.css";

export default function ItemDetail() {
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchForecast({ id });
        if (!cancelled) setItem(data);
      } catch (err) {
        console.error("Error fetching forecast detail:", err);
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-2 text-slate-500">Cargando...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-lg font-semibold">
          No se encontró la predicción
        </Text>
      </View>
    );
  }

  const { texto } = formatDateTimeWithWeekday(item.created_at);

  return (
    <View className="flex-1 bg-white">
      <Image
        source={
          item?.signedUrl
            ? { uri: item?.signedUrl }
            : require("@/assets/images/fondo-nubes-1.avif")
        }
        className="w-full h-56"
        resizeMode="cover"
      />

      <View className="p-6 gap-2">
        <Text className="text-2xl font-bold">{item.name ?? "Predicción"}</Text>
        <Text className="text-slate-600">{texto}</Text>

        {item.place_name ? (
          <Text className="text-slate-600">Lugar: {item.place_name}</Text>
        ) : null}

        <View className="mt-3 gap-1">
          <Text className="text-base">Pronóstico: {item.forecast ?? "-"}</Text>
          <Text className="text-base">Probabilidad: {item.probability}%</Text>
        </View>

        {/* Más adelante: botones Guardar / Descartar */}
      </View>
    </View>
  );
}
