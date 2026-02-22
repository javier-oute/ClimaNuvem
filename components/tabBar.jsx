import { IconoHome } from "@/components/icons";
import "@/global.css";
import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const isLoggedInmock = true;

function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 10 + insets.bottom, // flota sobre la safe area
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "86%", // 👈 más pequeño horizontalmente
          maxWidth: 420, // 👈 para tablets / pantallas grandes
          backgroundColor: "#E6E7EA", // 👈 gris
          borderRadius: 999,
          padding: 6,
          flexDirection: "row",
          justifyContent: "space-between",
          // sombra suave (iOS) + elevación (Android)
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          // Icono definido en options.tabBarIcon
          const icon =
            typeof options.tabBarIcon === "function"
              ? options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? "#314468" : "#8A8D93",
                  size: 22,
                })
              : null;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: 44,
                borderRadius: 999,
                marginHorizontal: 4,
                backgroundColor: isFocused ? "#FFFFFF" : "transparent", // 👈 fondo activo
              }}
            >
              {icon}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) =>
        isLoggedInmock ? <FloatingTabBar {...props} /> : null
      }
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <IconoHome color={color} size={size} />
          ),
        }}
      />

      <Tabs.Protected guard={isLoggedInmock}>
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            // TODO: pon tu icono real:
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: 6,
                  backgroundColor: color,
                  opacity: 0.9,
                }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            // TODO: pon tu icono real:
            tabBarIcon: ({ color, size }) => (
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: 999,
                  backgroundColor: color,
                  opacity: 0.9,
                }}
              />
            ),
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}
