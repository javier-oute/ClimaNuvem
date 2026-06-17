import "@/global.css";
import CloudDetailHeader, {
  HEADER_HEIGHT,
} from "@/components/guide/cloud-detail-header";
import {
  getCloudImages,
  getCloudMeta,
  isCloudKey,
  RISK_COLORS,
} from "@/features/guide/cloud-data";
import { useT } from "@/lib/i18n";
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useScrollOffset,
} from "react-native-reanimated";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 py-2.5">
      <Text className="text-slate-500 dark:text-zinc-400">{label}</Text>
      <Text className="flex-1 text-right font-medium text-slate-800 dark:text-zinc-200">
        {value}
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View className="gap-1.5">
      <Text className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
        {title}
      </Text>
      <Text className="text-lg font-normal text-slate-600 dark:text-zinc-400">
        {children}
      </Text>
    </View>
  );
}

// Escala de peligrosidad: 5 círculos que se rellenan según el nivel (0..4).
// Cada círculo relleno usa el color de su propio nivel (paleta de alertas).
function RiskScale({ level }: { level: number }) {
  return (
    <View className="flex-row items-center gap-1.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className={`h-3 w-3 rounded-full ${
            i <= level ? "" : "bg-slate-200 dark:bg-zinc-700"
          }`}
          style={i <= level ? { backgroundColor: RISK_COLORS[i] } : undefined}
        />
      ))}
    </View>
  );
}

export default function CloudDetailScreen() {
  const t = useT();
  const { type } = useLocalSearchParams<{ type: string }>();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);

  if (!isCloudKey(type)) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-zinc-900">
        <Text className="text-slate-500 dark:text-zinc-400">
          {t("guide.title")}
        </Text>
      </View>
    );
  }

  const meta = getCloudMeta(type);
  const images = getCloudImages(type);

  const c = (k: string) => t(`guide.clouds.${type}.${k}`);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-900">
      <Stack.Screen options={{ headerTintColor: "#ffffff" }} />
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <CloudDetailHeader images={images} scrollOffset={scrollOffset} />

        {/* Tarjeta de contenido que solapa la imagen */}
        <View
          className="-mt-6 rounded-t-3xl bg-slate-50 px-6 pt-6 dark:bg-zinc-900"
          style={{ minHeight: HEADER_HEIGHT }}
        >
          {/* Nombre + abreviatura a la izquierda, categoría (badge) a la derecha */}
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-baseline gap-3">
              <Text
                numberOfLines={1}
                className="shrink text-3xl font-bold text-slate-900 dark:text-zinc-100"
              >
                {c("nombre")}
              </Text>
              <Text className="text-lg text-slate-400 dark:text-zinc-500">
                {meta.abrev}
              </Text>
            </View>
            <Text className="shrink-0 overflow-hidden rounded-full bg-[#314468] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {t(`guide.categoriesShort.${meta.category}`)}
            </Text>
          </View>

          {/* Descripción */}
          <View className="mt-6">
            <Section title={t("guide.detail.descripcionTitulo")}>
              {c("descripcion")}
            </Section>
          </View>

          {/* Ficha rápida */}
          <View className="mt-6 rounded-2xl bg-white px-4 py-1 shadow-sm dark:bg-zinc-800">
            <InfoRow
              label={t("guide.detail.categoria")}
              value={t(`guide.categories.${meta.category}`)}
            />
            <View className="h-px bg-slate-100 dark:bg-zinc-700" />
            <InfoRow label={t("guide.detail.altitud")} value={c("altitud")} />
            <View className="h-px bg-slate-100 dark:bg-zinc-700" />
            <InfoRow label={t("guide.detail.abreviatura")} value={meta.abrev} />
            <View className="h-px bg-slate-100 dark:bg-zinc-700" />
            <InfoRow
              label={t("guide.detail.precipita")}
              value={c("precipita")}
            />
          </View>

          {/* Cómo identificarla */}
          <View className="mt-6">
            <Section title={t("guide.detail.identificacionTitulo")}>
              {c("identificacion")}
            </Section>
          </View>

          {/* Qué significa en montaña: título a la izquierda, escala a la derecha */}
          <View className="mt-6 gap-1.5">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                {t("guide.detail.montanaTitulo")}
              </Text>
              <View className="shrink-0 flex-row items-center gap-2">
                <RiskScale level={meta.riesgo} />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: meta.riesgoColor }}
                >
                  {t(`guide.detail.riesgo.${meta.riesgo}`)}
                </Text>
              </View>
            </View>
            <Text className="text-lg font-normal text-slate-600 dark:text-zinc-400">
              {c("montana")}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
