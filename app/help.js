import { useT } from "@/lib/i18n";
import { Stack } from "expo-router";
import {
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";

const IMAGES = {
  good: require("@/assets/images/help/buena-imagen.png"),
  objects: require("@/assets/images/help/objetos-delante.png"),
  visibility: require("@/assets/images/help/mala-visibilidad.png"),
  blurry: require("@/assets/images/help/borrosas.png"),
};

// Proporciones reales de los mockups
const LANDSCAPE_RATIO = 1200 / 609; // ancho / alto ≈ 1.97
const PORTRAIT_RATIO = 609 / 1200; // ancho / alto ≈ 0.51

const H_PADDING = 24; // debe coincidir con el padding del ScrollView

function SectionTitle({ children }) {
  return (
    <Text className="text-3xl font-bold text-slate-900 dark:text-zinc-100">
      {children}
    </Text>
  );
}

function Description({ children }) {
  return (
    <Text className="text-lg leading-7 font-normal text-slate-600 dark:text-zinc-400">
      {children}
    </Text>
  );
}

// Mockup apaisado: ocupa todo el ancho disponible.
function LandscapeImage({ source, availWidth }) {
  const width = availWidth;
  const height = Math.round(width / LANDSCAPE_RATIO);
  return (
    <Image
      source={source}
      style={{ width, height }}
      resizeMode="contain"
      accessible={false}
    />
  );
}

// Mockup vertical: centrado y con ancho contenido para que el marco del
// móvil no domine la pantalla.
function PortraitImage({ source, availWidth }) {
  const width = Math.round(availWidth * 0.55);
  const height = Math.round(width / PORTRAIT_RATIO);
  return (
    <View className="items-center">
      <Image
        source={source}
        style={{ width, height }}
        resizeMode="contain"
        accessible={false}
      />
    </View>
  );
}

export default function Help() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const availWidth = screenWidth - H_PADDING * 2;

  return (
    <>
      <Stack.Screen options={{ headerTitle: t("help.title") }} />
      <ScrollView
        className="flex-1 bg-white dark:bg-zinc-900"
        contentContainerStyle={{
          padding: H_PADDING,
          gap: 40,
          paddingBottom: insets.bottom + 40,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Cómo hacer buenas fotos */}
        <View className="gap-4">
          <SectionTitle>{t("help.goodPhotos.title")}</SectionTitle>
          <LandscapeImage source={IMAGES.good} availWidth={availWidth} />
          <Description>{t("help.goodPhotos.body")}</Description>
        </View>

        {/* Fotos que debes evitar */}
        <View className="gap-4">
          <SectionTitle>{t("help.avoidPhotos.title")}</SectionTitle>
          <Description>{t("help.avoidPhotos.intro")}</Description>

          <View className="gap-3">
            <PortraitImage source={IMAGES.objects} availWidth={availWidth} />
            <Description>{t("help.avoidPhotos.objects")}</Description>
          </View>

          <View className="gap-3">
            <PortraitImage source={IMAGES.visibility} availWidth={availWidth} />
            <Description>{t("help.avoidPhotos.visibility")}</Description>
          </View>

          <View className="gap-3">
            <LandscapeImage source={IMAGES.blurry} availWidth={availWidth} />
            <Description>{t("help.avoidPhotos.blurry")}</Description>
          </View>
        </View>

        {/* Cómo funciona ClimaNuvem */}
        <View className="gap-4">
          <SectionTitle>{t("help.howItWorks.title")}</SectionTitle>
          <Description>{t("help.howItWorks.body")}</Description>
        </View>
      </ScrollView>
    </>
  );
}
