import * as Location from "expo-location";

// OBTENER LA UBICACIÓN CON UN TIEMPO MÁXIMO DE ESPERA
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout obteniendo ubicación")), ms),
    ),
  ]);
}

async function getCoordsOrThrow({ timeoutMs = 8000 } = {}) {
  let { status } = await Location.getForegroundPermissionsAsync();

  if (status !== "granted") {
    ({ status } = await Location.requestForegroundPermissionsAsync());
  }
  if (status !== "granted") {
    throw new Error("Permiso de ubicación denegado");
  }

  const pos = await withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }),
    timeoutMs,
  );

  const coords = {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };

  let places = null;
  try {
    places = await withTimeout(Location.reverseGeocodeAsync(coords), timeoutMs);
  } catch {
    places = null;
  }

  console.log("COORDENADAS Y LUGAR OBTENIDOS:");
  console.log("-------------------");
  console.log("coords: ", coords);
  console.log("places: ", places);
  console.log("-------------------");

  return { coords, places };
}

// Devuelve { coords, placeNameAuto } o null si falla (sin romper el flujo)
export async function tryGetCoordsAndPlace() {
  try {
    const { coords, places } = await getCoordsOrThrow();
    const p = places?.[0];

    const placeNameAuto = p
      ? [p.city || p.subregion, p.region].filter(Boolean).join(", ")
      : "";

    return { coords, placeNameAuto };
  } catch {
    return null;
  }
}
