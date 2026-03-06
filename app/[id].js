import { deleteForecast, fetchForecast } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday, formatProbability } from "@/lib/format";
import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  View,
} from "react-native";
import { DownloadSupabaseImageButton } from "../components/buttons";
import {
  DeleteForecastButton,
  ShareForecastButton,
} from "../components/forecast/forecast-buttons";
import "../global.css";
import { useShareForecast } from "../hooks/useShareForecast";

export default function ItemDetail() {
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState(false);

  const [topBlockH, setTopBlockH] = useState(0);
  const [bottomBlockH, setBottomBlockH] = useState(0);

  const animationConfigs = useBottomSheetSpringConfigs({
    stiffness: 300,
    damping: 35,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.5,
    restSpeedThreshold: 0.5,
  });

  const bottomConstant = Platform.OS === "ios" ? 70 : 120; // 48 3-button ?
  const topConstant = Platform.OS === "ios" ? 90 : 140;

  const snapPoints = useMemo(() => {
    const collapsed = bottomBlockH + bottomConstant;
    const expanded = topBlockH + topConstant;
    return [collapsed, expanded];
  }, [bottomBlockH, topBlockH, bottomConstant, topConstant]);

  //const snapPoints = useMemo(() => ["20%", "50%"], []);

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

  const onDelete = useCallback(async () => {
    if (isDeleting) return;
    if (!id || typeof id !== "string") {
      Alert.alert("Error", "ID inválida.");
      return;
    }

    Alert.alert(
      "Eliminar predicción",
      "¿Seguro que quieres eliminarla? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setIsDeleting(false),
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteForecast({ id, imagePath: item?.image_path });
              router.replace("/(tabs)/history");
            } catch (e) {
              Alert.alert("No se pudo eliminar", e?.message ?? "Error");
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );

    /*
    try {
      await deleteForecast({
        id: id,
      });

      router.replace("/(tabs)/history");
    } catch (e) {
      Alert.alert("No se pudo guardar", e?.message ?? "Error");
    } finally {
      setIsDeleting(false);
    }
      */
  }, [id, item, isDeleting]);

  const { onShare } = useShareForecast({
    name: item?.name,
    placeName: item?.place_name,
    forecast: item?.forecast,
    probability: item?.probability,
  });

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
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerShadowVisible: true,
          headerTintColor: "#FFFFFF",
          headerRight: ({ tintColor }) => (
            <DownloadSupabaseImageButton
              uri={item?.signedUrl}
              //color={tintColor}
            />
          ),
        }}
      />
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
        animationConfigs={animationConfigs}
        handleIndicatorStyle={{
          width: 44,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#CBD5E1", // slate-300
        }}
      >
        <BottomSheetView className="pt-5 px-8">
          <View
            className="flex gap-8"
            onLayout={(event) => {
              const h = Math.ceil(event.nativeEvent.layout.height);
              setTopBlockH((prev) => (prev === h ? prev : h));
            }}
          >
            <View
              className="flex gap-4"
              onLayout={(event) => {
                const h = Math.ceil(event.nativeEvent.layout.height);
                setBottomBlockH((prev) => (prev === h ? prev : h));
              }}
            >
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
            <View className="flex-row gap-3">
              <DeleteForecastButton
                isDeleting={isDeleting}
                onDelete={onDelete}
              />
              <ShareForecastButton onShare={onShare} />
            </View>
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
