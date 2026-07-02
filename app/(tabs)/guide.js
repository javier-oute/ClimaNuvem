import { useT } from "@/lib/i18n";
import { Link } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../global.css";

const IMAGENES = {
  cirrus: require("../../assets/images/cirrus.jpg"),
  cirrocumulus: require("../../assets/images/cirrocumulus.jpg"),
  cirrostratus: require("../../assets/images/cirrostratus.jpeg"),
  altostratus: require("../../assets/images/altostratus.jpeg"),
  altocumulus: require("../../assets/images/Altocumulus.jpg"),
  nimbostratus: require("../../assets/images/nimbostratus.jpg"),
  stratus: require("../../assets/images/stratus.jpeg"),
  stratocumulus: require("../../assets/images/stratocumulus.jpg"),
  cumulus: require("../../assets/images/cumulus.jpg"),
  cumulonimbus: require("../../assets/images/cumulonimbus.jpg"),
};

const ABREVIATURAS = {
  cirrus: "Ci",
  cirrocumulus: "Cc",
  cirrostratus: "Cs",
  altostratus: "As",
  altocumulus: "Ac",
  nimbostratus: "Ns",
  stratus: "St",
  stratocumulus: "Sc",
  cumulus: "Cu",
  cumulonimbus: "Cb",
};

function NubeCard({ nube }) {
  return (
    // Altura fija: la imagen mide lo que la tarjeta (cuadra en todos los dispositivos) y el texto se acota para no desbordar.
    <View
      className="flex-row bg-white dark:bg-zinc-800 rounded-xl shadow-sm"
      style={{ height: 160 }}
    >
      <Image
        source={nube.imagen}
        style={{
          width: 130,
          height: "100%",
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
        }}
        resizeMode="cover"
      />
      <View className="flex-1 px-4 pt-3 pb-4 gap-1 justify-center">
        <View className="flex-row items-baseline gap-2">
          <Text
            numberOfLines={1}
            className="text-lg font-semibold text-slate-900 dark:text-zinc-100"
          >
            {nube.nombre}
          </Text>
          <Text className="text-sm text-slate-400 dark:text-zinc-500">
            {nube.abrev}
          </Text>
        </View>
        <Text
          numberOfLines={5}
          style={{ lineHeight: 18 }}
          className="text-slate-600 dark:text-zinc-400"
        >
          {nube.descripcion}
        </Text>
      </View>
    </View>
  );
}

export default function Guide() {
  const t = useT();
  const insets = useSafeAreaInsets();

  const categorias = useMemo(
    () => [
      {
        key: "high",
        titulo: t("guide.categories.high"),
        nubes: ["cirrus", "cirrocumulus", "cirrostratus"],
      },
      {
        key: "mid",
        titulo: t("guide.categories.mid"),
        nubes: ["altostratus", "altocumulus", "nimbostratus"],
      },
      {
        key: "low",
        titulo: t("guide.categories.low"),
        nubes: ["stratus", "stratocumulus"],
      },
      {
        key: "vertical",
        titulo: t("guide.categories.vertical"),
        nubes: ["cumulus", "cumulonimbus"],
      },
    ],
    [t],
  );

  return (
    <View className="flex-1 bg-slate-50 dark:bg-zinc-900">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24 + (Platform.OS === "android" ? insets.top : 0),
          paddingBottom: 40,
          gap: 24,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="font-bold text-3xl text-slate-900 dark:text-zinc-100">
            {t("guide.title")}
          </Text>
          <Text className="text-slate-500 dark:text-zinc-400 mt-1">
            {t("guide.subtitle")}
          </Text>
        </View>

        {categorias.map((cat) => (
          <View key={cat.key} className="gap-4">
            <Text className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              {cat.titulo}
            </Text>
            {cat.nubes.map((key) => (
              <Link key={key} href={`/cloud/${key}`} asChild>
                <Pressable className="active:opacity-80">
                  <NubeCard
                    nube={{
                      nombre: t(`guide.clouds.${key}.nombre`),
                      descripcion: t(`guide.clouds.${key}.descripcion`),
                      abrev: ABREVIATURAS[key],
                      imagen: IMAGENES[key],
                    }}
                  />
                </Pressable>
              </Link>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
