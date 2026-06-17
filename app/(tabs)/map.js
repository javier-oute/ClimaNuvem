import { tryGetCoordsAndPlace } from "@/lib/location";
import { getNearbyPredictions } from "@/services/communityMap.mock";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import "../../global.css";

const SANTIAGO = { latitude: 42.8782, longitude: -8.5448 };

const DEFAULT_REGION = {
  ...SANTIAGO,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

const FORECAST_COLORS = {
  cielo_despejado: "#1D9E75",
  nubes_altas_medias: "#378ADD",
  lenticular_viento: "#EF9F27",
  cubierto_precipitacion: "#EF9F27",
  niebla_stratus: "#E24B4A",
  conveccion_desarrollo: "#E24B4A",
  tormenta: "#7F77DD",
  foto_invalida: "#888888",
};

export default function MapScreen() {
  const mapRef = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Carga inmediata con fallback a Santiago para que el mapa no quede vacío
    setPredictions(getNearbyPredictions(SANTIAGO.latitude, SANTIAGO.longitude));

    tryGetCoordsAndPlace().then((result) => {
      if (cancelled || !result?.coords) return;

      const { coords } = result;
      setLocationGranted(true);
      setPredictions(getNearbyPredictions(coords.latitude, coords.longitude));
      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.5, longitudeDelta: 0.5 },
        800,
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const onMarkerPress = useCallback((id) => {
    router.push(`/map-prediction/${id}`);
  }, []);

  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={DEFAULT_REGION}
      showsUserLocation={locationGranted}
      showsMyLocationButton={locationGranted}
    >
      {predictions.map((item) => (
        <Marker
          key={item.id}
          coordinate={{ latitude: item.lat, longitude: item.lon }}
          pinColor={FORECAST_COLORS[item.forecast] ?? "#888888"}
          onPress={() => onMarkerPress(item.id)}
        />
      ))}
    </MapView>
  );
}
