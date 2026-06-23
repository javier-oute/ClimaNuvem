import { useAuthStore } from "@/stores/auth.store";
import { useT } from "@/lib/i18n";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
import "../../global.css";

export default function TabsLayout() {
  const t = useT();
  const session = useAuthStore((s) => s.session);

  return (
    <NativeTabs
      tintColor="#314468" // color activo
      iconColor="#314468"
      backgroundColor="transparent"
      blurEffect={Platform.OS === "ios" ? "none" : undefined} // ✅ sin blur en iOS
      shadowColor={Platform.OS === "ios" ? "transparent" : undefined} // ✅ sin línea/sombra arriba
    >
      <NativeTabs.Trigger name="home">
        <Label>{t("tabs.home")}</Label>
        <Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="guide">
        <Label>{t("tabs.guide")}</Label>
        <Icon sf="cloud.fill" md="cloud" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="history"
        contentStyle={{ backgroundColor: "transparent" }}
        hidden={!session}
      >
        <Label>{t("tabs.history")}</Label>
        <Icon sf="clock.fill" md="history" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="map" hidden={!session}>
        <Label>{t("tabs.map")}</Label>
        <Icon sf="map.fill" md="map" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" hidden={!session}>
        <Label>{t("tabs.profile")}</Label>
        <Icon sf="person.fill" md="account" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
