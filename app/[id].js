import { fetchForecast } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday, formatProbability } from "@/lib/format";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { DeleteForecastButton } from "../components/forecast/forecast-buttons";
import "../global.css";

export default function ItemDetail() {
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const snapPoints = useMemo(() => ["20%", "65%"], []);

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

  const p = formatProbability(item.probability);

  return (
    <View className="flex-1">
      <Image
        source={
          item?.signedUrl
            ? { uri: item?.signedUrl }
            : require("@/assets/images/fondo-nubes-1.avif")
        }
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <BottomSheet
        index={1} // empieza en el primer snap point
        snapPoints={snapPoints}
        enableDynamicSizing={false} // Mas estable
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{
          width: 44,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#CBD5E1", // slate-300
        }}
      >
        <BottomSheetView className="pt-5 px-8">
          <View className="flex gap-8">
            <View className="flex gap-4">
              <Text className="font-bold text-left text-2xl">
                Predicción guardada:
              </Text>
              <Text className="font-bold text-center text-3xl">
                {item.forecast || "-"}
              </Text>
            </View>
            <View className="flex w-full items-center gap-2">
              <Text className="font-bold text-center text-2xl rounded-2xl bg-[#314468] px-3 py-1 text-white">
                Probabilidad: {p ?? "-"}%
              </Text>
              <View className="h-2 w-80 rounded-2xl bg-slate-200 overflow-hidden">
                <View
                  className="h-2 rounded-2xl bg-[#314468]"
                  style={{ width: `${p}%` }}
                />
              </View>
            </View>
            {/* Detalles */}
            <View className="flex gap-1">
              {item.place_name ? (
                <Text className="text-lg text-[#b0aeaf] text-center">
                  Lugar: {item.place_name}
                </Text>
              ) : null}
              {texto ? (
                <Text className="text-base text-[#b0aeaf] text-center">
                  {texto}
                </Text>
              ) : null}
            </View>
            <DeleteForecastButton />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

/*
  return (
    <View className="flex-1">
      <Image
        source={
          item?.signedUrl
            ? { uri: item?.signedUrl }
            : require("@/assets/images/fondo-nubes-1.avif")
        }
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <BottomSheet
        index={0} // empieza en el primer snap point
        snapPoints={snapPoints}
        enableDynamicSizing={false} // Mas estable
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{
          width: 44,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#CBD5E1", // slate-300
        }}
      >
        <BottomSheetView className="pt-5 px-8">
          
          <Text className="font-bold text-4xl">
            {item.name ?? "Predicción"}
          </Text>
          <View className="pt-8 gap-2">
            <Text className="text-base">Fecha: {texto}</Text>
            {item.place_name ? (
              <Text className="text-base">Lugar: {item.place_name}</Text>
            ) : null}
            <Text className="text-base">
              Pronóstico: {item.forecast ?? "-"}
            </Text>
            <Text className="text-base">
              Probabilidad: {item.probability ?? "-"}%
            </Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );



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

      </View>
    </View>
  );
}
*/
