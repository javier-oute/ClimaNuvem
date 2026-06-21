import {
  ReportForecastButton,
  UnpublishForecastButton,
} from "@/components/forecast/forecast-buttons";
import { FloatingHeaderButton } from "@/components/floating-header-button";
import { BackIcon, UserIcon } from "@/components/icons";
import { PlainStateHeader } from "@/components/plain-state-header";
import {
  getPredictionById,
  reportPrediction,
  unpublishPrediction,
} from "@/lib/communityMap";
import { bandForConfidence, forecastTitleKey } from "@/lib/forecast/model-meta";
import { formatDateTimeWithWeekday, formatProbability } from "@/lib/format";
import { LOCALE_MAP, useT } from "@/lib/i18n";
import { getSignedImageUrl } from "@/stores/forecast.store.image";
import { resolveAvatarUrl } from "@/stores/profile.store.image";
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
import "../../global.css";

function formatTimeRemaining(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalMinutes = Math.floor(diff / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function CommunityPredictionDetail() {
  const t = useT();
  const { colorScheme } = useColorScheme();
  const language = useSettingsStore((s) => s.language);
  const locale = LOCALE_MAP[language];

  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

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

  const bottomConstant = Platform.OS === "ios" ? 70 : 120;
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
        const data = await getPredictionById(id);
        if (cancelled) return;
        setItem(data);

        if (data?.image_path) {
          try {
            const url = await getSignedImageUrl(data.image_path);
            if (!cancelled) setSignedUrl(url);
          } catch (err) {
            console.error("Error firmando imagen de la publicación:", err);
          }
        }
        if (data?.author_avatar_url) {
          try {
            const url = await resolveAvatarUrl(data.author_avatar_url);
            if (!cancelled) setAvatarUrl(url);
          } catch (err) {
            console.error("Error resolviendo avatar del autor:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching community prediction:", err);
        if (!cancelled) setItem(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onUnpublish = useCallback(() => {
    if (!item) return;
    Alert.alert(t("community.unpublishTitle"), t("community.unpublishMsg"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.unpublish"),
        style: "destructive",
        onPress: async () => {
          setIsBusy(true);
          try {
            await unpublishPrediction(item.id);
            router.back();
          } catch (e) {
            Alert.alert(t("community.actionError"), e?.message ?? "Error");
            setIsBusy(false);
          }
        },
      },
    ]);
  }, [item, t]);

  const onReport = useCallback(() => {
    if (!item) return;
    Alert.alert(
      t("community.reportConfirmTitle"),
      t("community.reportConfirmMsg"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.report"),
          style: "destructive",
          onPress: async () => {
            setIsBusy(true);
            try {
              await reportPrediction(item.id);
              Alert.alert(
                t("community.reportThanksTitle"),
                t("community.reportThanksMsg"),
              );
            } catch (e) {
              Alert.alert(t("community.actionError"), e?.message ?? "Error");
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
    );
  }, [item, t]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900">
        <PlainStateHeader />
        <ActivityIndicator />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900 p-6">
        <PlainStateHeader />
        <Text className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
          {t("community.notFound")}
        </Text>
      </View>
    );
  }

  const { texto } = formatDateTimeWithWeekday(item.published_at, locale);
  const band = bandForConfidence(item.probability ?? 0);
  const forecastTitle = t(forecastTitleKey(item.forecast, band));
  const forecastDisplay = forecastTitle.startsWith("alerts.")
    ? item.forecast
    : forecastTitle;
  const p = formatProbability(item.probability);
  const lowBand = band === "baja";
  const timeRemaining = formatTimeRemaining(item.expires_at);

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          // Android: sin header nativo; el botón de atrás va flotante. iOS intacto.
          headerShown: Platform.OS === "ios",
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: "#FFFFFF",
        }}
      />
      <Image
        source={
          signedUrl
            ? { uri: signedUrl }
            : require("@/assets/images/fondo-nubes-1.avif")
        }
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />
      {/* Android (sin header nativo): botón de atrás flotante (icono blanco + sombra). */}
      {Platform.OS === "android" ? (
        <FloatingHeaderButton side="left" onPress={() => router.back()}>
          <BackIcon color="white" />
        </FloatingHeaderButton>
      ) : null}

      <BottomSheet
        index={1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
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
          backgroundColor: "#CBD5E1",
        }}
      >
        <BottomSheetView className="pt-5 px-8">
          <View
            className="flex gap-6"
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
              {/* Cabecera de autor: avatar + username (siempre) */}
              <View className="flex-row items-center gap-3">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <View className="h-10 w-10 rounded-full bg-slate-300 dark:bg-zinc-600 items-center justify-center">
                    <UserIcon color="white" size={20} />
                  </View>
                )}
                <Text className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                  {item.author_username}
                </Text>
              </View>

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
                  {t("community.publishedAt")}: {texto}
                </Text>
              ) : null}
              {timeRemaining ? (
                <Text className="text-base text-[#b0aeaf] text-center">
                  {t("community.expiresIn")}: {timeRemaining}
                </Text>
              ) : (
                <Text className="text-base text-[#b0aeaf] text-center">
                  {t("community.expired")}
                </Text>
              )}
            </View>

            {/* Acción: despublicar (propia) o reportar (ajena) */}
            <View className="flex-row">
              {item.is_mine ? (
                <UnpublishForecastButton
                  onUnpublish={onUnpublish}
                  isUnpublishing={isBusy}
                />
              ) : (
                <ReportForecastButton onReport={onReport} />
              )}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
