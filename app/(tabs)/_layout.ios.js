import { useAuthStore } from "@/stores/auth.store";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";
//import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../global.css";

export default function TabsLayout() {
  //const insets = useSafeAreaInsets();
  const session = useAuthStore((s) => s.session);

  return (
    <NativeTabs
      //minimizeBehavior="onScrollDown"
      tintColor="#314468" // color activo
      iconColor="#314468"
      backgroundColor="transparent"
      blurEffect={Platform.OS === "ios" ? "none" : undefined} // ✅ sin blur en iOS
      shadowColor={Platform.OS === "ios" ? "transparent" : undefined} // ✅ sin línea/sombra arriba
    >
      <NativeTabs.Trigger name="home">
        <Label>Home</Label>
        <Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="history"
        contentStyle={{ backgroundColor: "transparent" }}
        hidden={!session}
      >
        <Label>Historial</Label>
        <Icon sf="clock.fill" md="history" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" hidden={!session}>
        <Label>Perfil</Label>
        <Icon sf="person.fill" md="account" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/*
import { Tabs } from "expo-router";
import { IconoHome } from "../../components/icons";
import "../../global.css";

const isLoggedIn = false; // Simulación del estado de autenticación

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "white" },
        tabBarActiveTintColor: "black",
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconoHome color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
        }}
      />
    </Tabs>
  );
}

*/
