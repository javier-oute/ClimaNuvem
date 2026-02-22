import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { View } from "react-native";
//import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../../global.css";

export default function TabsLayout() {
  //const insets = useSafeAreaInsets();
  const TAB_BAR_SPACE = 80;

  return (
    <View
      className="flex-1"
      style={{
        paddingBottom: TAB_BAR_SPACE,
      }}
    >
      <NativeTabs
        //minimizeBehavior="onScrollDown"
        tintColor="#314468" // color activo
        iconColor="#314468"
      >
        <NativeTabs.Trigger name="home">
          <Label>Home</Label>
          <Icon sf="house.fill" md="home" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="history">
          <Label>Historial</Label>
          <Icon sf="clock.fill" md="history" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Label>Perfil</Label>
          <Icon sf="person.fill" md="account" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
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
