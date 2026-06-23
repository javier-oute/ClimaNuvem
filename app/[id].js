import { unpublishPrediction } from "@/lib/communityMap";
import { bandForConfidence, forecastTitleKey } from "@/lib/forecast/model-meta";
import { ForecastDetailBody } from "@/components/forecast/forecast-detail-body";
import { PublishedBadge } from "@/components/published-badge";
import { deleteForecast, fetchForecast } from "@/lib/forecastHistory";
import { formatDateTimeWithWeekday } from "@/lib/format";
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
  Pressable,
  Text,
  View,
} from "react-native";
import { FloatingHeaderButton } from "@/components/floating-header-button";
import { BackIcon } from "@/components/icons";
import { PlainStateHeader } from "@/components/plain-state-header";
import {
  FullscreenImageViewer,
  ImageZoomHint,
} from "@/components/fullscreen-image-viewer";
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
  // Visor de la foto a pantalla completa (se abre tocando el fondo).
  const [viewerOpen, setViewerOpen] = useState(false);

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

  // bottomConstant: ajusta cuánto se esconde el sheet colapsado (identidad + pronóstico visibles).
  // Si la recomendación asoma, bájalo; si corta el pronóstico, súbelo.
  const bottomConstant = Platform.OS === "ios" ? 52 : 96;
  const topConstant = Platform.OS === "ios" ? 90 : 140;

  const snapPoints = useMemo(() => {
    const collapsed = bottomBlockH + bottomConstant;
    const expanded = topBlockH + topConstant;
    return [collapsed, expanded];
  }, [bottomBlockH, topBlockH, bottomConstant, topConstant]);

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

  // Mismo criterio que en vivo: título dudoso y banda de fiabilidad según la probabilidad guardada.
  // Se calcula aquí (null-safe) para reutilizarlo tanto en el render como al compartir.
  const band = bandForConfidence(item?.probability ?? 0);
  const forecastTitle = t(forecastTitleKey(item?.forecast, band));
  const forecastDisplay = forecastTitle.startsWith("alerts.")
    ? item?.forecast
    : forecastTitle;
  const lowBand = band === "baja";
  // Recomendación de seguridad derivada de la banda guardada (la 2ª clase no se
  // almacena, así que se usa la banda de fiabilidad directamente).
  const recommendationText = t(`alerts.${item?.forecast}.mensaje.${band}`);
  const recommendation = recommendationText.startsWith("alerts.")
    ? null
    : recommendationText;

  // Nunca se comparte el nombre de la predicción: el título es siempre genérico.
  const { onShare } = useShareForecast({
    placeName: item?.place_name,
    forecast: forecastDisplay,
    recommendation,
    reliability: band,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <PlainStateHeader />
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
        <PlainStateHeader />
        <Text className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
          {t("detail.notFound")}
        </Text>
      </View>
    );
  }

  const { texto } = formatDateTimeWithWeekday(item.created_at, locale);

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          // Android: sin header nativo (intercepta toques y pinta sombra). Los
          // botones (atrás + descarga) van flotantes. iOS mantiene su header.
          headerShown: Platform.OS === "ios",
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerShadowVisible: true,
          headerTintColor: "#FFFFFF",
          headerRight:
            Platform.OS === "ios"
              ? () => (
                  <DownloadSupabaseImageButton
                    uri={item?.signedUrl}
                    color={colorScheme === "dark" ? "white" : "black"}
                  />
                )
              : undefined,
        }}
      />
      {/* Fondo a sangre (igual que antes). Si hay foto real, tocarla abre el visor. */}
      <Pressable
        onPress={() => item?.signedUrl && setViewerOpen(true)}
        className="absolute inset-0"
      >
        <Image
          source={
            item?.signedUrl
              ? { uri: item?.signedUrl }
              : require("@/assets/images/fondo-nubes-1.avif")
          }
          className="w-full h-full"
          resizeMode="cover"
        />
      </Pressable>
      {item?.signedUrl ? (
        <ImageZoomHint onPress={() => setViewerOpen(true)} />
      ) : null}
      {/* Android (sin header nativo): botones flotantes (icono blanco + sombra). */}
      {Platform.OS === "android" ? (
        <>
          <FloatingHeaderButton side="left" onPress={() => router.back()}>
            <BackIcon color="white" />
          </FloatingHeaderButton>
          <DownloadSupabaseImageButton
            uri={item?.signedUrl}
            color="white"
            floating
          />
        </>
      ) : null}

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
            className="flex gap-4"
            onLayout={(event) => {
              const h = Math.ceil(event.nativeEvent.layout.height);
              setTopBlockH((prev) => (prev === h ? prev : h));
            }}
          >
            <ForecastDetailBody
              onLayoutInner={(event) => {
                const h = Math.ceil(event.nativeEvent.layout.height);
                setBottomBlockH((prev) => (prev === h ? prev : h));
              }}
              identity={
                // Nombre como título principal + badge "Publicada" a la derecha (igual que la lista)
                <View className="flex-row items-center justify-between gap-2">
                  <Text
                    className="flex-1 font-bold text-left text-3xl text-slate-900 dark:text-zinc-100"
                    numberOfLines={2}
                  >
                    {item.name || t("forecast.defaultName")}
                  </Text>
                  <PublishedBadge
                    active={item.isPublishedActive}
                    wasPublished={!!item.published_at}
                    label={t("history.publishedBadge")}
                    size="lg"
                  />
                </View>
              }
              clase={item.forecast}
              band={band}
              forecastDisplay={forecastDisplay}
              recommendation={recommendation}
              lowBand={lowBand}
              description={item.description}
              placeName={item.place_name}
              dateText={texto}
            />
            <View className="mt-4 flex-row gap-3">
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
      <FullscreenImageViewer
        visible={viewerOpen}
        uri={item?.signedUrl}
        onClose={() => setViewerOpen(false)}
      />
    </View>
  );
}
