import { MapLegend, OWN_PIN_COLOR } from "@/components/map/map-legend";
import { StateMessage } from "@/components/state-message";
import { getActivePredictions } from "@/lib/communityMap";
import { RISK_COLORS } from "@/lib/forecast/model-meta";
import { useT } from "@/lib/i18n";
import { tryGetCoordsAndPlace } from "@/lib/location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import "../../global.css";

const SANTIAGO = { latitude: 42.8782, longitude: -8.5448 };

const DEFAULT_REGION = {
  ...SANTIAGO,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [locationGranted, setLocationGranted] = useState(false);
  // "loading" mientras se piden datos, "ready" al recibirlos, "error" si falla el fetch.
  // Distinguir error de vacío evita mostrar un mapa "vacío" cuando en realidad falló la red.
  const [status, setStatus] = useState("loading");

  // Carga de datos (independiente del GPS). Reutilizable desde el foco y desde "Reintentar".
  const loadPredictions = useCallback(async () => {
    setStatus("loading");
    try {
      const rows = await getActivePredictions();
      setPredictions(rows);
      setStatus("ready");
    } catch (e) {
      console.error("Error cargando predicciones del mapa:", e);
      setPredictions([]);
      setStatus("error");
    }
  }, []);

  // Carga al enfocar la tab (sin pull-to-refresh ni polling, Q31). Sin filtro de distancia: se cargan
  // TODAS las publicaciones activas (con pocos usuarios un radio dejaría el mapa casi vacío). La
  // ubicación es opcional y solo sirve para centrar la vista; aunque no haya GPS se ven los pins.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      // 1) Datos: independientes del GPS.
      loadPredictions();

      // 2) Ubicación: solo para centrar el mapa y mostrar el punto azul del usuario.
      (async () => {
        const result = await tryGetCoordsAndPlace();
        if (cancelled || !result?.coords) return;
        setLocationGranted(true);
        mapRef.current?.animateToRegion(
          { ...result.coords, latitudeDelta: 0.5, longitudeDelta: 0.5 },
          800,
        );
      })();

      return () => {
        cancelled = true;
      };
    }, [loadPredictions]),
  );

  const onMarkerPress = useCallback((id) => {
    router.push(`/map-prediction/${id}`);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={locationGranted}
        // En Android, Google Maps dibuja estos controles arriba a la derecha sin respetar los
        // márgenes; se ocultan. En iOS se mantiene el comportamiento por defecto.
        showsMyLocationButton={
          Platform.OS === "android" ? false : locationGranted
        }
        showsCompass={Platform.OS !== "android"}
        toolbarEnabled={Platform.OS !== "android"}
      >
        {predictions.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.lat, longitude: item.lon }}
            pinColor={
              item.is_mine
                ? OWN_PIN_COLOR
                : (RISK_COLORS[item.forecast] ?? "#888888")
            }
            onPress={() => onMarkerPress(item.id)}
          />
        ))}
      </MapView>
      <MapLegend />

      {/* Estado de carga: chip discreto arriba, no bloquea el mapa. */}
      {status === "loading" ? (
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 items-center"
          style={{ top: insets.top + 12 }}
        >
          <View className="flex-row items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow dark:bg-zinc-800/90">
            <ActivityIndicator size="small" />
            <Text className="text-sm text-slate-700 dark:text-zinc-200">
              {t("community.loading")}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Vacío real (cargó bien pero no hay publicaciones): tarjeta informativa centrada.
          box-none deja seguir moviendo el mapa por detrás. */}
      {status === "ready" && predictions.length === 0 ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="mx-8 rounded-3xl bg-white/95 px-6 py-6 shadow-lg dark:bg-zinc-800/95">
            <StateMessage
              fill={false}
              title={t("community.mapEmptyTitle")}
              subtitle={t("community.mapEmptySubtitle")}
            />
          </View>
        </View>
      ) : null}

      {/* Error de carga: tarjeta con "Reintentar" (distinta del vacío). */}
      {status === "error" ? (
        <View
          pointerEvents="box-none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="mx-8 rounded-3xl bg-white/95 px-6 py-6 shadow-lg dark:bg-zinc-800/95">
            <StateMessage
              fill={false}
              title={t("community.mapErrorTitle")}
              subtitle={t("community.mapErrorSubtitle")}
              actionLabel={t("buttons.retry")}
              onAction={loadPredictions}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
