import { MapLegend, OWN_PIN_COLOR } from "@/components/map/map-legend";
import { getActivePredictions } from "@/lib/communityMap";
import { RISK_COLORS } from "@/lib/forecast/model-meta";
import { tryGetCoordsAndPlace } from "@/lib/location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import "../../global.css";

const SANTIAGO = { latitude: 42.8782, longitude: -8.5448 };

const DEFAULT_REGION = {
  ...SANTIAGO,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen() {
  const mapRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [locationGranted, setLocationGranted] = useState(false);

  // Carga al enfocar la tab (sin pull-to-refresh ni polling, Q31). Sin filtro de distancia: se cargan
  // TODAS las publicaciones activas (con pocos usuarios un radio dejaría el mapa casi vacío). La
  // ubicación es opcional y solo sirve para centrar la vista; aunque no haya GPS se ven los pins.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      // 1) Datos: independientes del GPS.
      (async () => {
        try {
          const rows = await getActivePredictions();
          if (!cancelled) setPredictions(rows);
        } catch (e) {
          console.error("Error cargando predicciones del mapa:", e);
          if (!cancelled) setPredictions([]);
        }
      })();

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
    }, []),
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
    </View>
  );
}
