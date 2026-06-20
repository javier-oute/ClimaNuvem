import { unpublishPrediction } from "@/lib/communityMap";
import { bandForConfidence, forecastTitleKey } from "@/lib/forecast/model-meta";
import { deleteForecast, fetchForecast } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday, formatProbability } from "@/lib/format";
import { LOCALE_MAP, useT } from "@/lib/i18n";
import { useSettingsStore } from "@/stores/settings.store";
import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
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
  UnpublishForecastButton,
} from "../components/forecast/forecast-buttons";
import "../global.css";
import { useShareForecast } from "../hooks/useShareForecast";

export default function ItemDetail() {
  const t = useT();
  const { colorScheme } = useColorScheme();
  const language = useSettingsStore((s) => s.language);
  const locale = LOCALE_MAP[language];

  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

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
      Alert.alert(t("detail.error"), t("detail.invalidId"));
      return;
    }

    Alert.alert(
      t("detail.deleteTitle"),
      item?.isPublishedActive
        ? t("detail.deleteMsgPublished")
        : t("detail.deleteMsg"),
      [
        {
          text: t("detail.cancel"),
          style: "cancel",
          onPress: () => setIsDeleting(false),
        },
        {
          text: t("detail.deleteConfirm"),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteForecast({ id, imagePath: item?.image_path });
              router.replace("/(tabs)/history");
            } catch (e) {
              Alert.alert(t("detail.deleteError"), e?.message ?? "Error");
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
  }, [id, item, isDeleting, t]);

  const onUnpublish = useCallback(() => {
    if (isUnpublishing || !item?.communityPredictionId) return;
    Alert.alert(t("community.unpublishTitle"), t("community.unpublishMsg"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.unpublish"),
        style: "destructive",
        onPress: async () => {
          setIsUnpublishing(true);
          try {
            await unpublishPrediction(item.communityPredictionId);
            // El badge/botón pasan a "fue publicada" sin recargar.
            setItem((prev) =>
              prev
                ? {
                    ...prev,
                    isPublishedActive: false,
                    communityPredictionId: null,
                  }
                : prev,
            );
          } catch (e) {
            Alert.alert(t("community.actionError"), e?.message ?? "Error");
          } finally {
            setIsUnpublishing(false);
          }
        },
      },
    ]);
  }, [item, isUnpublishing, t]);

  const { onShare } = useShareForecast({
    name: item?.name,
    placeName: item?.place_name,
    forecast: item?.forecast,
    probability: item?.probability,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <ActivityIndicator />
        <Text className="mt-2 text-slate-500 dark:text-zinc-400">
          {t("detail.loading")}
        </Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900 p-6">
        <Text className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
          {t("detail.notFound")}
        </Text>
      </View>
    );
  }

  const { texto } = formatDateTimeWithWeekday(item.created_at, locale);
  // Mismo criterio que en vivo: título dudoso y % oculto según la banda de la probabilidad guardada.
  const band = bandForConfidence(item.probability ?? 0);
  const forecastTitle = t(forecastTitleKey(item.forecast, band));
  const forecastDisplay = forecastTitle.startsWith("alerts.")
    ? item.forecast
    : forecastTitle;

  const p = formatProbability(item.probability);
  const lowBand = band === "baja";

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
          headerRight: () => (
            <DownloadSupabaseImageButton
              uri={item?.signedUrl}
              color={colorScheme === "dark" ? "white" : "black"}
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
          backgroundColor: colorScheme === "dark" ? "#27272a" : "white",
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
              <Text className="font-bold text-left text-2xl text-slate-900 dark:text-zinc-100">
                {t("detail.saved")}
              </Text>
              <Text className="font-bold text-center text-3xl text-slate-900 dark:text-zinc-100">
                {forecastDisplay || "-"}
              </Text>
            </View>
            {lowBand ? null : (
              <View className="flex w-full items-center gap-2">
                <Text className="font-bold text-center text-2xl rounded-2xl bg-[#314468] px-3 py-1 text-white">
                  {t("detail.probability")}: {p ?? "-"}%
                </Text>
                <View className="h-2 w-80 rounded-2xl bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                  <View
                    className="h-2 rounded-2xl bg-[#314468]"
                    style={{ width: `${p}%` }}
                  />
                </View>
              </View>
            )}
            {/* Detalles */}
            <View className="flex gap-1">
              {item.description ? (
                <Text className="text-base text-slate-600 dark:text-zinc-300 text-center">
                  {t("community.userDescription")}: {item.description}
                </Text>
              ) : null}
              {item.place_name ? (
                <Text className="text-lg text-[#b0aeaf] text-center">
                  {t("detail.place")}: {item.place_name}
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
            {item.isPublishedActive ? (
              <View className="flex-row">
                <UnpublishForecastButton
                  onUnpublish={onUnpublish}
                  isUnpublishing={isUnpublishing}
                />
              </View>
            ) : null}
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
