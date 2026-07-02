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
import { BottomSheetKeyboardAwareScrollView } from "@/components/bottom-sheet-keyboard-aware-scroll-view";
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

// Android: scroll que mantiene el input sobre el teclado (keyboard-controller); iOS usa el scroll normal del sheet.
const FormScrollView =
  Platform.OS === "android"
    ? BottomSheetKeyboardAwareScrollView
    : BottomSheetScrollView;

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

  // Modo invitado: sin sesión no se guarda ni publica; solo resultado y compartir.
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

  // Coordenadas que pudieran venir por params; en cámara llegan más tarde por GPS (ver efecto abajo).
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
  // Marca si el usuario tocó el campo de lugar (para no pisar lo que escriba cuando el GPS resuelva tarde).
  const placeEdited = useRef(false);

  // bottomConstant: ajusta el snap colapsado (debe verse hasta la fiabilidad).
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

  // Ubicación en segundo plano (solo cámara y si no vino por params): al resolver rellena coords (habilita publicar) y lugar.
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

  const { resultado, cargando, error } = useModel(image);

  // Loading derivado directamente del hook: el primer frame ya es la vista de carga.
  const isLoading = cargando;

  // El top-1 siempre manda (sin escalado). El tono/banda solo modulan el mensaje y la UI.
  const tone = resultado?.tone ?? null;
  // Fallo de inferencia: se trata como 'repetir foto' con mensaje de error, no un resultado vacío.
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

  // Solo se publica una foto de cámara con coordenadas, clasificable y con fiabilidad no baja.
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

  // Inferencia no fiable (error, foto inválida o incoherente): pedir repetir foto, sin ofrecer guardar.
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
        // El teclado lo gestiona el scroll, no el sheet (Android keyboard-controller / iOS insets); por eso 'none'.
        keyboardBehavior="none"
      >
        <FormScrollView
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
          // Android (keyboard-controller): separación entre el input enfocado y el teclado.
          bottomOffset={Platform.OS === "android" ? 24 : undefined}
          showsVerticalScrollIndicator={false}
        >
          <View
            onLayout={(event) => {
              const h = Math.ceil(event.nativeEvent.layout.height);
              setTopBlockH((prev) => (prev === h ? prev : h));
            }}
          >
            {/* Resultado (aquí la carga ya terminó, ver el early-return de isLoading arriba). */}
            <View className="items-center">
              {/* Solo pronóstico + recomendación + fiabilidad se miden (bottomBlockH): lo visible en el snap colapsado. */}
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

              {/* Aviso poco fiable (banda baja): fuera de la medición, visible solo al ampliar. */}
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
                  {/* Aviso solo si la predicción es publicable. */}
                  {canPublish ? (
                    <Text className="text-xs text-slate-400 dark:text-zinc-500 -mt-2">
                      {t("forecast.descriptionHint")}
                    </Text>
                  ) : null}
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
        </FormScrollView>
      </BottomSheet>
      <FullscreenImageViewer
        visible={viewerOpen}
        uri={image}
        onClose={() => setViewerOpen(false)}
      />
    </View>
  );
}
