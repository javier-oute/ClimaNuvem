import { getPredictionById } from "@/services/communityMap.mock";
import { bandForConfidence, forecastTitleKey } from "@/lib/forecast/model-meta";
import { formatDateTimeWithWeekday, formatProbability } from "@/lib/format";
import { LOCALE_MAP, useT } from "@/lib/i18n";
import { useSettingsStore } from "@/stores/settings.store";
import BottomSheet, {
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { Stack, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
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
  const item = getPredictionById(id);

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

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900 p-6">
        <Stack.Screen options={{ headerShown: true, headerTitle: "" }} />
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
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: "#FFFFFF",
        }}
      />
      <Image
        source={require("@/assets/images/fondo-nubes-1.avif")}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

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
                {t("community.prediction")}:
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

            <View className="flex gap-1">
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
              <Text className="text-base text-[#b0aeaf] text-center">
                {t("community.by")}:{" "}
                {item.is_anonymous ? t("community.anonymous") : item.alias}
              </Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
