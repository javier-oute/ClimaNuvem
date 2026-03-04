import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: "ClimaNuvem",
        headerBackVisible: false,
        gestureEnabled: false,
      }}
    />
  );
  //return <Stack screenOptions={{ headerShown: false }} />;
}
