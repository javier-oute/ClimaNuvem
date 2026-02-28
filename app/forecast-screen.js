import EditableField from "@/components/editableField";
import { ShareForecastButton } from "@/components/forecast/forecast-buttons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  View,
} from "react-native";
import { DownloadPhotoButton, SaveButton } from "../components/buttons";
import "../global.css";
import { useShareForecast } from "../hooks/useShareForecast";
import { formatProbability } from "../lib/format";
import { saveForecastWithPhoto } from "../stores/forecast.store";

export default function ConfirmForecast() {
  const params = useLocalSearchParams();
  const image = typeof params.imageUri === "string" ? params.imageUri : "";
  const source = typeof params.source === "string" ? params.source : "gallery";
  const latStr = typeof params.lat === "string" ? params.lat : "";
  const lonStr = typeof params.lon === "string" ? params.lon : "";

  const placeNameAuto =
    typeof params.placeNameAuto === "string" ? params.placeNameAuto : "";

  const coords =
    latStr && lonStr
      ? { latitude: Number(latStr), longitude: Number(lonStr) }
      : null;

  const snapPoints = useMemo(() => ["15%", "57%"], []);

  const [name, setName] = useState("");
  const [placeName, setPlaceName] = useState(placeNameAuto);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const forecast = "Posible lluvia en 2 horas. Nubes densas y oscuras.";
  const probability = 0.78;

  const p = formatProbability(probability);

  const onDiscard = useCallback(() => {
    router.back();
    router.replace("/(tabs)/home");
  }, []);

  const onSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const finalName = name.trim() || "Predicción";
      const finalPlace = placeName.trim();

      let placeNameSource = "none";

      if (finalPlace) {
        if (finalPlace === placeNameAuto) placeNameSource = "auto";
        else placeNameSource = "user";
      }

      await saveForecastWithPhoto({
        asset: { uri: image }, // image = imageUri string
        name: finalName,
        forecast,
        probability,
        coords: source === "camera" ? coords : null,
        placeName: finalPlace || null,
        placeNameSource,
      });

      console.log({
        finalName,
        forecast,
        probability,
        coordsToSave: source === "camera" ? coords : null,
        place_name: finalPlace || null,
        place_name_source: placeNameSource,
      });

      router.replace("/(tabs)/home");
    } catch (e) {
      Alert.alert("No se pudo guardar", e?.message ?? "Error");
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    placeName,
    placeNameAuto,
    source,
    coords,
    image,
    forecast,
    probability,
  ]);

  const { onShare } = useShareForecast({
    placeName: placeName.trim() || null,
    forecast: forecast,
    probability: probability,
  });

  /*
    if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
        <Text className="mt-2 text-slate-500">Cargando...</Text>
      </View>
    );
  }
*/

  if (!image) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-lg font-semibold">No se encontró la imagen</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerRight: () =>
            source === "gallery" ? null : <DownloadPhotoButton uri={image} />,
        }}
      />
      <Image
        source={{ uri: image }}
        className="absolute inset-0 w-full h-full"
      />

      <BottomSheet
        index={1} // empieza en el primer snap point
        snapPoints={snapPoints}
        enableDynamicSizing={false} // Mas estable
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        handleIndicatorStyle={{
          width: 44,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#CBD5E1", // slate-300
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableBlurKeyboardOnGesture
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView
          className="pt-5 px-8"
          contentContainerStyle={{ paddingBottom: 32 }} // para que no quede pegado abajo
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {/* Resultado */}
          {isLoading ? (
            <View className="items-center">
              <ActivityIndicator />
              <Text className="mt-2 text-slate-500">Generando pronóstico…</Text>
            </View>
          ) : (
            <View className="flex gap-8 items-center">
              <Text className="font-bold text-center text-3xl">
                {forecast || "-"}
              </Text>
              <View className="flex w-full items-center gap-2">
                <Text className="font-bold text-center text-2xl rounded-2xl bg-[#314468] px-3 py-1 text-white">
                  Probabilidad: {p ?? "-"}%
                </Text>
                <View className="h-2 w-80 rounded-2xl bg-slate-200 overflow-hidden">
                  <View
                    className="h-2 rounded-2xl bg-[#314468]"
                    style={{ width: `${p}%` }}
                  />
                </View>
              </View>
            </View>
          )}

          <View className="mt-8 w-80 self-center gap-4">
            <EditableField
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              autoComplete="name"
              textContentType="name"
              placeholder="Ej: Nubes negras en casa"
              autoCapitalize="words"
              maxLength={20}
            />

            <EditableField
              label="Nombre completo"
              value={placeName}
              onChangeText={setPlaceName}
              returnKeyType="next"
              autoComplete="name"
              textContentType="name"
              placeholder={
                source === "camera" ? "Lugar detectado..." : "Lugar (opcional)"
              }
              autoCapitalize="words"
              maxLength={50}
            />
          </View>
          {/* Botones */}
          <View className="flex-row gap-3 mt-10">
            <ShareForecastButton onShare={onShare} />
            <SaveButton onSave={onSave} isSaving={isSaving} />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

/* 

<DiscardForecastButton onDiscard={onDiscard} />
          <View className="flex-row mt-4">
            <SaveButton onSave={onSave} isSaving={isSaving} />
          </View>


          <Text className="mt-4 text-sm text-slate-500">Lugar</Text>
          <TextInput
            value={placeName}
            onChangeText={(t) => {
              setPlaceName(t);
            }}
            placeholder={
              source === "camera" ? "Lugar detectado..." : "Lugar (opcional)"
            }
            className="mt-2 rounded-xl border border-slate-200 px-4 py-3 text-base"
          />

          <Text className="mt-2 text-xs text-slate-500">
            {source === "camera"
              ? coords
                ? "Se guardarán coordenadas (foto de cámara)."
                : "Sin coords: se guardará sin coordenadas."
              : "Foto de galería: no se guardan coordenadas automáticamente."}
          </Text>

*/
