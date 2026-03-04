import { useAuthStore } from "@/stores/auth.store";
import { Tabs } from "expo-router";
import { ClockIcon, IconoHome, UserIcon } from "../../components/icons";
import "../../global.css";

export default function TabsLayout() {
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
          title: "Home",
          tabBarIcon: ({ color }) => <IconoHome color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen
          name="history"
          options={{
            title: "Historial",
            tabBarIcon: ({ color }) => <ClockIcon color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => <UserIcon color={color} size={24} />,
            headerShown: false,
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}
