import { useT } from "@/lib/i18n";
import { useColorScheme } from "nativewind";
import { Image, Text, View } from "react-native";

// Estado vacío del historial sin filtros (realmente vacío): logo según tema + título y subtítulo.
export default function HistoryEmpty() {
  const t = useT();
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Image
        source={
          colorScheme === "dark"
            ? require("@/assets/images/icon-login-dark.png")
            : require("@/assets/images/icon.png")
        }
        style={{ width: 130, height: 130, opacity: 0.85 }}
        resizeMode="contain"
      />
      <Text className="mt-4 text-center text-xl font-bold text-slate-900 dark:text-zinc-100">
        {t("history.emptyTitle")}
      </Text>
      <Text className="mt-2 text-center text-base text-slate-500 dark:text-zinc-400">
        {t("history.emptySubtitle")}
      </Text>
    </View>
  );
}
