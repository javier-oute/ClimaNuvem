import { Tabs } from "expo-router";
import { IconoHome } from "../../components/icons";
import "../../global.css";

const isLoggedInmock = true; // Simulación del estado de autenticación

export default function TabsLayout() {
  //const session = useAuthStore((s) => !!s.session); // Simulación del estado de autenticación
  //const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: isLoggedInmock
          ? { backgroundColor: "white" }
          : { display: "none" },
        tabBarActiveTintColor: "black",
        headerShown: true,
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
      <Tabs.Protected guard={isLoggedInmock}>
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs.Protected>
    </Tabs>
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
