import { useAuthStore } from "@/stores/auth.store";
import { useT } from "@/lib/i18n";
import { Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import {
  ClockIcon,
  CloudIcon,
  IconoHome,
  MapIcon,
  UserIcon,
} from "../../components/icons";
import "../../global.css";

export default function TabsLayout() {
  const t = useT();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const isLoggedIn = useAuthStore((s) => !!s.session);
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: isDark ? "#18181b" : "white",
          borderTopColor: isDark ? "#3f3f46" : "#b0aeaf",
        },
        tabBarActiveTintColor: isDark ? "#7B9BD0" : "#314468",
        tabBarInactiveTintColor: isDark ? "#71717a" : "#b0aeaf",
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
          name="map"
          options={{
            title: t("tabs.map"),
            tabBarIcon: ({ color }) => <MapIcon color={color} />,
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
