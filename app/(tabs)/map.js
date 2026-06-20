import { MapLegend, OWN_PIN_COLOR } from "@/components/map/map-legend";
import { getNearbyPredictions } from "@/lib/communityMap";
import { RISK_COLORS } from "@/lib/forecast/model-meta";
import { t } from "@/lib/i18n";
import { tryGetCoordsAndPlace } from "@/lib/location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
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

  // Carga al enfocar la tab (sin pull-to-refresh ni polling, Q31). Sin ubicación: no hay pins + aviso (P14).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const result = await tryGetCoordsAndPlace();
        if (cancelled) return;

        if (!result?.coords) {
          setLocationGranted(false);
          setPredictions([]);
          Alert.alert(
            t("community.locationOffTitle"),
            t("community.locationOffMsg"),
          );
          return;
        }

        const { coords } = result;
        setLocationGranted(true);
        mapRef.current?.animateToRegion(
          { ...coords, latitudeDelta: 0.5, longitudeDelta: 0.5 },
          800,
        );

        try {
          const rows = await getNearbyPredictions(
            coords.latitude,
            coords.longitude,
          );
          if (!cancelled) setPredictions(rows);
        } catch (e) {
          console.error("Error cargando predicciones del mapa:", e);
          if (!cancelled) setPredictions([]);
        }
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
        showsMyLocationButton={locationGranted}
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
