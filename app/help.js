import { useT } from "@/lib/i18n";
import { Stack } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";

function HelpSection({ title, body }) {
  return (
    <View className="rounded-2xl shadow-sm">
      <View className="bg-slate-50 dark:bg-zinc-800 rounded-2xl overflow-hidden p-4 gap-2">
        <Text className="text-lg font-bold text-slate-900 dark:text-zinc-100">
          {title}
        </Text>
        <Text className="text-base leading-6 text-slate-600 dark:text-zinc-400">
          {body}
        </Text>
      </View>
    </View>
  );
}

export default function Help() {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerTitle: t("help.title") }} />
      <ScrollView
        className="flex-1 bg-white dark:bg-zinc-900"
        contentContainerStyle={{
          padding: 24,
          gap: 24,
          paddingBottom: insets.bottom + 24,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <HelpSection
          title={t("help.goodPhotos.title")}
          body={t("help.goodPhotos.body")}
        />
        <HelpSection
          title={t("help.avoidPhotos.title")}
          body={t("help.avoidPhotos.body")}
        />
        <HelpSection
          title={t("help.howItWorks.title")}
          body={t("help.howItWorks.body")}
        />
      </ScrollView>
    </>
  );
}
