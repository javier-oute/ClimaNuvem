import { EditableBottomSheetField } from "@/components/editableField";
import {
  PublishForecastButton,
  ShareForecastButton,
} from "@/components/forecast/forecast-buttons";
import { publishPrediction } from "@/lib/communityMap";
import { forecastTitleKey } from "@/lib/forecast/model-meta";
import { ReliabilityRow } from "@/components/forecast/reliability-row";
import { useT } from "@/lib/i18n";
import { promptMapPublishConsent } from "@/lib/mapConsent";
import { tryGetCoordsAndPlace } from "@/lib/location";
import { selectIsLoggedIn, useAuthStore } from "@/stores/auth.store";
import { hasMapPublishConsent } from "@/stores/settings.store";
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingHeaderButton } from "@/components/floating-header-button";
import { BackIcon } from "@/components/icons";
import { PlainStateHeader } from "@/components/plain-state-header";
import {
  FullscreenImageViewer,
  ImageZoomHint,
} from "@/components/fullscreen-image-viewer";
import { DownloadPhotoButton, SaveButton } from "../components/buttons";
import "../global.css";
import { useModel } from "../hooks/useModel";
import { useShareForecast } from "../hooks/useShareForecast";
import { saveForecastWithPhoto } from "../stores/forecast.store";

export default function ConfirmForecast() {
  const params = useLocalSearchParams();
  const image = typeof params.imageUri === "string" ? params.imageUri : "";
  const source = typeof params.source === "string" ? params.source : "gallery";
  const latStr = typeof params.lat === "string" ? params.lat : "";
  const lonStr = typeof params.lon === "string" ? params.lon : "";

  const [topBlockH, setTopBlockH] = useState(0);
  const [bottomBlockH, setBottomBlockH] = useState(0);

  const t = useT();
  const { colorScheme } = useColorScheme();

  // Modo invitado: sin sesión no se puede guardar ni publicar. Solo se muestra el
  // resultado y el botón de compartir.
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();

  const placeNameAuto =
    typeof params.placeNameAuto === "string" ? params.placeNameAuto : "";

  const animationConfigs = useBottomSheetSpringConfigs({
    stiffness: 300,
    damping: 35,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.5,
    restSpeedThreshold: 0.5,
  });

  // Coordenadas que pudieran venir por params (hoy solo si en el futuro se vuelve
  // a pasar desde el botón). En cámara llegan más tarde vía GPS (ver efecto abajo).
  const coordsFromParams = useMemo(
    () =>
      latStr && lonStr
        ? { latitude: Number(latStr), longitude: Number(lonStr) }
        : null,
    [latStr, lonStr],
  );
  const [coords, setCoords] = useState(coordsFromParams);
  // Nombre de lugar auto-detectado (referencia para marcar placeNameSource).
  const [autoPlace, setAutoPlace] = useState(placeNameAuto);
  // Marca si el usuario ha tocado el campo de lugar (para no pisar lo que escriba
  // cuando el GPS resuelva tarde).
  const placeEdited = useRef(false);

  // bottomConstant: ajusta el snap colapsado (debe verse hasta la fiabilidad). Si la fiabilidad
  // queda cortada, súbelo; si asoma el aviso "poco fiable" de debajo, bájalo.
  const bottomConstant = Platform.OS === "ios" ? 48 : 78;
  const topConstant = Platform.OS === "ios" ? 90 : 140;

  const snapPoints = useMemo(() => {
    const collapsed = bottomBlockH + bottomConstant;
    const maxExpanded = Math.round(windowH * 0.68); // techo ~68% de la pantalla
    const expanded = Math.min(topBlockH + topConstant, maxExpanded);
    return [collapsed, Math.max(expanded, collapsed + 1)];
  }, [bottomBlockH, topBlockH, bottomConstant, topConstant, windowH]);

  const [name, setName] = useState("");
  const [placeName, setPlaceName] = useState(placeNameAuto);
  const [description, setDescription] = useState("");

  // Ubicación en segundo plano: solo para fotos de cámara y solo si no vino ya por
  // params. No bloquea la pantalla de carga ni la inferencia; cuando resuelve,
  // rellena las coords (habilita publicar) y el campo de lugar (si no se ha tocado).
  useEffect(() => {
    if (source !== "camera" || coordsFromParams) return;
    let cancelled = false;
    (async () => {
      const loc = await tryGetCoordsAndPlace();
      if (cancelled || !loc) return;
      setCoords(loc.coords);
      setAutoPlace(loc.placeNameAuto);
      if (!placeEdited.current && loc.placeNameAuto) {
        setPlaceName(loc.placeNameAuto);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, coordsFromParams]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  // Visor de la foto a pantalla completa (se abre tocando el fondo).
  const [viewerOpen, setViewerOpen] = useState(false);

  /*
  const forecast = "Posible lluvia en 2 horas. Nubes densas y oscuras.";
  const probability = 0.78;
  */

  const { resultado, cargando, error } = useModel(image);

  // Loading derivado directamente del hook: así el PRIMER frame de la pantalla
  // ya es la vista de carga (antes un useEffect lo activaba un render tarde).
  const isLoading = cargando;

  // El top-1 siempre manda (sin escalado). El tono/banda solo modulan el mensaje y la UI.
  const tone = resultado?.tone ?? null;
  // Fallo de inferencia (decodificar/ejecutar el modelo): se trata como "repetir foto"
  // con un mensaje de error, en vez de mostrar un resultado vacío ("-").
  const hasError = !!error;
  const isRetake = resultado?.action === "retake";
  const clase = resultado?.clase ?? null;
  const confianza = resultado?.confianza ?? 0;
  const reliability = resultado?.reliability ?? null;
  const messageBand = resultado?.messageBand ?? reliability;
  const isLowBand = reliability === "baja";

  // Recomendación graduada por banda (la descripción la da el título).
  const recommendation =
    clase && messageBand ? t(`alerts.${clase}.mensaje.${messageBand}`) : null;

  const onSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const finalName = name.trim() || t("forecast.defaultName");
      const finalPlace = placeName.trim();

      let placeNameSource = "none";

      if (finalPlace) {
        if (finalPlace === autoPlace) placeNameSource = "auto";
        else placeNameSource = "user";
      }

      await saveForecastWithPhoto({
        asset: { uri: image },
        name: finalName,
        forecast: clase, // clave de clase top-1, no el mensaje traducido
        probability: confianza,
        coords: source === "camera" ? coords : null,
        placeName: finalPlace || null,
        placeNameSource,
        description: description.trim() || null,
      });

      router.replace("/(tabs)/home");
    } catch (e) {
      Alert.alert(t("forecast.saveError"), e?.message ?? "Error");
    } finally {
      setIsSaving(false);
    }
  }, [
    name,
    placeName,
    autoPlace,
    source,
    coords,
    image,
    clase,
    confianza,
    description,
    t,
  ]);

  // Solo se puede publicar una foto tomada en el momento (cámara), con coordenadas, clasificable y con
  // fiabilidad NO baja (no se avisa a la comunidad con una detección poco fiable).
  const canPublish =
    source === "camera" &&
    !!coords &&
    !isRetake &&
    !!clase &&
    clase !== "foto_invalida" &&
    reliability !== null &&
    reliability !== "baja";

  // Guarda en historial y publica en el mapa. La ubicación se snapea en servidor (~2 km).
  const doPublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      const finalName = name.trim() || t("forecast.defaultName");
      const finalPlace = placeName.trim();
      let placeNameSource = "none";
      if (finalPlace) {
        placeNameSource = finalPlace === autoPlace ? "auto" : "user";
      }
      const finalDescription = description.trim() || null;

      // 1) Guardar en historial (sube la foto una vez y devuelve id + image_path).
      const row = await saveForecastWithPhoto({
        asset: { uri: image },
        name: finalName,
        forecast: clase,
        probability: confianza,
        coords,
        placeName: finalPlace || null,
        placeNameSource,
        description: finalDescription,
      });

      // 2) Publicar en el mapa. place_name = zona auto-degradada (no lo tecleado por el usuario).
      await publishPrediction({
        forecastHistoryId: row.id,
        lat: coords.latitude,
        lon: coords.longitude,
        forecast: clase,
        probability: confianza,
        imagePath: row.image_path,
        placeName: autoPlace || null,
        description: finalDescription,
      });

      router.replace("/(tabs)/map");
    } catch (e) {
      const msg =
        e?.message === "active_publications_limit_reached"
          ? t("community.publishLimit")
          : (e?.message ?? "Error");
      Alert.alert(t("community.publishError"), msg);
    } finally {
      setIsPublishing(false);
    }
  }, [
    name,
    placeName,
    autoPlace,
    coords,
    image,
    clase,
    confianza,
    description,
    t,
  ]);

  // Aviso de consentimiento la primera vez (por dispositivo, versionado). Cancelar deja en la pantalla.
  const onPublish = useCallback(() => {
    if (hasMapPublishConsent()) {
      doPublish();
      return;
    }
    promptMapPublishConsent({ t, onAccept: doPublish });
  }, [doPublish, t]);

  // Título firme en alta confianza; dudoso (expresa incertidumbre) en media/baja.
  const forecastDisplay = clase
    ? t(forecastTitleKey(clase, reliability))
    : null;

  const { onShare } = useShareForecast({
    placeName: placeName.trim() || null,
    forecast: forecastDisplay,
    recommendation,
    reliability,
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900 px-8">
        <PlainStateHeader />
        <ActivityIndicator />
        <Text className="mt-3 text-center text-base text-slate-700 dark:text-zinc-200">
          {t("forecast.loading")}
        </Text>
        <Text className="mt-1 text-center text-sm text-slate-500 dark:text-zinc-400">
          {t("forecast.loadingHint")}
        </Text>
      </View>
    );
  }

  if (!image) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-zinc-900 p-6">
        <PlainStateHeader />
        <Text className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
          {t("forecast.notFound")}
        </Text>
      </View>
    );
  }

  // Inferencia no fiable (error de análisis, foto inválida o incoherente): pedir repetir
  // la foto en vez de mostrar una alerta engañosa o un resultado vacío. No se ofrece guardar.
  if (hasError || isRetake) {
    let retakeTitle;
    let retakeMsg;
    if (hasError) {
      retakeTitle = t("alerts.tone.errorTitulo");
      retakeMsg = t("alerts.tone.errorMensaje");
    } else if (tone === "invalida") {
      retakeTitle = t("alerts.foto_invalida.titulo");
      retakeMsg = t("alerts.foto_invalida.mensaje");
    } else {
      retakeTitle = t("alerts.tone.reintentarTitulo");
      retakeMsg = t("alerts.tone.reintentarMensaje");
    }
    return (
      <View className="flex-1">
        <Stack.Screen
          options={{
            // Android: sin header nativo; el botón de atrás va flotante. iOS intacto.
            headerShown: Platform.OS === "ios",
            headerTransparent: true,
            headerTitle: "",
            headerBackTitle: "",
            headerShadowVisible: false,
            headerTintColor: colorScheme === "dark" ? "white" : "black",
          }}
        />
        <Image
          source={{ uri: image }}
          className="absolute inset-0 w-full h-full"
        />
        {Platform.OS === "android" ? (
          <FloatingHeaderButton side="left" onPress={() => router.back()}>
            <BackIcon color="white" />
          </FloatingHeaderButton>
        ) : null}
        <View className="flex-1 justify-end">
          <View
            className="m-4 gap-4 rounded-3xl bg-white p-6 dark:bg-zinc-800"
            style={{
              marginBottom:
                16 + (Platform.OS === "android" ? insets.bottom : 0),
            }}
          >
            <Text className="text-center text-2xl font-bold text-slate-900 dark:text-zinc-100">
              {retakeTitle}
            </Text>
            <Text className="text-center text-base text-slate-600 dark:text-zinc-400">
              {retakeMsg}
            </Text>
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center justify-center rounded-3xl bg-[#314468] px-6 py-4 active:opacity-75"
            >
              <Text className="text-lg font-semibold text-white">
                {t("alerts.tone.repetirFoto")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          // Android: sin header nativo; atrás + descarga van flotantes. iOS intacto.
          headerShown: Platform.OS === "ios",
          headerTitle: "",
          headerBackTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          // iOS: descarga en el header transparente. Android: botón flotante (abajo).
          headerRight:
            Platform.OS === "ios"
              ? () =>
                  source === "gallery" ? null : (
                    <DownloadPhotoButton
                      uri={image}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  )
              : undefined,
        }}
      />
      {/* Fondo a sangre (igual que antes). Tocarlo abre el visor a pantalla completa. */}
      <Pressable
        onPress={() => setViewerOpen(true)}
        className="absolute inset-0"
      >
        <Image source={{ uri: image }} className="w-full h-full" />
      </Pressable>
      <ImageZoomHint onPress={() => setViewerOpen(true)} />
      {/* Android (sin header nativo): botones flotantes (icono blanco + sombra). */}
      {Platform.OS === "android" ? (
        <>
          <FloatingHeaderButton side="left" onPress={() => router.back()}>
            <BackIcon color="white" />
          </FloatingHeaderButton>
          {source !== "gallery" ? (
            <DownloadPhotoButton uri={image} color="white" floating />
          ) : null}
        </>
      ) : null}

      <BottomSheet
        index={1} // empieza en el primer snap point
        snapPoints={snapPoints}
        enableDynamicSizing={false} // Mas estable
        backgroundStyle={{
          backgroundColor: colorScheme === "dark" ? "#27272a" : "white",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        animationConfigs={animationConfigs}
        handleIndicatorStyle={{
          width: 44,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#CBD5E1", // slate-300
        }}
        /*
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableBlurKeyboardOnGesture
        android_keyboardInputMode="adjustPan"
        */
        keyboardBehavior={Platform.OS === "android" ? "interactive" : "none"}
        keyboardBlurBehavior={Platform.OS === "android" ? "restore" : "none"}
        enableBlurKeyboardOnGesture={Platform.OS === "android"}
        android_keyboardInputMode={
          Platform.OS === "android" ? "adjustPan" : undefined
        }
      >
        <BottomSheetScrollView
          className="pt-5 px-8"
          contentContainerStyle={{
            paddingBottom:
              insets.bottom + (Platform.OS === "android" ? 32 : 10),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={false}
        >
          <View
            onLayout={(event) => {
              const h = Math.ceil(event.nativeEvent.layout.height);
              setTopBlockH((prev) => (prev === h ? prev : h));
            }}
          >
            {/* Resultado (al renderizar aquí la carga ya ha terminado: ver el
                early-return de isLoading arriba). */}
            <View className="items-center">
              {/* Solo pronóstico + recomendación + fiabilidad se MIDEN (bottomBlockH): es lo que
                    queda visible en el snap colapsado. */}
              <View
                className="items-center gap-3"
                onLayout={(event) => {
                  const h = Math.ceil(event.nativeEvent.layout.height);
                  setBottomBlockH((prev) => (prev === h ? prev : h));
                }}
              >
                <Text className="font-bold text-center text-3xl text-slate-900 dark:text-zinc-100">
                  {forecastDisplay || "-"}
                </Text>

                {/* Recomendación graduada por banda de confianza */}
                {recommendation ? (
                  <Text className="text-center text-base text-slate-600 dark:text-zinc-300">
                    {recommendation}
                  </Text>
                ) : null}

                {/* Fiabilidad: banda de confianza, con punto de color de la clase */}
                <ReliabilityRow clase={clase} band={reliability} />
              </View>

              {/* Aviso "poco fiable" (banda baja): fuera de la medición → oculto al colapsar,
                    visible solo al ampliar. */}
              {isLowBand ? (
                <Text className="mt-3 text-center text-sm italic text-slate-500 dark:text-zinc-400">
                  {t("alerts.tone.pocoFiable")}
                </Text>
              ) : null}
            </View>
            <View>
              {/* Campos editables: solo para usuarios logueados (en invitado no se guarda ni publica) */}
              {isLoggedIn ? (
                <View className="mt-8 w-80 self-center gap-4">
                  <EditableBottomSheetField
                    label={t("forecast.name")}
                    value={name}
                    onChangeText={setName}
                    returnKeyType="next"
                    autoComplete="name"
                    textContentType="name"
                    placeholder={t("forecast.namePlaceholder")}
                    autoCapitalize="words"
                    maxLength={20}
                  />

                  <EditableBottomSheetField
                    label={t("forecast.place")}
                    value={placeName}
                    onChangeText={(v) => {
                      placeEdited.current = true;
                      setPlaceName(v);
                    }}
                    returnKeyType="done"
                    placeholder={
                      source === "camera"
                        ? t("forecast.placeCamera")
                        : t("forecast.placeGallery")
                    }
                    autoCapitalize="words"
                    maxLength={50}
                  />

                  <EditableBottomSheetField
                    label={t("forecast.description")}
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t("forecast.descriptionPlaceholder")}
                    multiline
                    maxLength={280}
                    style={{ minHeight: 88, textAlignVertical: "top" }}
                  />
                  <Text className="text-xs text-slate-400 dark:text-zinc-500 -mt-2">
                    {t("forecast.descriptionHint")}
                  </Text>
                </View>
              ) : null}
              {/* Botones */}
              {!isLoggedIn ? (
                // Invitado: solo compartir, a ancho completo.
                <View className="flex-row mt-10">
                  <ShareForecastButton onShare={onShare} />
                </View>
              ) : canPublish ? (
                <>
                  <View className="flex-row gap-3 mt-10">
                    <ShareForecastButton onShare={onShare} />
                    <PublishForecastButton
                      onPublish={onPublish}
                      isPublishing={isPublishing}
                    />
                  </View>
                  <View className="flex-row mt-3">
                    <SaveButton onSave={onSave} isSaving={isSaving} />
                  </View>
                </>
              ) : (
                <View className="flex-row gap-3 mt-10">
                  <ShareForecastButton onShare={onShare} />
                  <SaveButton onSave={onSave} isSaving={isSaving} />
                </View>
              )}
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
      <FullscreenImageViewer
        visible={viewerOpen}
        uri={image}
        onClose={() => setViewerOpen(false)}
      />
    </View>
  );
}

/*


import { EditableBottomSheetField } from "@/components/editableField";
import { ShareForecastButton } from "@/components/forecast/forecast-buttons";
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

  const { height: windowH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  /*
  const [contentH, setContentH] = useState(0);

  const onContentLayout = useCallback((e) => {
    const h = Math.ceil(e.nativeEvent.layout.height);
    setContentH((prev) => (prev === h ? prev : h));
  }, []);


  const placeNameAuto =
    typeof params.placeNameAuto === "string" ? params.placeNameAuto : "";

  const animationConfigs = useBottomSheetSpringConfigs({
    stiffness: 450,
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
  });

  const coords =
    latStr && lonStr
      ? { latitude: Number(latStr), longitude: Number(lonStr) }
      : null;

  //const snapPoints = useMemo(() => ["15%", "57%"], []);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const snapPoints = useMemo(() => {
    const usableH = windowH - insets.top;

    // Extra fijo en Android para compensar visualmente la navbar
    const ANDROID_NAV_EQUIVALENT = Platform.OS === "android" ? 28 : 0;

    const minSheet = clamp(Math.round(usableH * 0.22), 160, 230);

    const midSheet = clamp(
      Math.round(usableH * 0.58) + ANDROID_NAV_EQUIVALENT,
      420,
      Math.round(usableH * 0.72),
    );

    return [minSheet, midSheet];
  }, [windowH, insets.top]);

  const bottomContentPadding =
    insets.bottom + (Platform.OS === "android" ? 28 : 16);

  const [name, setName] = useState("");
  const [placeName, setPlaceName] = useState(placeNameAuto);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const forecast = "Posible lluvia en 2 horas. Nubes densas y oscuras.";
  const probability = 0.78;

  const p = formatProbability(probability);
  /*
  const onDiscard = useCallback(() => {
    router.back();
    //router.replace("/(tabs)/home");
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
            source === "gallery" ? null : (
              <DownloadPhotoButton
                uri={image}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            ),
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
        animationConfigs={animationConfigs}
        handleIndicatorStyle={{
          width: 44,
          height: 5,
          borderRadius: 999,
          backgroundColor: "#CBD5E1", // slate-300
        }}
        /*
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableBlurKeyboardOnGesture
        android_keyboardInputMode="adjustPan"
        
        keyboardBehavior={Platform.OS === "android" ? "interactive" : "none"}
        keyboardBlurBehavior={Platform.OS === "android" ? "restore" : "none"}
        enableBlurKeyboardOnGesture={Platform.OS === "android"}
        android_keyboardInputMode={
          Platform.OS === "android" ? "adjustPan" : undefined
        }
      >
        <BottomSheetScrollView
          className="pt-5 px-8"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          contentContainerStyle={{
            paddingBottom: bottomContentPadding,
          }}
          keyboardSho
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={false}
        >
          <View>
            {isLoading ? (
              <View className="items-center">
                <ActivityIndicator />
                <Text className="mt-2 text-slate-500">
                  Generando pronóstico…
                </Text>
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
              <EditableBottomSheetField
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

              <EditableBottomSheetField
                label="Nombre completo"
                value={placeName}
                onChangeText={setPlaceName}
                returnKeyType="next"
                autoComplete="name"
                textContentType="name"
                placeholder={
                  source === "camera"
                    ? "Lugar detectado..."
                    : "Lugar (opcional)"
                }
                autoCapitalize="words"
                maxLength={50}
              />
            </View>
            <View className="flex-row gap-3 mt-10">
              <ShareForecastButton onShare={onShare} />
              <SaveButton onSave={onSave} isSaving={isSaving} />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}




 onLayout={onContentLayout}

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
