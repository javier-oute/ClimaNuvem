import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import "../global.css";

export default function ItemDetail({ params }) {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-auto items-center justify-center p-4">
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "yellow" },
          headerTintColor: "black",
          headerTitle: `Item ${id}`,
          headerLeft: () => {},
        }}
      />
      <Text className="text-lg font-semibold">Item Detail Page </Text>
      <Text className="mt-2">Id: {id}</Text>
      <Link href="/" className="mt-4 text-black underline">
        Go to Home Page
      </Link>
    </View>
  );
}
