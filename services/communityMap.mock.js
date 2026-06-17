function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ago(hours) {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function addHours(isoDate, hours) {
  return new Date(new Date(isoDate).getTime() + hours * 3_600_000).toISOString();
}

const p1 = ago(1);
const p2 = ago(2);
const p3 = ago(3);
const p4 = ago(4);
const p5 = ago(0.5);
const p6 = ago(7); // caducada
const p7 = ago(5); // activa pero fuera del radio (O Cebreiro)

const MOCK_PREDICTIONS = [
  {
    id: "mock-1",
    forecast: "conveccion_desarrollo",
    probability: 0.78,
    name: "Nubes amenazadoras al norte",
    lat: 42.92,
    lon: -8.55,
    place_name: "Monte Pedroso, Santiago",
    published_at: p1,
    expires_at: addHours(p1, 6),
    is_anonymous: false,
    alias: "Javier",
  },
  {
    id: "mock-2",
    forecast: "tormenta",
    probability: 0.91,
    name: "Tormenta sobre el mar",
    lat: 42.85,
    lon: -8.7,
    place_name: "Costa da Morte",
    published_at: p2,
    expires_at: addHours(p2, 6),
    is_anonymous: true,
    alias: null,
  },
  {
    id: "mock-3",
    forecast: "niebla_stratus",
    probability: 0.65,
    name: "Niebla baja en el valle",
    lat: 42.65,
    lon: -8.5,
    place_name: "Cuntis, Pontevedra",
    published_at: p3,
    expires_at: addHours(p3, 6),
    is_anonymous: false,
    alias: "MontañeroGalego",
  },
  {
    id: "mock-4",
    forecast: "cielo_despejado",
    probability: 0.88,
    name: "Cielo limpio en la costa",
    lat: 43.1,
    lon: -8.45,
    place_name: "Ordes, A Coruña",
    published_at: p5,
    expires_at: addHours(p5, 6),
    is_anonymous: true,
    alias: null,
  },
  {
    id: "mock-5",
    forecast: "nubes_altas_medias",
    probability: 0.55,
    name: "Cirros al atardecer",
    lat: 42.82,
    lon: -8.4,
    place_name: "Boqueixón, Santiago",
    published_at: p4,
    expires_at: addHours(p4, 6),
    is_anonymous: false,
    alias: "AtmosMet",
  },
  // caducada: no debe aparecer en el mapa
  {
    id: "mock-6",
    forecast: "cubierto_precipitacion",
    probability: 0.72,
    name: "Cielo cubierto (caducada)",
    lat: 42.9,
    lon: -8.6,
    place_name: "Bertamiráns",
    published_at: p6,
    expires_at: addHours(p6, 6),
    is_anonymous: false,
    alias: "Test",
  },
  // fuera del radio de 30 km (O Cebreiro, ~135 km al este)
  {
    id: "mock-7",
    forecast: "lenticular_viento",
    probability: 0.83,
    name: "Lenticulares en O Cebreiro",
    lat: 42.7083,
    lon: -7.0398,
    place_name: "O Cebreiro, Lugo",
    published_at: p7,
    expires_at: addHours(p7, 6),
    is_anonymous: false,
    alias: "Senderista",
  },
];

export function getActivePredictions() {
  const now = Date.now();
  return MOCK_PREDICTIONS.filter((p) => new Date(p.expires_at).getTime() > now);
}

export function getNearbyPredictions(lat, lon, radiusKm = 30) {
  return getActivePredictions().filter(
    (p) => haversineKm(lat, lon, p.lat, p.lon) <= radiusKm
  );
}

export function getPredictionById(id) {
  return MOCK_PREDICTIONS.find((p) => p.id === id) ?? null;
}
