import { useAuthStore } from "@/stores/auth.store";
import { useT } from "@/lib/i18n";
import { Tabs } from "expo-router";
import {
  ClockIcon,
  CloudIcon,
  IconoHome,
  UserIcon,
} from "../../components/icons";
import "../../global.css";

export default function TabsLayout() {
  const t = useT();
  const isLoggedIn = useAuthStore((s) => !!s.session);
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "white", borderTopColor: "#b0aeaf" },
        tabBarActiveTintColor: "#314468",
        tabBarInactiveTintColor: "#b0aeaf",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => <IconoHome color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="guide"
        options={{
          title: t("tabs.guide"),
          tabBarIcon: ({ color }) => <CloudIcon color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen
          name="history"
          options={{
            title: t("tabs.history"),
            tabBarIcon: ({ color }) => <ClockIcon color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color }) => <UserIcon color={color} size={24} />,
            headerShown: false,
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}
